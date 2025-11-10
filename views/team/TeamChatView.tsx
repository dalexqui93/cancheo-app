
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
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
import { SearchIcon } from '../../components/icons/SearchIcon';
import { ChevronUpIcon } from '../../components/icons/ChevronUpIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';

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

interface ChatMessageBubbleProps { 
    message: ChatMessage, 
    isCurrentUser: boolean, 
    currentUser: Player,
    onReply: (message: ChatMessage) => void,
    onDelete: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void,
    onMarkAsRead: (messageId: string) => void,
    teamPlayerCount: number,
    onOpenLightbox: (imageUrl: string) => void;
    onScrollToMessage: (messageId: string) => void;
    highlightedMessageId: string | null;
    highlightTerm: string | null;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = React.memo(({ message, isCurrentUser, currentUser, onReply, onDelete, onDeleteForEveryone, onMarkAsRead, teamPlayerCount, onOpenLightbox, onScrollToMessage, highlightedMessageId, highlightTerm, isFirstInGroup, isLastInGroup }) => {
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchDelta, setTouchDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isSwiping, setIsSwiping] = useState(false);

    const getHighlightedText = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark key={i} className="bg-amber-400 text-black rounded px-0.5">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.targetTouches.length !== 1) return;
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
        setTouchDelta({ x: 0, y: 0 });
        setIsSwiping(false);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStart || e.targetTouches.length !== 1) return;

        const deltaX = e.targetTouches[0].clientX - touchStart.x;
        const deltaY = e.targetTouches[0].clientY - touchStart.y;

        if (!isSwiping) {
            if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                return;
            }
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                setIsSwiping(true);
            } else {
                setTouchStart(null);
                return;
            }
        }

        if (isSwiping) {
            e.preventDefault();
            setTouchDelta({ x: deltaX, y: deltaY });
        }
    }, [touchStart, isSwiping]);

    const handleTouchEnd = useCallback(() => {
        if (isSwiping && touchDelta.x > 50) { // Reply threshold
            onReply(message);
        }
        setTouchStart(null);
        setTouchDelta({ x: 0, y: 0 });
        setIsSwiping(false);
    }, [isSwiping, touchDelta, onReply, message]);

    const translateX = isSwiping ? Math.max(0, Math.min(80, touchDelta.x)) : 0;

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

    if (message.senderId === 'system') {
        return (
            <div className="text-center my-2">
                <span className="bg-black/30 backdrop-blur-sm text-gray-300 text-xs font-semibold py-1 px-3 rounded-full">
                    {message.text}
                </span>
            </div>
        );
    }
    
    const bubbleColor = isCurrentUser ? 'bg-amber-600 text-white' : 'bg-gray-700 text-white';
    const bubbleClasses = isCurrentUser
        ? `rounded-l-2xl ${isFirstInGroup ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLastInGroup ? 'rounded-br-sm' : 'rounded-br-md'}`
        : `rounded-r-2xl ${isFirstInGroup ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLastInGroup ? 'rounded-bl-sm' : 'rounded-bl-md'}`;
        
    const Avatar = () => (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
            {message.senderProfilePicture ? (
                <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover" />
            ) : (
                <UserIcon className="w-5 h-5 text-gray-400 m-1.5" />
            )}
        </div>
    );
    
    if (message.deleted) {
        return (
            <div ref={bubbleRef} id={message.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0.5'} group ${message.id === highlightedMessageId ? 'animate-highlight-pulse' : ''}`}>
                 {!isCurrentUser && <div className="w-8 flex-shrink-0"></div>}
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 shadow-none">
                    <p className="text-sm italic text-gray-500 flex items-center gap-2">
                        <BanIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Este mensaje fue eliminado</span>
                    </p>
                </div>
                 {isCurrentUser && (
                    <div className="relative">
                        <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <DotsVerticalIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full right-0 mb-1 w-40 bg-gray-600 rounded-md shadow-lg py-1 z-10 hidden group-focus-within:block border border-gray-500">
                            <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 transition-opacity" style={{ opacity: Math.min(1, translateX / 50) }}>
                <ArrowUturnLeftIcon className="w-6 h-6 text-white" />
            </div>
            <div 
                id={message.id}
                className={`flex items-end gap-2 group ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0.5'} ${message.id === highlightedMessageId ? 'animate-highlight-pulse rounded-2xl' : ''}`}
                style={{ 
                    transform: `translateX(${translateX}px)`, 
                    transition: !touchStart ? 'transform 0.2s ease-out' : 'none' 
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {!isCurrentUser && (
                    <div className="w-8 flex-shrink-0">
                        {isLastInGroup && <Avatar />}
                    </div>
                )}
                <div ref={bubbleRef} className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-2 relative shadow-none ${bubbleColor} ${bubbleClasses}`}>
                        {!isCurrentUser && isFirstInGroup && (
                            <p className="text-xs font-bold mb-1 text-amber-300">{message.senderName}</p>
                        )}
                        {message.replyTo && (
                            <button onClick={() => message.replyTo?.messageId && onScrollToMessage(message.replyTo.messageId)} className="w-full text-left mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50 cursor-pointer hover:bg-black/30">
                                <p className="text-xs font-bold">{message.replyTo.senderName}</p>
                                <p className="text-xs opacity-80 truncate">{message.replyTo.text}</p>
                            </button>
                        )}
                        {message.attachment && (
                            <div className="my-2">
                                {message.attachment.mimeType.startsWith('image/') ? (
                                    <img src={message.attachment.dataUrl} alt={message.attachment.fileName} className="rounded-lg max-w-64 h-auto cursor-pointer" onClick={() => onOpenLightbox(message.attachment.dataUrl)} />
                                ) : (
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
                        {message.text && (
                            <p className="text-sm break-words">
                                {highlightTerm ? getHighlightedText(message.text, highlightTerm) : message.text}
                            </p>
                        )}
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
                            <button onClick={() => { onReply(message); (document.activeElement as HTMLElement)?.blur(); }} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Responder</button>
                            {isCurrentUser ? (
                                <button onClick={() => onDeleteForEveryone(message.id)} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-500">Eliminar para todos</button>
                            ) : (
                                <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Función para comprimir imágenes
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.75)); // Comprimir a JPEG con 75% de calidad
                } else {
                    reject(new Error('No se pudo obtener el contexto del canvas.'));
                }
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
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
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [typingUsers, setTypingUsers] = useState<Player[]>([]);

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

    const footerRef = useRef<HTMLElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const mainEl = mainRef.current;
        const footerEl = footerRef.current;
        const headerEl = headerRef.current;
        if (!mainEl || !footerEl || !headerEl) return;
    
        const observer = new ResizeObserver(() => {
            mainEl.style.paddingTop = `${headerEl.offsetHeight}px`;
            mainEl.style.paddingBottom = `${footerEl.offsetHeight}px`;
        });
    
        observer.observe(footerEl);
        observer.observe(headerEl);
    
        mainEl.style.paddingTop = `${headerEl.offsetHeight}px`;
        mainEl.style.paddingBottom = `${footerEl.offsetHeight}px`;
    
        return () => observer.disconnect();
    }, []);
    
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [team.id]);

    useEffect(() => {
        if (!isLoading && !isSearching) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages.length, attachment, isLoading, isSearching, typingUsers]);

     useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, []);
    
    useEffect(() => {
        if (isSearching && searchTerm.length > 2) {
            const results = messages
                .filter(m => m.text && !m.deleted && m.senderId !== 'system' && m.text.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(m => m.id)
                .reverse(); // Search from newest to oldest
            setSearchResults(results);
            setCurrentResultIndex(results.length > 0 ? 0 : -1);
        } else {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            if (!isSearching) setHighlightedMessageId(null);
        }
    }, [searchTerm, messages, isSearching]);
    
    useEffect(() => {
        if (isSearching && currentResultIndex > -1 && searchResults.length > 0) {
            const messageId = searchResults[currentResultIndex];
            setHighlightedMessageId(messageId);
            const element = document.getElementById(messageId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isSearching, currentResultIndex, searchResults]);

    useEffect(() => {
        if (team.players.length < 2 || !db.isFirebaseConfigured) return;

        const typingTimeouts = new Map<string, number>();

        const intervalId = setInterval(() => {
            const otherPlayers = team.players.filter(p => p.id !== currentUser.id);
            if (otherPlayers.length === 0) return;

            // Randomly make a player start typing
            otherPlayers.forEach(player => {
                const isAlreadyTyping = typingTimeouts.has(player.id);
                if (!isAlreadyTyping && Math.random() < 0.1) { // 10% chance to start every 2s
                    const typingDuration = Math.random() * 4000 + 3000; // Type for 3-7 seconds
                    
                    setTypingUsers(prev => {
                        if (prev.some(u => u.id === player.id)) return prev; // Avoid duplicates
                        return [...prev, player];
                    });

                    const timeoutId = window.setTimeout(() => {
                        setTypingUsers(prev => prev.filter(u => u.id !== player.id));
                        typingTimeouts.delete(player.id);
                    }, typingDuration);
                    typingTimeouts.set(player.id, timeoutId);
                }
            });
        }, 2000);

        return () => {
            clearInterval(intervalId);
            typingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, [team.players, currentUser.id]);

    const handleOpenSearch = () => {
        setCurrentView('chat');
        setIsSearching(true);
    };
    
    const handleCloseSearch = () => {
        setIsSearching(false);
        setSearchTerm('');
        setHighlightedMessageId(null);
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    };
    
    const handleNextResult = () => {
        if (searchResults.length < 2) return;
        setCurrentResultIndex(prev => (prev + 1) % searchResults.length);
    };
    
    const handlePrevResult = () => {
        if (searchResults.length < 2) return;
        setCurrentResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    };

    const handleReply = useCallback((messageToReply: ChatMessage) => {
        setReplyingTo(messageToReply);
        (document.activeElement as HTMLElement)?.blur();
    }, []);

    const handleDeleteMessage = useCallback((messageId: string) => {
        const newDeletedIds = new Set(deletedMessageIds);
        newDeletedIds.add(messageId);
        setDeletedMessageIds(newDeletedIds);
        localStorage.setItem(`deleted_messages_${team.id}`, JSON.stringify(Array.from(newDeletedIds)));
    }, [deletedMessageIds, team.id]);

    const handleDeleteForEveryone = useCallback(async (messageId: string) => {
        try {
            await db.deleteChatMessage(team.id, messageId);
        } catch (error) {
            console.error("Error al eliminar mensaje para todos:", String(error));
        }
    }, [team.id]);

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
            replyTo: replyingTo ? { messageId: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
            attachment: messageAttachment ? { ...messageAttachment } : undefined,
            readBy: [currentUser.id],
        };
        setMessages(prev => [...prev, newMessage]);

        const { id, timestamp, readBy, ...messageData } = newMessage;
        const dataToSend: Partial<ChatMessage> = { ...messageData };
        if (!dataToSend.replyTo) delete dataToSend.replyTo;
        if (!dataToSend.attachment) delete dataToSend.attachment;
        
        setInputText('');
        setReplyingTo(null);
        setShowEmojis(false);
        setAttachment(null);
        
        try {
            await db.addChatMessage(team.id, dataToSend as Omit<ChatMessage, 'id' | 'timestamp'>);
        } catch (error) {
            console.error("Error al enviar el mensaje:", String(error));
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };
    
    const handleEmojiSelect = (emoji: string) => {
        setInputText(prev => prev + emoji);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { // 15MB limit
                addNotification({ type: 'error', title: 'Archivo muy grande', message: 'El límite para archivos es 15MB.'});
                return;
            }

            try {
                let dataUrl: string;
                if (file.type.startsWith('image/')) {
                    dataUrl = await compressImage(file);
                } else {
                    dataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target?.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                }
                setAttachment({
                    fileName: file.name,
                    mimeType: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
                    dataUrl: dataUrl,
                });
            } catch (error) {
                console.error("Error al procesar el archivo:", String(error));
                addNotification({ type: 'error', title: 'Error de Archivo', message: 'No se pudo procesar el archivo seleccionado.'});
            }
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
            mediaRecorderRef.current = new MediaRecorder(stream, { audioBitsPerSecond: 24000 }); // Reducir bitrate para compresión
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

    const handleScrollToMessage = useCallback((messageId: string) => {
        const element = document.getElementById(messageId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => {
                setHighlightedMessageId(null);
            }, 1500);
        } else {
            addNotification({type: 'info', title: 'Mensaje no encontrado', message: 'El mensaje original puede haber sido eliminado o no está cargado.'})
        }
    }, [addNotification]);

    const isCaptain = currentUser.id === team.captainId;
    const canSendMessage = !team.messagingPermissions || team.messagingPermissions === 'all' || (team.messagingPermissions === 'captain' && isCaptain);


    if (currentView === 'info') {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setCurrentView('chat')} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    return (
        <div className="relative animate-fade-in">
            {/* Header */}
            <header ref={headerRef} className="fixed top-0 left-0 right-0 flex items-center p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm z-20">
                {isSearching ? (
                    <div className="flex items-center w-full gap-2 animate-fade-in">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar en el chat..."
                            className="flex-grow w-full bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            autoFocus
                        />
                        {searchResults.length > 0 && (
                            <span className="text-sm font-mono text-gray-400 whitespace-nowrap">{currentResultIndex + 1}/{searchResults.length}</span>
                        )}
                        <button onClick={handlePrevResult} disabled={searchResults.length < 2} className="p-2 rounded-full hover:bg-gray-700 text-gray-300 disabled:opacity-50"><ChevronUpIcon className="w-5 h-5"/></button>
                        <button onClick={handleNextResult} disabled={searchResults.length < 2} className="p-2 rounded-full hover:bg-gray-700 text-gray-300 disabled:opacity-50"><ChevronDownIcon className="w-5 h-5"/></button>
                        <button onClick={handleCloseSearch} className="p-2 rounded-full hover:bg-gray-700 text-gray-300"><XIcon className="w-5 h-5"/></button>
                    </div>
                ) : (
                    <>
                        <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentView('info')} className="flex items-center flex-grow min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center flex-shrink-0">
                                {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-6 h-6 text-gray-500"/>}
                            </div>
                            <div className="text-left min-w-0">
                                <h2 className="font-bold text-lg truncate text-white">{team.name}</h2>
                                <p className="text-xs text-gray-400">{team.players.length} miembros</p>
                            </div>
                        </button>
                        <button onClick={handleOpenSearch} className="p-2 rounded-full text-gray-300 hover:text-white ml-auto">
                            <SearchIcon className="w-6 h-6" />
                        </button>
                    </>
                )}
            </header>

            {/* Messages */}
            <main ref={mainRef} className="px-4 py-4 min-h-screen">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full pt-20">
                        <SpinnerIcon className="w-8 h-8 text-amber-500" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredMessages.map((msg, index) => {
                             const prevMessage = filteredMessages[index - 1];
                             const nextMessage = filteredMessages[index + 1];
                             const isFirstInGroup = !prevMessage || prevMessage.senderId !== msg.senderId || prevMessage.senderId === 'system' || prevMessage.deleted;
                             const isLastInGroup = !nextMessage || nextMessage.senderId !== msg.senderId || nextMessage.senderId === 'system' || nextMessage.deleted;
                            return (
                                <ChatMessageBubble 
                                    key={msg.id} 
                                    message={msg} 
                                    isCurrentUser={msg.senderId === currentUser.id} 
                                    currentUser={currentUser}
                                    onReply={handleReply} 
                                    onDelete={handleDeleteMessage}
                                    onDeleteForEveryone={handleDeleteForEveryone}
                                    onMarkAsRead={handleMarkAsRead}
                                    teamPlayerCount={team.players.length}
                                    onOpenLightbox={setLightboxImage}
                                    onScrollToMessage={handleScrollToMessage}
                                    highlightedMessageId={highlightedMessageId}
                                    highlightTerm={isSearching ? searchTerm : null}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                />
                            );
                        })}
                         {typingUsers.length > 0 && (
                            <div className="flex items-end gap-2 animate-fade-in mt-2">
                                <div className="flex -space-x-2">
                                    {typingUsers.slice(0, 3).map(user => (
                                        <div key={user.id} className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden border-2 border-gray-900">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-gray-400 m-1.5" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-700 text-white flex items-center gap-1">
                                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input */}
            <footer ref={footerRef} className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm z-20">
                {canSendMessage ? (
                    <div className="container mx-auto">
                        {attachment && (
                            <div className="relative p-2 mb-2 bg-gray-700 rounded-lg flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {attachment.mimeType.startsWith('image/') ? (
                                        <img src={attachment.dataUrl} alt="preview" className="w-10 h-10 rounded object-cover" />
                                    ) : (
                                        <FileIcon className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <p className="text-sm truncate flex-grow text-white">{attachment.fileName}</p>
                                <button onClick={() => setAttachment(null)} className="p-1 rounded-full hover:bg-gray-600 flex-shrink-0">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {replyingTo && (
                            <div className="p-2 mb-2 bg-gray-700 rounded-lg border-l-4 border-amber-500 flex items-center justify-between gap-3 overflow-hidden">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">Respondiendo a {replyingTo.senderName.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-400 truncate">{replyingTo.text}</p>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="flex-shrink-0 p-1 rounded-full hover:bg-gray-600">
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
                                    <span className="font-mono text-sm text-white">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-grow w-full bg-gray-700 border-transparent rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    </div>
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
