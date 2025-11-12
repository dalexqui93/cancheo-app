import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
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
import ConfirmationModal from '../../components/ConfirmationModal';
// FIX: Import the missing PinIcon component.
import { PinIcon } from '../../components/icons/PinIcon';

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

const ChatMessageBubble: React.FC<{ 
    message: UserMessage, 
    isCurrentUser: boolean, 
    onReply: (message: UserMessage) => void,
    onDelete: (messageId: string) => void,
    onDeleteForEveryone: (messageId: string) => void,
    onOpenLightbox: (imageUrl: string) => void,
    onScrollToMessage: (messageId: string) => void,
    highlighted: boolean,
    isSelected: boolean,
    showContextMenu: boolean,
    isFirstInGroup: boolean,
    isLastInGroup: boolean,
    teamPlayerCount: number,
}> = React.memo(({ message, isCurrentUser, onReply, onDelete, onDeleteForEveryone, onOpenLightbox, onScrollToMessage, highlighted, isSelected, showContextMenu, isFirstInGroup, isLastInGroup, teamPlayerCount }) => {
    
    if (message.deleted) {
        return (
             <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-0.5 group relative ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}>
                {isSelected && <div className="absolute inset-0 bg-blue-500/30 rounded-lg pointer-events-none z-10"></div>}
                 {!isCurrentUser && <div className="w-8 flex-shrink-0"></div>}
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
                    <p className="text-sm italic text-gray-500 flex items-center gap-2">
                        <BanIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Este mensaje fue eliminado</span>
                    </p>
                </div>
                 {isCurrentUser && showContextMenu && (
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
        <div className={`flex items-end gap-2 group relative ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0.5'} ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}>
            {isSelected && <div className="absolute inset-0 bg-blue-500/30 rounded-lg pointer-events-none z-10"></div>}
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
                        <p className="text-sm break-words">{message.text}</p>
                    )}
                    <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end gap-1">
                        <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isCurrentUser && <MessageStatusIcon message={message} teamPlayerCount={teamPlayerCount} />}
                    </div>
                </div>
                {showContextMenu && (
                    <div className="relative">
                        <button className="p-2 text-gray-400 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <DotsVerticalIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-full right-0 mb-1 w-48 bg-gray-600 rounded-md shadow-lg py-1 z-20 hidden group-focus-within:block border border-gray-500">
                            <button onClick={() => { onReply(message); (document.activeElement as HTMLElement)?.blur(); }} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Responder</button>
                            {isCurrentUser && (
                                <button onClick={() => onDeleteForEveryone(message.id)} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-500">Eliminar para todos</button>
                            )}
                            <button onClick={() => onDelete(message.id)} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">Eliminar para mí</button>
                        </div>
                    </div>
                )}
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
    const [deletedForMeIds, setDeletedForMeIds] = useState<Set<string>>(new Set());
    
    // State for message selection
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const isSelectionMode = selectedMessages.size > 0;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const localStorageKey = `chat-deleted-for-${currentUser.id}-${team.id}`;

    useEffect(() => {
        const storedIds = localStorage.getItem(localStorageKey);
        if (storedIds) {
            setDeletedForMeIds(new Set(JSON.parse(storedIds)));
        }
    }, [currentUser.id, team.id, localStorageKey]);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.listenToTeamChat(team.id, (fetchedMessages) => {
            setMessages(fetchedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [team.id]);
    
    const handleDeleteForMe = useCallback((messageId: string) => {
        setDeletedForMeIds(prev => {
            const newSet = new Set(prev);
            newSet.add(messageId);
            localStorage.setItem(localStorageKey, JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    }, [localStorageKey]);

    const handleClearChat = useCallback(() => {
        setDeletedForMeIds(prev => {
            const newSet = new Set(prev);
            messages.forEach(msg => newSet.add(msg.id));
            localStorage.setItem(localStorageKey, JSON.stringify(Array.from(newSet)));
            return newSet;
        });
        addNotification({type: 'info', title: 'Chat Vaciado', message: 'Los mensajes han sido eliminados solo para ti.'});
    }, [messages, localStorageKey, addNotification]);

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

    // Selection mode logic
    const toggleSelection = (messageId: string) => {
        setSelectedMessages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(messageId)) {
                newSelection.delete(messageId);
            } else {
                newSelection.add(messageId);
            }
            return newSelection;
        });
    };

    const handleLongPress = (e: React.MouseEvent, message: ChatItem) => {
        if (message.type !== 'user') return;
        e.preventDefault();
        toggleSelection(message.id);
    };

    const handleTap = (message: ChatItem) => {
        if (isSelectionMode && message.type === 'user') {
            toggleSelection(message.id);
        }
    };
    
    const handleCancelSelection = () => {
        setSelectedMessages(new Set());
    };

    const handleReplySelected = () => {
        const messageId = Array.from(selectedMessages)[0];
        const messageToReply = messages.find(m => m.id === messageId) as UserMessage;
        if (messageToReply) {
            setReplyingTo(messageToReply);
        }
        handleCancelSelection();
    };

    const handlePinSelected = () => {
        addNotification({type: 'info', title: 'Próximamente', message: 'La función de fijar mensajes estará disponible pronto.'});
        handleCancelSelection();
    };

    const handleDeleteSelected = () => {
        setShowDeleteModal(true);
    };
    
    const handleConfirmDeleteForMe = () => {
        selectedMessages.forEach(id => handleDeleteForMe(id));
        setShowDeleteModal(false);
        handleCancelSelection();
    };

    const handleConfirmDeleteForEveryone = async () => {
        try {
            const deletePromises = Array.from(selectedMessages).map(id => db.deleteChatMessage(team.id, id));
            await Promise.all(deletePromises);
            addNotification({ type: 'info', title: 'Mensajes Eliminados', message: 'Los mensajes han sido eliminados para todos.' });
        } catch (error) {
// FIX: Explicitly convert 'error' to string for logging, as 'error' is of type 'unknown' in a catch block.
            console.error("Error al eliminar mensajes:", String(error));
            addNotification({ type: 'error', title: 'Error', message: 'No se pudieron eliminar los mensajes.' });
        } finally {
            setShowDeleteModal(false);
            handleCancelSelection();
        }
    };
    
    const canDeleteForEveryone = useMemo(() => {
        if (!isSelectionMode) return false;
        return Array.from(selectedMessages).every(id => {
            const msg = messages.find(m => m.id === id);
            return msg && msg.type === 'user' && msg.senderId === currentUser.id && !msg.deleted;
        });
    }, [selectedMessages, messages, currentUser.id, isSelectionMode]);

     const items = useMemo((): ChatItem[] => {
        const filteredMessages = messages.filter(msg => !deletedForMeIds.has(msg.id));
        const result: ChatItem[] = [];
        let lastDate: string | null = null;
        
        filteredMessages.forEach(message => {
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
    }, [messages, deletedForMeIds]);

    useLayoutEffect(() => {
        if (!isSelectionMode) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [items, isSelectionMode]);

    if (isInfoView) {
        return <TeamInfoView team={team} currentUser={currentUser} onBack={() => setIsInfoView(false)} onUpdateTeam={onUpdateTeam} onClearChat={handleClearChat} />;
    }

    const Header = () => (
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
    );

    const SelectionHeader = () => (
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-blue-900/50 backdrop-blur-sm z-10 sticky top-0 animate-fade-in">
             <div className="flex items-center gap-4">
                 <button onClick={handleCancelSelection} className="p-2 rounded-full text-white hover:bg-white/10">
                    <XIcon className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg">{selectedMessages.size}</span>
             </div>
             <div className="flex items-center gap-2">
                {selectedMessages.size === 1 && (
                    <button onClick={handleReplySelected} className="p-2 rounded-full text-white hover:bg-white/10"><ArrowUturnLeftIcon className="w-6 h-6" /></button>
                )}
                <button onClick={handleDeleteSelected} className="p-2 rounded-full text-white hover:bg-white/10"><TrashIcon className="w-6 h-6" /></button>
                {selectedMessages.size === 1 && (
                    <button onClick={handlePinSelected} className="p-2 rounded-full text-white hover:bg-white/10"><PinIcon className="w-6 h-6" /></button>
                )}
             </div>
        </header>
    );

    const DeleteActionSheet: React.FC<{
        onCancel: () => void;
        onDeleteForMe: () => void;
        onDeleteForEveryone: () => void;
        showForEveryone: boolean;
    }> = ({ onCancel, onDeleteForMe, onDeleteForEveryone, showForEveryone }) => (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 animate-fade-in" onClick={onCancel}>
            <div className="w-full bg-gray-700 rounded-t-2xl p-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 bg-gray-500 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-lg mb-4">Eliminar {selectedMessages.size > 1 ? `${selectedMessages.size} mensajes` : 'mensaje'}?</h3>
                <div className="space-y-2">
                    {showForEveryone && (
                        <button onClick={onDeleteForEveryone} className="w-full text-left p-3 text-red-400 font-semibold rounded-lg hover:bg-gray-600">Eliminar para todos</button>
                    )}
                    <button onClick={onDeleteForMe} className="w-full text-left p-3 rounded-lg hover:bg-gray-600">Eliminar para mí</button>
                    <button onClick={onCancel} className="w-full text-left p-3 font-semibold rounded-lg hover:bg-gray-600 mt-2">Cancelar</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {isSelectionMode ? <SelectionHeader /> : <Header />}
            
            <main className="relative p-4 pb-32">
                 <div className="flex flex-col gap-1">
                    {isLoading && items.length === 0 ? (
                        <div className="absolute inset-0 flex justify-center items-center"><SpinnerIcon className="w-8 h-8 text-amber-500" /></div>
                    ) : (
                        items.map((item, index) => {
                            const prevItem = items[index - 1];
                            const nextItem = items[index + 1];
                            const isUserMessage = item.type === 'user';
                            
                            const isFirstInGroup = !prevItem || prevItem.type !== 'user' || (isUserMessage && prevItem.senderId !== (item as UserMessage).senderId);
                            const isLastInGroup = !nextItem || nextItem.type !== 'user' || (isUserMessage && nextItem.senderId !== (item as UserMessage).senderId);
                            
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
                                <div 
                                    key={item.id} 
                                    ref={el => messageRefs.current.set(item.id, el)}
                                    onClick={() => handleTap(item)}
                                    onContextMenu={(e) => handleLongPress(e, item)}
                                >
                                    <ChatMessageBubble 
                                        message={item as UserMessage}
                                        isCurrentUser={(item as UserMessage).senderId === currentUser.id}
                                        onReply={setReplyingTo}
                                        onDelete={handleDeleteForMe}
                                        onDeleteForEveryone={() => {}}
                                        onOpenLightbox={() => {}}
                                        onScrollToMessage={handleScrollToMessage}
                                        highlighted={highlightedMessageId === item.id}
                                        isSelected={selectedMessages.has(item.id)}
                                        showContextMenu={!isSelectionMode}
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

            {showDeleteModal && <DeleteActionSheet 
                onCancel={() => setShowDeleteModal(false)}
                onDeleteForMe={handleConfirmDeleteForMe}
                onDeleteForEveryone={handleConfirmDeleteForEveryone}
                showForEveryone={canDeleteForEveryone}
            />}

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
