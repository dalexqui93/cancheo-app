import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo, useReducer } from 'react';
import type { Team, Player, ChatMessage, Notification, ChatItem, UserMessage, SystemMessage } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { XIcon } from '../../components/icons/XIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { ArrowUturnLeftIcon } from '../../components/icons/ArrowUturnLeftIcon';
import * as db from '../../database';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import TeamInfoView from './TeamInfoView';
import { DotsVerticalIcon } from '../../components/icons/DotsVerticalIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { DoubleCheckIcon } from '../../components/icons/DoubleCheckIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import ImageLightbox from '../../components/ImageLightbox';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { ChevronUpIcon } from '../../components/icons/ChevronUpIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import MessageInput from '../../components/team/MessageInput';

// Interfaces y tipos específicos del componente
// ... (se podrían mover a un archivo de tipos si se vuelven más complejos)

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

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

const MessageStatusIcon: React.FC<{ message: UserMessage; teamPlayerCount: number; }> = ({ message, teamPlayerCount }) => {
  if (message.id.startsWith('temp-')) {
    return <ClockIcon className="w-4 h-4 text-gray-400" aria-label="Enviando" />;
  }
  const isReadAll = message.readBy && message.readBy.length >= teamPlayerCount - 1;
  if (isReadAll) {
    return <DoubleCheckIcon className="w-5 h-5 text-green-400" aria-label="Leído por todos" />;
  }
  return <CheckIcon className="w-5 h-5 text-gray-400" aria-label="Enviado" />;
};

// ... (El resto de los componentes pequeños como MessageStatusIcon, BanIcon, etc.)

