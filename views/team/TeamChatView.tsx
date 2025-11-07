import React, { useState, useRef, useEffect } from 'react';
import type { Team, Player, ChatMessage } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { FaceSmileIcon } from '../../components/icons/FaceSmileIcon';
import { XIcon } from '../../components/icons/XIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import * as db from '../../database';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import TeamInfoView from './TeamInfoView';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import { BellSlashIcon } from '../../components/icons/BellSlashIcon';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
}

const EMOJIS = ['👍', '😂', '⚽', '🔥', '👏', '🏆', '🎉', '💪'];

const ChatMessageBubble: React.FC<{ 
    message: ChatMessage, 
    isCurrentUser: boolean, 
    onReply: (message: ChatMessage) => void,
    onDelete: (messageId: string) => void
}> = ({ message, isCurrentUser, onReply, onDelete }) => {
    const alignment = isCurrentUser ? 'items-end' : 'items-start';
    const bubbleColor = isCurrentUser ? 'bg-[var(--color-primary-600)] text-white' : 'bg-gray-700 text-white';
    const sender = isCurrentUser ? 'Tú' : message.senderName;
    
    return (
        <div className={`flex flex-col ${alignment} group`}>
            <div className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${bubbleColor} relative`}>
                    <p className="text-xs font-bold mb-1 opacity-80">{sender}</p>
                    {message.replyTo && (
                        <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50">
                            <p className="text-xs font-bold">{message.replyTo.senderName}</p>
                            <p className="text-xs opacity-80 truncate">{message.replyTo.text}</p>
                        </div>
                    )}
                    <p className="text-sm break-words">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                </div>
                <div className="relative">
                    <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        <DotsVerticalIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full right-0 mb-1 w-40 bg-gray-600 rounded-md shadow-lg py-1 z-10 hidden group-focus-within:block border border-gray-500">
                        <button onClick={() => onReply(message)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Responder</button>
                        <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, onBack, onUpdateTeam }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentView, setCurrentView] = useState<'chat' | 'info'>('chat');
    
    const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(() => {
        const stored = localStorage.getItem(`deleted_messages_${team.id}`);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [team.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleDeleteMessage = (messageId: string) => {
        const newDeletedIds = new Set(deletedMessageIds);
        newDeletedIds.add(messageId);
        setDeletedMessageIds(newDeletedIds);
        localStorage.setItem(`deleted_messages_${team.id}`, JSON.stringify(Array.from(newDeletedIds)));
    };

    const handleClearChat = () => {
        const allMessageIds = messages.map(m => m.id);
        const newDeletedIds = new Set([...deletedMessageIds, ...allMessageIds]);
        setDeletedMessageIds(newDeletedIds);
        localStorage.setItem(`deleted_messages_${team.id}`, JSON.stringify(Array.from(newDeletedIds)));
    };

    const filteredMessages = messages.filter(m => !deletedMessageIds.has(m.id));

    const handleSendMessage = async () => {
        if (inputText.trim()) {
            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const newMessage: ChatMessage = {
                id: tempId,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderProfilePicture: currentUser.profilePicture,
                text: inputText,
                timestamp: new Date(),
                replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
            };
            setMessages(prev => [...prev, newMessage]);

            const messageData = { ...newMessage };
            delete (messageData as any).id;
            delete (messageData as any).timestamp;

            setInputText('');
            setReplyingTo(null);
            setShowEmojis(false);
            
            try {
                await db.addChatMessage(team.id, messageData);
            } catch (error) {
                console.error("Error al enviar el mensaje:", String(error));
                // Revert optimistic update on failure
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
        }
    };
    
    const handleEmojiSelect = (emoji: string) => {
        setInputText(prev => prev + emoji);
    };

    const isCaptain = currentUser.id === team.captainId;
    const canSendMessage = !team.messagingPermissions || team.messagingPermissions === 'all' || (team.messagingPermissions === 'captain' && isCaptain);


    if (currentView === 'info') {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setCurrentView('chat')} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white animate-fade-in">
             {/* Header */}
            <header className="flex-shrink-0 flex items-center p-4 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setCurrentView('info')} className="flex items-center flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center flex-shrink-0">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-6 h-6 text-gray-500"/>}
                    </div>
                    <div className="text-left min-w-0">
                        <h2 className="font-bold text-lg truncate">{team.name}</h2>
                        <p className="text-xs text-gray-400">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>

            {/* Messages */}
            <main className="flex-grow p-4 overflow-y-auto">
                {isLoading ? (
                     <div className="flex justify-center items-center h-full">
                        <SpinnerIcon className="w-8 h-8 text-[var(--color-primary-500)]" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                        <p className="font-bold">¡Bienvenido al chat de {team.name}!</p>
                        <p className="text-sm mt-1">{deletedMessageIds.size > 0 ? 'Has vaciado tu historial de chat.' : 'Sé el primero en enviar un mensaje.'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map(msg => (
                            <ChatMessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.id} onReply={setReplyingTo} onDelete={handleDeleteMessage} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input */}
            <footer className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20">
                {canSendMessage ? (
                    <>
                        {replyingTo && (
                            <div className="relative p-2 mb-2 bg-gray-700 rounded-lg border-l-4 border-[var(--color-primary-500)]">
                                <p className="text-sm font-bold">Respondiendo a {replyingTo.senderName}</p>
                                <p className="text-xs text-gray-400 truncate">{replyingTo.text}</p>
                                <button onClick={() => setReplyingTo(null)} className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-600">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {showEmojis && (
                            <div className="p-2 mb-2 bg-gray-700 rounded-lg grid grid-cols-8 gap-2">
                                {EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="p-2 text-2xl rounded-lg hover:bg-gray-600 transition-colors">
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowEmojis(prev => !prev)} className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
                                <FaceSmileIcon className="w-6 h-6" />
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Escribe un mensaje..."
                                className="flex-grow w-full bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                            />
                            <button onClick={handleSendMessage} className="p-3 bg-[var(--color-primary-600)] text-white rounded-full hover:bg-[var(--color-primary-700)] shadow-sm transition-colors disabled:bg-gray-500" disabled={!inputText.trim()}>
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-gray-800 rounded-lg p-3 text-center flex items-center justify-center gap-2">
                        <BellSlashIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-400">Solo los capitanes pueden enviar mensajes.</p>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default TeamChatView;
