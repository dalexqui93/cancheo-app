import React, { useState, useEffect, useRef } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
import * as db from '../../database';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { XIcon } from '../../components/icons/XIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import TeamInfoView from './TeamInfoView';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { FaceSmileIcon } from '../../components/icons/FaceSmileIcon';
import { ShieldIcon } from '../../components/icons/ShieldIcon';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const MessageBubble: React.FC<{ message: ChatMessage; isOwnMessage: boolean; onReply: (message: ChatMessage) => void; onDelete: (messageId: string) => void; currentUser: Player; team: Team; }> = ({ message, isOwnMessage, onReply, onDelete, currentUser, team }) => {
    
    if (message.deleted) {
        return (
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-gray-700/50 text-gray-400 italic text-sm px-3 py-2 rounded-xl max-w-xs">
                    Mensaje eliminado
                </div>
            </div>
        );
    }

    const ReadReceipt: React.FC = () => {
        if (!isOwnMessage) return null;
        
        const isReadByAll = team.players.every(p => p.id === currentUser.id || message.readBy?.includes(p.id));
        if (isReadByAll) {
            return <DoubleCheckIcon className="w-4 h-4 text-blue-400" />;
        }
        if (message.readBy && message.readBy.length > 0) {
            return <DoubleCheckIcon className="w-4 h-4 text-gray-500" />;
        }
        return <CheckIcon className="w-4 h-4 text-gray-500" />;
    };
    
    return (
        <div className={`flex items-end gap-2 group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {!isOwnMessage && (
                 <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {message.senderProfilePicture ? <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-gray-500 m-1.5"/>}
                </div>
            )}
            <div className={`relative px-3 py-2 rounded-xl max-w-xs lg:max-w-md ${isOwnMessage ? 'bg-blue-600' : 'bg-gray-700'}`}>
                {!isOwnMessage && <p className="font-bold text-sm text-amber-400">{message.senderName}</p>}
                
                {message.replyTo && (
                    <div className="p-2 bg-black/20 rounded-lg mb-2 text-xs border-l-2 border-blue-400">
                        <p className="font-semibold text-gray-300">{message.replyTo.senderName}</p>
                        <p className="text-gray-400 truncate">{message.replyTo.text}</p>
                    </div>
                )}
                
                {message.attachment && (
                    <div className="mb-2">
                        <img src={message.attachment.dataUrl} alt={message.attachment.fileName} className="rounded-lg max-w-full h-auto"/>
                    </div>
                )}

                <p className="text-white whitespace-pre-wrap">{message.text}</p>
                
                <div className="flex items-center justify-end gap-2 text-xs text-gray-300 mt-1">
                    <span>{new Date(message.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    <ReadReceipt />
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={isOwnMessage ? { left: '-4rem' } : { right: '-4rem' }}>
                    <button onClick={() => onReply(message)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
                    {isOwnMessage && (
                        <button onClick={() => onDelete(message.id)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><TrashIcon className="w-4 h-4"/></button>
                    )}
                </div>
            </div>
        </div>
    );
};


const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, onBack, onUpdateTeam, addNotification }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }, [team.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        // Mark messages as read
        messages.forEach(message => {
            if (message.senderId !== currentUser.id && !message.readBy?.includes(currentUser.id)) {
                db.markMessageAsRead(team.id, message.id, currentUser.id);
            }
        });
    }, [messages, team.id, currentUser.id]);

    const handleSendMessage = async (attachment: { fileName: string; mimeType: string; dataUrl: string; } | null = null) => {
        if (!newMessage.trim() && !attachment) return;

        const messageData = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: newMessage,
            replyTo: replyTo ? { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } : undefined,
            attachment: attachment || undefined,
        };

        await db.addChatMessage(team.id, messageData as Omit<ChatMessage, 'id' | 'timestamp'>);
        setNewMessage('');
        setReplyTo(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                handleSendMessage({
                    fileName: file.name,
                    mimeType: file.type,
                    dataUrl: e.target?.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDeleteMessage = async (messageId: string) => {
        await db.deleteChatMessage(team.id, messageId);
    };

    const handleClearChat = () => {
        // This is a client-side only clear for this user
        // In a real app this might be a more complex feature
        setMessages(messages.filter(m => m.senderId !== 'system'));
        addNotification({type: 'info', title: 'Chat Vaciado', message: 'Los mensajes han sido borrados de tu vista.'});
    }

    if (showInfo) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setShowInfo(false)} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />
    }
    
    const canSendMessage = (team.messagingPermissions || 'all') === 'all' || team.captainId === currentUser.id;

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center p-3 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setShowInfo(true)} className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover" /> : <ShieldIcon className="w-6 h-6 text-gray-500"/>}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold text-lg truncate">{team.name}</h2>
                        <p className="text-xs text-gray-400 truncate">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>

            {/* Messages */}
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    msg.senderId === 'system' ? (
                        <div key={msg.id} className="text-center text-xs text-gray-400 my-2">
                            <span className="bg-gray-700/50 px-2 py-1 rounded-full">{msg.text}</span>
                        </div>
                    ) : (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUser.id} onReply={setReplyTo} onDelete={handleDeleteMessage} currentUser={currentUser} team={team} />
                    )
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="flex-shrink-0 p-3 bg-gray-800/80 backdrop-blur-sm border-t border-white/10">
                {replyTo && (
                    <div className="bg-gray-700 p-2 rounded-t-lg text-sm flex justify-between items-center">
                        <div className="border-l-2 border-blue-400 pl-2">
                            <p className="font-semibold text-gray-300">Respondiendo a {replyTo.senderName}</p>
                            <p className="text-gray-400 truncate">{replyTo.text}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 rounded-full hover:bg-gray-600"><XIcon className="w-4 h-4"/></button>
                    </div>
                )}
                {canSendMessage ? (
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-white"><FaceSmileIcon className="w-6 h-6"/></button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white"><PaperclipIcon className="w-6 h-6"/></button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Escribe un mensaje..."
                            className="flex-grow bg-gray-700 rounded-full px-4 py-2 text-sm border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button onClick={() => handleSendMessage()} className="p-2 text-gray-400 hover:text-white disabled:text-gray-600" disabled={!newMessage.trim()}>
                            {newMessage.trim() ? <PaperAirplaneIcon className="w-6 h-6 text-blue-500"/> : <MicrophoneIcon className="w-6 h-6"/>}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-sm text-gray-400 py-2">
                        Solo el capitán puede enviar mensajes en este chat.
                    </div>
                )}
            </footer>
        </div>
    );
};

export default TeamChatView;
