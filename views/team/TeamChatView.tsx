import React, { useState, useEffect, useRef } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import { XIcon } from '../../components/icons/XIcon';
import * as db from '../../database';
import TeamInfoView from './TeamInfoView';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import { FaceSmileIcon } from '../../components/icons/FaceSmileIcon';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const MessageBubble: React.FC<{
    message: ChatMessage;
    isCurrentUser: boolean;
    isConsecutive: boolean;
    teamMembers: Player[];
    onReply: (message: ChatMessage) => void;
    onDelete: (messageId: string) => void;
}> = ({ message, isCurrentUser, isConsecutive, teamMembers, onReply, onDelete }) => {
    
    const sender = teamMembers.find(p => p.id === message.senderId);
    const readByOthers = message.readBy && message.readBy.length > (isCurrentUser ? 1 : 0);

    const formatTimestamp = (date: Date | any) => {
        // Firestore timestamps might need conversion
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    if (message.senderId === 'system') {
        return (
            <div className="text-center my-2">
                <span className="text-xs bg-gray-700/80 px-2 py-1 rounded-full">{message.text}</span>
            </div>
        );
    }
    
    if (message.deleted) {
         return (
            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
                <div className="max-w-xs lg:max-w-md">
                    <div className="px-3 py-2 rounded-xl bg-gray-700/50">
                        <p className="text-sm italic text-gray-400">Mensaje eliminado</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
            {!isCurrentUser && !isConsecutive && (
                 <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {sender?.profilePicture ? <img src={sender.profilePicture} alt={sender.name} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-gray-500 m-1.5"/>}
                </div>
            )}
            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'ml-8' : 'mr-8'}`}>
                {!isCurrentUser && !isConsecutive && (
                    <p className="text-xs text-gray-400 font-semibold mb-1 ml-2">{sender?.name || message.senderName}</p>
                )}
                {message.replyTo && (
                    <div className="bg-black/20 p-2 rounded-t-xl border-l-2 border-amber-400">
                        <p className="text-xs font-bold text-amber-400">{message.replyTo.senderName}</p>
                        <p className="text-xs text-gray-300 truncate">{message.replyTo.text}</p>
                    </div>
                )}
                <div className={`group relative px-3 py-2 ${isCurrentUser ? 'bg-amber-600' : 'bg-gray-700'} ${message.replyTo ? 'rounded-b-xl' : 'rounded-xl'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <div className={`text-xs text-right mt-1 flex items-center justify-end gap-1 ${isCurrentUser ? 'text-gray-200' : 'text-gray-400'}`}>
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {isCurrentUser && (readByOthers ? <DoubleCheckIcon className="w-4 h-4 text-blue-400"/> : <CheckIcon className="w-4 h-4"/>)}
                    </div>
                    <div className="absolute top-0 right-full mr-1 flex items-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onReply(message)} className="p-1 rounded-full hover:bg-white/10"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
                        {isCurrentUser && <button onClick={() => onDelete(message.id)} className="p-1 rounded-full hover:bg-white/10 text-red-400"><TrashIcon className="w-4 h-4"/></button>}
                    </div>
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

    useEffect(() => {
        const clearedTimestamp = localStorage.getItem(`chat_cleared_${team.id}`);
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            const filtered = clearedTimestamp ? fetchedMessages.filter(m => new Date(m.timestamp) > new Date(clearedTimestamp)) : fetchedMessages;
            setMessages(filtered);
        });
        return () => unsubscribe();
    }, [team.id]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: newMessage,
            ...(replyTo && { replyTo: { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } }),
        };
        await db.addChatMessage(team.id, messageData);
        setNewMessage('');
        setReplyTo(null);
    };

    const handleDeleteMessage = (messageId: string) => {
        db.deleteChatMessage(team.id, messageId);
    }
    
    const handleClearChat = () => {
        localStorage.setItem(`chat_cleared_${team.id}`, new Date().toISOString());
        setMessages([]); // Clear immediately for UI feedback
        addNotification({ type: 'info', title: 'Chat Vaciado', message: 'Tu historial de chat en este dispositivo ha sido limpiado.' });
        setShowInfo(false);
    };

    if (showInfo) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setShowInfo(false)} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
            <header className="flex-shrink-0 flex items-center p-2.5 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setShowInfo(true)} className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <ShieldIcon className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div className="min-w-0 text-left">
                        <h2 className="font-bold truncate">{team.name}</h2>
                        <p className="text-xs text-gray-400 truncate">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4">
                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const isConsecutive = prevMsg && !prevMsg.deleted && prevMsg.senderId === msg.senderId && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) < 5 * 60 * 1000;
                    return (
                        <MessageBubble 
                            key={msg.id}
                            message={msg}
                            isCurrentUser={msg.senderId === currentUser.id}
                            isConsecutive={isConsecutive}
                            teamMembers={team.players}
                            onReply={setReplyTo}
                            onDelete={handleDeleteMessage}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-3 border-t border-white/10 bg-gray-800/50 backdrop-blur-sm">
                {replyTo && (
                    <div className="bg-black/20 p-2 rounded-t-lg border-l-2 border-amber-400 flex justify-between items-center mb-2">
                        <div>
                            <p className="text-xs font-bold text-amber-400">{replyTo.senderName}</p>
                            <p className="text-xs text-gray-300 truncate">{replyTo.text}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-4 h-4"/></button>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-gray-700/80 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                        />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button className="p-1 text-gray-400 hover:text-white"><FaceSmileIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="w-11 h-11 flex-shrink-0 bg-amber-600 rounded-full flex items-center justify-center disabled:bg-gray-600">
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default TeamChatView;
