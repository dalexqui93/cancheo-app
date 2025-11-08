import React, { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { PaperAirplaneIcon } from '../../components/icons/PaperAirplaneIcon';
import { XIcon } from '../../components/icons/XIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import ImageLightbox from '../../components/ImageLightbox';
import * as db from '../../database';
import { timeSince } from '../../utils/timeSince';
import { UserIcon } from '../../components/icons/UserIcon';
import TeamInfoView from './TeamInfoView';
// FIX: Import ShieldIcon to resolve 'Cannot find name' error.
import { ShieldIcon } from '../../components/icons/ShieldIcon';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);
const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
);


interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const MessageStatusIcon: React.FC<{ message: ChatMessage; teamSize: number }> = ({ message, teamSize }) => {
    if (message.sending) {
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
    if (message.readBy && message.readBy.length >= teamSize -1) {
        return <DoubleCheckIcon className="w-5 h-5 text-green-400" />;
    }
    return <CheckIcon className="w-5 h-5 text-gray-400" />;
};

const formatTimestamp = (timestamp: Date | undefined) => {
    if (!timestamp || !(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
        return '';
    }
    return timestamp.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Main Component remains the same

const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, onBack, onUpdateTeam, addNotification }) => {
    // ... state and logic from your implementation
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [deletedMessages, setDeletedMessages] = useState<string[]>([]);
    const [viewInfo, setViewInfo] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
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

    const handleSendMessage = async () => {
        const text = newMessage.trim();
        if (!text && !attachment) return;

        let attachmentData: ChatMessage['attachment'] | undefined;
        if (attachment) {
            const reader = new FileReader();
            reader.readAsDataURL(attachment);
            await new Promise<void>(resolve => {
                reader.onload = () => {
                    attachmentData = {
                        fileName: attachment.name,
                        mimeType: attachment.type,
                        dataUrl: reader.result as string,
                    };
                    resolve();
                };
            });
        }
        
        const messageData: Partial<ChatMessage> = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: text,
        };

        if (replyTo) {
            messageData.replyTo = {
                messageId: replyTo.id,
                senderName: replyTo.senderName,
                text: replyTo.text,
            };
        }
        
        if (attachmentData) {
            messageData.attachment = attachmentData;
        }

        if (Object.keys(messageData).length > 0) {
            await db.addChatMessage(team.id, messageData as Omit<ChatMessage, 'id' | 'timestamp'>);
        }

        setNewMessage('');
        setReplyTo(null);
        setAttachment(null);
        setAttachmentPreview(null);
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    await db.addChatMessage(team.id, {
                        senderId: currentUser.id,
                        senderName: currentUser.name,
                        senderProfilePicture: currentUser.profilePicture,
                        text: '',
                        attachment: {
                            fileName: `audio-${Date.now()}.webm`,
                            mimeType: 'audio/webm',
                            dataUrl: base64Audio,
                        },
                    });
                };
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            addNotification({ type: 'error', title: 'Error de Micrófono', message: 'No se pudo acceder al micrófono. Revisa los permisos.' });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachment(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setAttachmentPreview(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                 setAttachmentPreview(null);
            }
        }
    };
    
    if (viewInfo) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setViewInfo(false)} onUpdateTeam={onUpdateTeam} onClearChat={() => setDeletedMessages(messages.map(m => m.id))} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 team-chat-bg">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <header className="relative z-10 flex-shrink-0 flex items-center p-3 border-b border-white/10 bg-black/30">
                <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setViewInfo(true)} className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <ShieldIcon className="w-6 h-6 text-gray-400 m-2"/>}
                    </div>
                    <div className="text-left">
                        <h2 className="font-bold text-base text-white truncate">{team.name}</h2>
                        <p className="text-xs text-gray-400 truncate">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>

            <main className="relative z-0 flex-1 overflow-y-auto p-4 space-y-4">
                {messages.filter(m => !deletedMessages.includes(m.id)).map(msg => (
                    <ChatMessageBubble key={msg.id} message={msg} currentUser={currentUser} team={team} onReply={setReplyTo} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="relative z-10 flex-shrink-0 p-3 bg-black/30 border-t border-white/10 space-y-2">
                {replyTo && (
                    <div className="bg-black/30 p-2 rounded-lg flex justify-between items-start text-sm">
                        <div className="border-l-2 border-amber-400 pl-2">
                            <p className="font-bold text-amber-400">{replyTo.senderName}</p>
                            <p className="text-gray-300 truncate">{replyTo.text}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)}><XIcon className="w-5 h-5 text-gray-400"/></button>
                    </div>
                )}
                {attachment && (
                     <div className="bg-black/30 p-2 rounded-lg flex justify-between items-start text-sm">
                        <div className="flex items-center gap-2">
                            {attachmentPreview && <img src={attachmentPreview} className="w-10 h-10 rounded object-cover" />}
                            <p className="text-gray-300 truncate">{attachment.name}</p>
                        </div>
                        <button onClick={() => { setAttachment(null); setAttachmentPreview(null); }}><XIcon className="w-5 h-5 text-gray-400"/></button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white rounded-full"><PaperclipIcon className="w-6 h-6"/></button>
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-grow bg-black/20 rounded-2xl p-3 text-white placeholder-gray-400 resize-none border-0 focus:ring-2 focus:ring-amber-500"
                        rows={1}
                        style={{maxHeight: '100px'}}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    {newMessage.trim() || attachment ? (
                        <button onClick={handleSendMessage} className="p-3 bg-amber-600 rounded-full text-white hover:bg-amber-700 transition-colors"><PaperAirplaneIcon className="w-6 h-6"/></button>
                    ) : (
                         <button onMouseDown={handleStartRecording} onMouseUp={handleStopRecording} onTouchStart={handleStartRecording} onTouchEnd={handleStopRecording} className={`p-3 rounded-full text-white transition-colors ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-amber-600 hover:bg-amber-700'}`}>
                             <MicrophoneIcon className="w-6 h-6"/>
                         </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

// Sub-component for individual chat messages
const ChatMessageBubble: React.FC<{
    message: ChatMessage;
    currentUser: Player;
    team: Team;
    onReply: (message: ChatMessage) => void;
}> = ({ message, currentUser, team, onReply }) => {

    const isSender = message.senderId === currentUser.id;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (message.senderId === 'system') {
        return (
            <div className="text-center my-2">
                <span className="bg-black/30 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">{message.text}</span>
            </div>
        )
    }
    
    if (message.deleted) {
         return (
             <div className={`flex ${isSender ? 'justify-end' : ''}`}>
                 <div className="bg-gray-700/50 text-gray-400 text-sm italic px-3 py-2 rounded-xl max-w-xs lg:max-w-md flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                     Este mensaje fue eliminado
                 </div>
             </div>
         );
    }

    return (
        <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
            {!isSender && (
                 <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                    {message.senderProfilePicture ? <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-gray-400 m-1.5"/>}
                </div>
            )}
            <div className="group relative">
                <div className={`px-4 py-2 rounded-2xl max-w-xs lg:max-w-md break-words ${isSender ? 'bg-amber-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                    {!isSender && <p className="font-bold text-sm text-amber-400">{message.senderName}</p>}
                    {message.replyTo && (
                        <div className="border-l-2 border-amber-300 pl-2 mb-1 text-sm opacity-80">
                            <p className="font-bold">{message.replyTo.senderName}</p>
                            <p className="truncate">{message.replyTo.text}</p>
                        </div>
                    )}
                    {message.text && <p>{message.text}</p>}
                    {message.attachment && (
                        <div className="mt-2">
                            {message.attachment.mimeType.startsWith('image/') && <img src={message.attachment.dataUrl} className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => {}} />}
                            {message.attachment.mimeType.startsWith('audio/') && <audio controls src={message.attachment.dataUrl} className="w-full h-10" />}
                             {!message.attachment.mimeType.startsWith('image/') && !message.attachment.mimeType.startsWith('audio/') && (
                                <a href={message.attachment.dataUrl} download={message.attachment.fileName} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30">
                                    <DocumentIcon className="w-6 h-6 text-gray-300"/>
                                    <span className="text-sm text-gray-300 truncate">{message.attachment.fileName}</span>
                                </a>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end items-center gap-1.5 mt-1">
                        <span className="text-xs text-white/70">{formatTimestamp(message.timestamp)}</span>
                        {isSender && <MessageStatusIcon message={message} teamSize={team.players.length} />}
                    </div>
                </div>

                <div className={`absolute top-0 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100 ${isSender ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'}`}>
                     <button onClick={() => onReply(message)} className="p-1.5 bg-gray-600/80 rounded-full text-white hover:bg-gray-500/80"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
                     <div className="relative">
                         <button onClick={() => setIsMenuOpen(p => !p)} className="p-1.5 bg-gray-600/80 rounded-full text-white hover:bg-gray-500/80"><DotsVerticalIcon className="w-4 h-4"/></button>
                         {isMenuOpen && (
                            <div onMouseLeave={() => setIsMenuOpen(false)} className="absolute bottom-full mb-1 bg-gray-700 rounded-md shadow-lg py-1 z-10 w-40">
                                {isSender ? (
                                    <button onClick={() => { db.deleteChatMessage(team.id, message.id); setIsMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-600">Eliminar para todos</button>
                                ): (
                                    <button className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-600">Eliminar para mí</button>
                                )}
                            </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TeamChatView;