const ChatMessageBubble: React.FC<{ 
    message: UserMessage, 
    isCurrentUser: boolean, 
    onReply: (message: UserMessage) => void,
    onDelete: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void,
    onOpenLightbox: (imageUrl: string) => void,
    onScrollToMessage: (messageId: string) => void,
    highlighted: boolean,
    highlightTerm: string | null,
    isFirstInGroup: boolean,
    isLastInGroup: boolean,
    teamPlayerCount: number,
}> = React.memo(({ message, isCurrentUser, onReply, onDelete, onDeleteForEveryone, onOpenLightbox, onScrollToMessage, highlighted, highlightTerm, isFirstInGroup, isLastInGroup, teamPlayerCount }) => {
    // ... (Lógica de swipe y renderizado de la burbuja del mensaje)
    const getHighlightedText = (text: string, highlight: string) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark key={i} className="bg-amber-400 text-black rounded px-0.5">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    if (message.deleted) {
        return (
             <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-0.5 group ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}>
                 {!isCurrentUser && <div className="w-8 flex-shrink-0"></div>}
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
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
    
    const bubbleColor = isCurrentUser ? 'bg-amber-700 text-white' : 'bg-gray-700 text-white';
    
    const isFileOnlyMessage = message.attachment && !message.attachment.mimeType.startsWith('image/') && !message.text;

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

    return (
        <div className={`flex items-end gap-2 group ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0.5'} ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}>
            {!isCurrentUser && (
                <div className="w-8 flex-shrink-0">
                    {isLastInGroup && <Avatar />}
                </div>
            )}
            <div className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`max-w-xs md:max-w-md relative shadow-none ${bubbleColor} ${bubbleClasses} ${isFileOnlyMessage ? 'p-2' : 'px-4 py-2'}`}>
                    {!isCurrentUser && isFirstInGroup && (
                        <p className="text-xs font-bold mb-1 text-amber-300">{message.senderName}</p>
                    )}
                    {message.replyTo && (
                        <button onClick={() => message.replyTo?.messageId && onScrollToMessage(message.replyTo.messageId)} className="w-full text-left mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50 cursor-pointer hover:bg-black/30">
                            <p className="text-xs font-bold">{message.replyTo.senderName.split(' ')[0]}</p>
                            <p className="text-xs opacity-80 truncate">{message.replyTo.text}</p>
                        </button>
                    )}
                    {message.attachment && (
                        <div className={isFileOnlyMessage ? '' : 'my-2'}>
                            {message.attachment.mimeType.startsWith('image/') ? (
                                <img src={message.attachment.dataUrl} alt={message.attachment.fileName} className="rounded-lg max-w-64 h-auto cursor-pointer" onClick={() => onOpenLightbox(message.attachment.dataUrl)} />
                            ) : (
                                <a href={message.attachment.dataUrl} download={message.attachment.fileName} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/20 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </div>
                                    <div className="flex-grow min-w-0">
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
                        <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
    );
});


const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, onBack, onUpdateTeam, addNotification }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInfoView, setIsInfoView] = useState(false);
    const [replyingTo, setReplyingTo] = useState<UserMessage | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [team.id]);

    const handleScrollToMessage = useCallback((messageId: string) => {
        const element = messageRefs.current.get(messageId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => {
                setHighlightedMessageId(null);
            }, 1500); // Highlight for 1.5 seconds
        }
    }, []);
    
     const items = useMemo((): ChatItem[] => {
        const result: ChatItem[] = [];
        let lastDate: string | null = null;
        
        messages.forEach(message => {
            const messageDate = new Date(message.timestamp).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            if (messageDate !== lastDate) {
                result.push({ type: 'date', id: `date-${messageDate}`, timestamp: message.timestamp, date: messageDate });
                lastDate = messageDate;
            }
            if (message.type === 'system') {
                result.push(message);
            } else {
                 result.push(message as UserMessage);
            }
        });
        return result;
    }, [messages]);

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [items]);

    if (isInfoView) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setIsInfoView(false)} onUpdateTeam={onUpdateTeam} onClearChat={() => {}} />;
    }

    return (
        <div className="min-h-screen">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm z-10 sticky top-0">
                 <button onClick={onBack} className="p-2 rounded-full text-gray-300 hover:text-white mr-2">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setIsInfoView(true)} className="flex items-center flex-grow min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center flex-shrink-0">
                        {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-6 h-6 text-gray-500"/>}
                    </div>
                    <div className="text-left min-w-0">
                        <h2 className="font-bold text-lg truncate text-white">{team.name}</h2>
                        <p className="text-xs text-gray-400">{team.players.length} miembros</p>
                    </div>
                </button>
            </header>
            
            <main className="relative p-4 pb-32">
                 <div className="flex flex-col gap-1">
                    {isLoading && items.length === 0 ? (
                        <div className="absolute inset-0 flex justify-center items-center"><SpinnerIcon className="w-8 h-8 text-amber-500" /></div>
                    ) : (
                        items.map((item, index) => {
                            const prevItem = items[index - 1];
                            const nextItem = items[index + 1];
                            
                            const isFirstInGroup = !prevItem || prevItem.type !== 'user' || (item.type === 'user' && prevItem.senderId !== (item as UserMessage).senderId);
                            const isLastInGroup = !nextItem || nextItem.type !== 'user' || (item.type === 'user' && nextItem.senderId !== (item as UserMessage).senderId);
                            
                            if (item.type === 'date') {
                                return <div key={item.id} className="text-center my-3"><span className="bg-black/30 text-gray-300 text-xs font-semibold py-1 px-3 rounded-full">{item.date}</span></div>;
                            }
                            if (item.type === 'system') {
                                return (
                                    <div key={item.id} className="text-center my-2">
                                        <span className="bg-black/30 backdrop-blur-sm text-gray-200 text-xs font-semibold py-1 px-3 rounded-full shadow-md">
                                            {(item as SystemMessage).text}
                                        </span>
                                    </div>
                                );
                            }
                            // It's a UserMessage
                            return (
                                <div key={item.id} ref={el => messageRefs.current.set(item.id, el)}>
                                    <ChatMessageBubble 
                                        message={item as UserMessage}
                                        isCurrentUser={(item as UserMessage).senderId === currentUser.id}
                                        onReply={setReplyingTo}
                                        onDelete={() => {}}
                                        onDeleteForEveryone={() => {}}
                                        onOpenLightbox={() => {}}
                                        onScrollToMessage={handleScrollToMessage}
                                        highlighted={highlightedMessageId === item.id}
                                        highlightTerm={null}
                                        isFirstInGroup={isFirstInGroup}
                                        isLastInGroup={isLastInGroup}
                                        teamPlayerCount={team.players.length}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div ref={messagesEndRef} />
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-20">
                <MessageInput 
                    team={team}
                    currentUser={currentUser}
                    addNotification={addNotification}
                    replyingTo={replyingTo as UserMessage | null}
                    onCancelReply={() => setReplyingTo(null)}
                />
            </div>
        </div>
    );
};

export default TeamChatView;