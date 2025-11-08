import React, { useState, useEffect, useRef } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
import * as db from '../../database';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import TeamInfoView from './TeamInfoView';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import { XIcon } from '../../components/icons/XIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
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

const MessageBubble: React.FC<{
    message: ChatMessage;
    isCurrentUser: boolean;
    team: Team;
    onSetReply: (message: ChatMessage) => void;
    onDelete: (message: ChatMessage) => void;
}> = ({ message, isCurrentUser, team, onSetReply, onDelete }) => {
    
    if (message.senderId === 'system') {
        return (
            <div className="text-center my-2">
                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">{message.text}</span>
            </div>
        );
    }
    
    const readCount = (message.readBy || []).filter(id => id !== message.senderId).length;
    const isReadByAll = readCount >= team.players.length - 1;

    return (
        <div className={`flex items-end gap-2 group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
             {!isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {message.senderProfilePicture ? <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-gray-400 m-1.5"/>}
                </div>
            )}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-amber-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                {!isCurrentUser && <p className="text-xs font-bold text-amber-400 mb-1">{message.senderName}</p>}
                {message.replyTo && (
                    <div className="border-l-2 border-amber-300 pl-2 mb-2 opacity-80">
                        <p className="text-xs font-bold">{message.replyTo.senderName}</p>
                        <p className="text-xs truncate">{message.replyTo.text}</p>
                    </div>
                )}
                {message.deleted ? (
                    <p className="text-sm italic text-gray-400">Mensaje eliminado</p>
                ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                )}
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    <p className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    {isCurrentUser && !message.deleted && (isReadByAll ? <DoubleCheckIcon className="w-4 h-4 text-blue-400" /> : <CheckIcon className="w-4 h-4" />)}
                </div>
            </div>
            {!message.deleted && (
                 <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onSetReply(message)} className="p-1 rounded-full hover:bg-white/10"><ArrowUturnLeftIcon className="w-4 h-4 text-gray-400"/></button>
                    {isCurrentUser && <button onClick={() => onDelete(message)} className="p-1 rounded-full hover:bg-white/10"><TrashIcon className="w-4 h-4 text-gray-400"/></button>}
                </div>
            )}
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
        const unsubscribe = db.listenToTeamChat(team.id, setMessages);
        return () => unsubscribe();
    }, [team.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        // Mark last visible message as read
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !(lastMessage.readBy || []).includes(currentUser.id)) {
            db.markMessageAsRead(team.id, lastMessage.id, currentUser.id);
        }
    }, [messages, team.id, currentUser.id]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        
        if (team.messagingPermissions === 'captain' && team.captainId !== currentUser.id) {
            addNotification({ type: 'error', title: 'Permiso denegado', message: 'Solo el capitán puede enviar mensajes en este chat.' });
            return;
        }

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
            console.error("Error sending message:", String(error));
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo enviar tu mensaje.' });
        }
    };

    const handleDeleteMessage = () => {
        if (messageToDelete) {
            db.deleteChatMessage(team.id, messageToDelete.id);
        }
        setMessageToDelete(null);
    };

    const handleClearChat = () => {
        // This is a visual-only clear for this user. A real implementation would be more complex.
        setMessages(messages.filter(m => m.senderId === 'system')); // Keep system messages
        addNotification({ type: 'info', title: 'Chat Vaciado', message: 'Los mensajes se han eliminado de tu vista.' });
    };

    if (showInfo) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setShowInfo(false)} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
            <header className="flex-shrink-0 flex items-center p-3 sm:p-4 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2 sm:mr-4">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow flex items-center gap-3 cursor-pointer" onClick={() => setShowInfo(true)}>
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover"/> : <ShieldIcon className="w-6 h-6 text-gray-400"/>}
                    </div>
                    <div>
                        <h2 className="font-bold">{team.name}</h2>
                        <p className="text-xs text-gray-400">{team.players.length} miembros</p>
                    </div>
                </div>
                <button onClick={() => setShowInfo(true)} className="p-2 rounded-full text-gray-300 hover:text-white">
                    <DotsVerticalIcon className="w-6 h-6" />
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isCurrentUser={msg.senderId === currentUser.id}
                        team={team}
                        onSetReply={setReplyTo}
                        onDelete={setMessageToDelete}
                    />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 bg-gray-800/50 backdrop-blur-sm">
                {replyTo && (
                    <div className="mb-2 p-2 bg-gray-700/50 rounded-lg flex justify-between items-start">
                        <div className="border-l-2 border-amber-400 pl-2">
                            <p className="text-xs font-bold text-amber-400">Respondiendo a {replyTo.senderName}</p>
                            <p className="text-sm truncate text-gray-300">{replyTo.text}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)}><XIcon className="w-4 h-4"/></button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full text-gray-300 hover:bg-white/10"><FaceSmileIcon className="w-6 h-6"/></button>
                    <button className="p-2 rounded-full text-gray-300 hover:bg-white/10"><PaperclipIcon className="w-6 h-6"/></button>
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        className="flex-grow bg-gray-700/50 rounded-full py-2 px-4 resize-none border-0 focus:ring-2 focus:ring-amber-500"
                        disabled={team.messagingPermissions === 'captain' && team.captainId !== currentUser.id}
                    />
                    <button onClick={handleSendMessage} className="p-2 rounded-full text-gray-300 hover:bg-white/10">
                        {newMessage.trim() ? <PaperAirplaneIcon className="w-6 h-6 text-amber-500"/> : <MicrophoneIcon className="w-6 h-6"/>}
                    </button>
                </div>
            </footer>
            
            <ConfirmationModal
                isOpen={!!messageToDelete}
                onClose={() => setMessageToDelete(null)}
                onConfirm={handleDeleteMessage}
                title="Eliminar Mensaje"
                message="¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar"
            />
        </div>
    );
};

export default TeamChatView;
