import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Team, Player, ChatMessage, Notification } from '../../types';
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
import { ClockIcon } from '../../components/icons/ClockIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import { MicrophoneIcon } from '../../components/icons/MicrophoneIcon';
import { PaperclipIcon } from '../../components/icons/PaperclipIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import ImageLightbox from '../../components/ImageLightbox';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const EMOJIS = ['👍', '😂', '⚽', '🔥', '👏', '🏆', '🎉', '💪'];

const BanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


const MessageStatusIcon: React.FC<{
  message: ChatMessage;
  teamPlayerCount: number;
}> = ({ message, teamPlayerCount }) => {
  if (message.id.startsWith('temp-')) {
    return <ClockIcon className="w-4 h-4 text-gray-400" aria-label="Enviando" />;
  }

  const isReadAll = message.readBy && message.readBy.length >= teamPlayerCount - 1;

  if (isReadAll) {
    return <DoubleCheckIcon className="w-5 h-5 text-green-400" aria-label="Leído por todos" />;
  }
  
  return <CheckIcon className="w-5 h-5 text-gray-400" aria-label="Enviado" />;
};


const ChatMessageBubble: React.FC<{ 
    message: ChatMessage, 
    isCurrentUser: boolean, 
    currentUser: Player,
    onReply: (message: ChatMessage) => void,
    onDelete: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void,
    onMarkAsRead: (messageId: string) => void,
    teamPlayerCount: number,
    onOpenLightbox: (imageUrl: string) => void;
}> = ({ message, isCurrentUser, currentUser, onReply, onDelete, onDeleteForEveryone, onMarkAsRead, teamPlayerCount, onOpenLightbox }) => {
    const alignment = isCurrentUser ? 'items-end' : 'items-start';
    const bubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bubbleRef.current || isCurrentUser || message.deleted) {
            return;
        }

        const hasBeenReadByMe = message.readBy?.includes(currentUser.id);
        if (hasBeenReadByMe) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onMarkAsRead(message.id);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.8 }
        );

        observer.observe(bubbleRef.current);

        return () => {
            if (bubbleRef.current) {
                observer.unobserve(bubbleRef.current);
            }
        };
    }, [message.id, isCurrentUser, currentUser.id, message.readBy, onMarkAsRead, message.deleted]);

    if (message.deleted) {
        return (
            <div ref={bubbleRef} className={`flex flex-col ${alignment} group`}>
                <div className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
                        <p className="text-sm italic text-gray-500 flex items-center gap-2">
                            <BanIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Este mensaje fue eliminado</span>
                        </p>
                    </div>
                    <div className="relative">
                        <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <DotsVerticalIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full right-0 mb-1 w-40 bg-gray-600 rounded-md shadow-lg py-1 z-10 hidden group-focus-within:block border border-gray-500">
                            <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const bubbleColor = isCurrentUser ? 'bg-amber-600 text-white' : 'bg-gray-700 text-white';
    const sender = isCurrentUser ? 'Tú' : message.senderName;
    
    return (
        <div ref={bubbleRef} className={`flex flex-col ${alignment} group`}>
            <div className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${bubbleColor} relative`}>
                    <p className="text-xs font-bold mb-1 opacity-80">{sender}</p>
                    {message.replyTo && (
                        <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50">
                            <p className="text-xs font-bold">{message.replyTo.senderName}</p>
                            <p className="text-xs opacity-80 truncate">{message.replyTo.text}</p>
                        </div>
                    )}
                    {message.attachment && (
                        <div className="my-2">
                            {message.attachment.mimeType.startsWith('image/') && (
                                <img src={message.attachment.dataUrl} alt={message.attachment.fileName} className="rounded-lg max-w-64 h-auto cursor-pointer" onClick={() => onOpenLightbox(message.attachment.dataUrl)} />
                            )}
                            {message.attachment.mimeType.startsWith('audio/') && (
                                <audio controls src={message.attachment.dataUrl} className="w-full h-10"></audio>
                            )}
                            {!message.attachment.mimeType.startsWith('image/') && !message.attachment.mimeType.startsWith('audio/') && (
                                <a href={message.attachment.dataUrl} download={message.attachment.fileName} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30">
                                    <FileIcon className="w-8 h-8 flex-shrink-0" />
                                    <div className="truncate">
                                        <p className="font-semibold text-sm truncate">{message.attachment.fileName}</p>
                                        <p className="text-xs opacity-80">Descargar</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    )}
                    {message.text && <p className="text-sm break-words">{message.text}</p>}
                    <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end gap-1">
                        <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        {isCurrentUser && <MessageStatusIcon message={message} teamPlayerCount={teamPlayerCount} />}
                    </div>
                </div>
                <div className="relative">
                    <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        <DotsVerticalIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-full right-0 mb-1 w-40 bg-gray-600 rounded-md shadow-lg py-1 z-10 hidden group-focus-within:block border border-gray-500">
                        <button onClick={() => onReply(message)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Responder</button>
                        {isCurrentUser ? (
                            <button onClick={() => onDeleteForEveryone(message.id)} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-500">Eliminar para todos</button>
                        ) : (
                            <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, onBack, onUpdateTeam, addNotification }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const [attachment, setAttachment] = useState<{ fileName: string; mimeType: string; dataUrl: string; } | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentView, setCurrentView] = useState<'chat' | 'info'>('chat');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
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
    }, [messages, attachment]);

     useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, []);

    const handleDeleteMessage = (messageId: string) => {
        const newDeletedIds = new Set(deletedMessageIds);
        newDeletedIds.add(messageId);
        setDeletedMessageIds(newDeletedIds);
        localStorage.setItem(`deleted_messages_${team.id}`, JSON.stringify(Array.from(newDeletedIds)));
    };

    const handleDeleteForEveryone = async (messageId: string) => {
        try {
            await db.deleteChatMessage(team.id, messageId);
        } catch (error) {
            console.error("Error al eliminar mensaje para todos:", String(error));
        }
    };

    const handleClearChat = () => {
        const allMessageIds = messages.map(m => m.id);
        const newDeletedIds = new Set([...deletedMessageIds, ...allMessageIds]);
        setDeletedMessageIds(newDeletedIds);
        localStorage.setItem(`deleted_messages_${team.id}`, JSON.stringify(Array.from(newDeletedIds)));
    };

    const filteredMessages = messages.filter(m => !deletedMessageIds.has(m.id));

    const handleSendMessage = async (audioAttachment?: { fileName: string; mimeType: string; dataUrl: string; }) => {
        const messageAttachment = audioAttachment || attachment;
        if (inputText.trim() === '' && !messageAttachment) return;

        const tempId = `temp-${Date.now()}`;
        const newMessage: ChatMessage = {
            id: tempId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: inputText,
            timestamp: new Date(),
            replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
            attachment: messageAttachment ? { ...messageAttachment } : undefined,
            readBy: [currentUser.id],
        };
        setMessages(prev => [...prev, newMessage]);

        const { id, timestamp, readBy, ...messageData } = newMessage;
        Object.keys(messageData).forEach(key => (messageData as any)[key] === undefined && delete (messageData as any)[key]);
        
        setInputText('');
        setReplyingTo(null);
        setShowEmojis(false);
        setAttachment(null);
        
        try {
            await db.addChatMessage(team.id, messageData as Omit<ChatMessage, 'id' | 'timestamp'>);
        } catch (error) {
            console.error("Error al enviar el mensaje:", String(error));
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };
    
    const handleEmojiSelect = (emoji: string) => {
        setInputText(prev => prev + emoji);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('El archivo es demasiado grande. El límite es 10MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachment({
                    fileName: file.name,
                    mimeType: file.type,
                    dataUrl: event.target?.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset file input
    };

    const handleStartRecording = async (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (isRecording) return;
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasMicrophone = devices.some(device => device.kind === 'audioinput');

            if (!hasMicrophone) {
                addNotification({
                    type: 'error',
                    title: 'Micrófono no encontrado',
                    message: 'No se ha detectado un micrófono en tu dispositivo. Conecta uno para poder grabar audios.'
                });
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    handleSendMessage({
                        fileName: `audio_${Date.now()}.webm`,
                        mimeType: 'audio/webm;codecs=opus',
                        dataUrl,
                    });
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("No se pudo obtener acceso al micrófono:", err);
            
            let title = 'Error de Micrófono';
            let message = 'No se pudo acceder al micrófono. Revisa que el dispositivo esté conectado y que los permisos estén activados en tu navegador.';

            if (err instanceof DOMException) {
                if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    title = 'Micrófono no encontrado';
                    message = 'No se ha detectado un micrófono. Por favor, conecta uno e inténtalo de nuevo.';
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    title = 'Permiso denegado';
                    message = 'Has bloqueado el acceso al micrófono. Debes activarlo en los ajustes de tu navegador para grabar audios.';
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    title = 'Error de Hardware';
                    message = 'No se pudo leer desde el micrófono. Puede que esté siendo usado por otra aplicación.';
                }
            }

            addNotification({
                type: 'error',
                title: title,
                message: message
            });
        }
    };

    const handleStopRecording = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setRecordingTime(0);
        }
    };
    
    const handleMarkAsRead = useCallback(async (messageId: string) => {
        try {
            await db.markMessageAsRead(team.id, messageId, currentUser.id);
        } catch (error) {
            console.error("Failed to mark message as read:", error);
        }
    }, [team.id, currentUser.id]);

    const isCaptain = currentUser.id === team.captainId;
    const canSendMessage = !team.messagingPermissions || team.messagingPermissions === 'all' || (team.messagingPermissions === 'captain' && isCaptain);


    if (currentView === 'info') {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setCurrentView('chat')} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="flex flex-col min-h-screen text-white animate-fade-in team-chat-bg relative">
            <div className="absolute inset-0 bg-black/60 z-0"></div>
             {/* Header */}
            <header className="relative z-10 flex-shrink-0 flex items-center p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0">
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
            <main className="relative z-10 flex-grow p-4 overflow-y-auto">
                {isLoading ? (
                     <div className="flex justify-center items-center h-full">
                        <SpinnerIcon className="w-8 h-8 text-amber-500" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                        <p className="font-bold">¡Bienvenido al chat de {team.name}!</p>
                        <p className="text-sm mt-1">{deletedMessageIds.size > 0 ? 'Has vaciado tu historial de chat.' : 'Sé el primero en enviar un mensaje.'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map(msg => (
                            <ChatMessageBubble 
                                key={msg.id} 
                                message={msg} 
                                isCurrentUser={msg.senderId === currentUser.id} 
                                currentUser={currentUser}
                                onReply={setReplyingTo} 
                                onDelete={handleDeleteMessage}
                                onDeleteForEveryone={handleDeleteForEveryone}
                                onMarkAsRead={handleMarkAsRead}
                                teamPlayerCount={team.players.length}
                                onOpenLightbox={setLightboxImage}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input */}
            <footer className="relative z-10 flex-shrink-0 p-4 border-t border-white/10 bg-black/20">
                {canSendMessage ? (
                    <>
                        {attachment && (
                            <div className="relative p-2 mb-2 bg-gray-700 rounded-lg flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {attachment.mimeType.startsWith('image/') ? (
                                        <img src={attachment.dataUrl} alt="preview" className="w-10 h-10 rounded object-cover" />
                                    ) : (
                                        <FileIcon className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <p className="text-sm truncate flex-grow">{attachment.fileName}</p>
                                <button onClick={() => setAttachment(null)} className="p-1 rounded-full hover:bg-gray-600 flex-shrink-0">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {replyingTo && (
                            <div className="relative p-2 mb-2 bg-gray-700 rounded-lg border-l-4 border-amber-500">
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
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
                                <PaperclipIcon className="w-6 h-6" />
                            </button>
                            <button onClick={() => setShowEmojis(prev => !prev)} className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
                                <FaceSmileIcon className="w-6 h-6" />
                            </button>
                            
                            {isRecording ? (
                                <div className="flex-grow flex items-center justify-center gap-2 h-10 bg-gray-700 rounded-full px-4">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="font-mono text-sm">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-grow w-full bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            )}

                            {(inputText.trim() || attachment) ? (
                                <button onClick={() => handleSendMessage()} className="p-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 shadow-sm transition-colors" disabled={!inputText.trim() && !attachment}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onMouseDown={(e) => handleStartRecording(e)}
                                    onMouseUp={(e) => handleStopRecording(e)}
                                    onTouchStart={(e) => handleStartRecording(e)}
                                    onTouchEnd={(e) => handleStopRecording(e)}
                                    className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-600' : 'bg-amber-600'} text-white shadow-sm`}
                                >
                                    <MicrophoneIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-gray-800 rounded-lg p-3 text-center flex items-center justify-center gap-2">
                        <BellSlashIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-400">Solo los capitanes pueden enviar mensajes.</p>
                    </div>
                )}
            </footer>
            {lightboxImage && (
                <ImageLightbox
                    images={[lightboxImage]}
                    startIndex={0}
                    onClose={() => setLightboxImage(null)}
                />
            )}
        </div>
    );
};

export default TeamChatView;