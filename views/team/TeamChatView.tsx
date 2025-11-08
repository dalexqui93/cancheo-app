import React, { useState, useEffect, useRef } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
import * as db from '../../database';

import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { FaceSmileIcon } from '../../components/icons/FaceSmileIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import { XIcon } from '../../components/icons/XIcon';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import TeamInfoView from './TeamInfoView';
import ConfirmationModal from '../../components/ConfirmationModal';
import { timeSince } from '../../utils/timeSince';
import { ShieldIcon } from '../../components/icons/ShieldIcon';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const MessageBubble: React.FC<{
    message: ChatMessage;
    isOwn: boolean;
    isGroupStart: boolean;
    onReply: (message: ChatMessage) => void;
    onDelete: (message: ChatMessage) => void;
}> = ({ message, isOwn, isGroupStart, onReply, onDelete }) => {
    if (message.senderId === 'system') {
        return (
            <div className="text-center my-2">
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{message.text}</span>
            </div>
        );
    }
    if (message.deleted) {
        return (
            <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md p-2 rounded-lg italic text-sm ${isOwn ? 'bg-gray-700' : 'bg-gray-600'} text-gray-400`}>
                    Mensaje eliminado
                </div>
            </div>
        );
    }
    
    return (
        <div className={`flex items-end gap-2 group ${isOwn ? 'justify-end' : 'justify-start'} ${isGroupStart ? 'mt-3' : 'mt-0.5'}`}>
            {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {isGroupStart && message.senderProfilePicture ? <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover"/> : isGroupStart ? <UserIcon className="w-5 h-5 text-gray-400 m-1.5"/> : null}
                </div>
            )}
             <div className={`relative max-w-xs md:max-w-md p-2 rounded-lg ${isOwn ? 'bg-blue-600' : 'bg-gray-600'}`}>
                {isGroupStart && !isOwn && <p className="font-bold text-sm text-amber-400 mb-1">{message.senderName}</p>}
                
                {message.replyTo && (
                    <div className="border-l-2 border-blue-300 pl-2 mb-1 opacity-80">
                        <p className="font-bold text-xs">{message.replyTo.senderName}</p>
                        <p className="text-xs truncate">{message.replyTo.text}</p>
                    </div>
                )}
                
                <p className="text-white text-sm whitespace-pre-wrap">{message.text}</p>
                <div className="text-right text-xs text-gray-300 mt-1 flex justify-end items-center gap-1">
                    <span>{new Date(message.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isOwn && (message.readBy && message.readBy.length > 1 ? <DoubleCheckIcon className="w-4 h-4 text-blue-400" /> : <CheckIcon className="w-4 h-4" />)}
                </div>

                <div className="absolute top-0 right-0 -translate-y-1/2 flex items-center bg-gray-700 border border-gray-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onReply(message)} className="p-1.5 hover:bg-gray-600 rounded-l-full"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
                    {isOwn && <button onClick={() => onDelete(message)} className="p-1.5 hover:bg-gray-600 rounded-r-full"><TrashIcon className="w-4 h-4"/></button>}
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
    const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }, [team.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: newMessage,
            ...(replyTo && { replyTo: { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } }),
        };
        
        try {
            await db.addChatMessage(team.id, messageData);
            setNewMessage('');
            setReplyTo(null);
        } catch (error) {
            addNotification({type: 'error', title: 'Error', message: 'No se pudo enviar el mensaje.'});
        }
    };
    
    const handleClearChat = () => {
        // This is a local-only operation for now
        setMessages([]);
        addNotification({type: 'info', title: 'Chat Vaciado', message: 'Tu vista del chat ha sido limpiada.'});
    };

    if (showInfo) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setShowInfo(false)} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col animate-fade-in">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center p-4 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setShowInfo(true)} className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover"/> : <ShieldIcon className="w-6 h-6 text-gray-400 m-2"/>}
                    </div>
                    <div className="truncate">
                        <h2 className="font-bold truncate">{team.name}</h2>
                        <p className="text-xs text-gray-400 truncate">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>

            {/* Messages */}
            <main className="flex-grow overflow-y-auto p-4 space-y-1">
                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const isGroupStart = !prevMsg || prevMsg.senderId !== msg.senderId || (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) > 5 * 60 * 1000;
                    return (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === currentUser.id}
                            isGroupStart={isGroupStart}
                            onReply={setReplyTo}
                            onDelete={setMessageToDelete}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="flex-shrink-0 p-4 border-t border-white/10 bg-gray-800/50 backdrop-blur-sm">
                {replyTo && (
                    <div className="bg-gray-700 p-2 rounded-t-lg flex justify-between items-start">
                        <div className="border-l-2 border-blue-400 pl-2">
                            <p className="font-bold text-sm text-blue-300">{replyTo.senderName}</p>
                            <p className="text-xs text-gray-300 truncate">{replyTo.text}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1"><XIcon className="w-4 h-4"/></button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white"><FaceSmileIcon className="w-6 h-6"/></button>
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-grow bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2 text-gray-400 hover:text-white"><PaperclipIcon className="w-6 h-6"/></button>
                    <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-600">
                        <PaperAirplaneIcon className="w-6 h-6"/>
                    </button>
                </div>
            </footer>
             <ConfirmationModal
                isOpen={!!messageToDelete}
                onClose={() => setMessageToDelete(null)}
                onConfirm={() => {
                    if(messageToDelete) {
                        db.deleteChatMessage(team.id, messageToDelete.id);
                    }
                    setMessageToDelete(null);
                }}
                title="¿Eliminar mensaje?"
                message="Este mensaje se eliminará para todos. Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar para todos"
            />
        </div>
    );
};

export default TeamChatView;
