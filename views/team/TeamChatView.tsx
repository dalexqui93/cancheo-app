


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
import { PinIcon } from '../../components/icons/PinIcon';
import ChatMessageBubble from '../../components/team/ChatMessageBubble';

interface TeamChatViewProps {
    team: Team;
    currentUser: Player;
    onBack: () => void;
    onUpdateTeam: (updates: Partial<Team>) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

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
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

    const handleClearChat = useCallback(async () => {
        try {
            await db.clearTeamChat(team.id);
            // The listener will eventually clear the messages.
            // For immediate feedback, we can clear it locally.
            setMessages([]);
            setDeletedForMeIds(new Set());
            localStorage.removeItem(localStorageKey);
            addNotification({type: 'info', title: 'Chat Vaciado', message: 'Todos los mensajes han sido eliminados permanentemente.'});
        } catch (error) {
            // FIX: Explicitly convert 'unknown' error to string for safe logging.
            // Combine console.error arguments into a single string to fix type error.
            console.error(`Error al vaciar el chat: ${String(error)}`);
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo vaciar el historial del chat.' });
        }
    }, [team.id, localStorageKey, addNotification]);

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
            // FIX: Explicitly convert 'unknown' error to string for safe logging.
            // Combine console.error arguments into a single string to fix type error.
            console.error(`Error al eliminar mensajes: ${String(error)}`);
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
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-blue-900/50 backdrop-blur-sm z-10 sticky top-0">
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
        isOpen: boolean;
        onCancel: () => void;
        onDeleteForMe: () => void;
        onDeleteForEveryone: () => void;
        showForEveryone: boolean;
    }> = ({ isOpen, onCancel, onDeleteForMe, onDeleteForEveryone, showForEveryone }) => (
        <div
            className={`fixed inset-0 z-50 flex items-end bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onCancel}
        >
            <div
                className={`w-full bg-slate-800 rounded-t-2xl p-4 transition-transform duration-300 ease-out ${isOpen ? 'transform translate-y-0' : 'transform translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-lg mb-4 text-slate-100">Eliminar {selectedMessages.size > 1 ? `${selectedMessages.size} mensajes` : 'mensaje'}?</h3>
                <div className="space-y-2">
                    {showForEveryone && (
                        <button onClick={() => onDeleteForEveryone()} className="w-full text-left p-3 text-red-500 font-semibold rounded-lg hover:bg-slate-700 transition-colors">Eliminar para todos</button>
                    )}
                    <button onClick={() => onDeleteForMe()} className="w-full text-left p-3 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors">Eliminar para mí</button>
                    <button onClick={() => onCancel()} className="w-full text-left p-3 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 mt-2">Cancelar</button>
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
                                <div key={item.id} ref={el => messageRefs.current.set(item.id, el)}>
                                    <ChatMessageBubble 
                                        message={item as UserMessage}
                                        isCurrentUser={(item as UserMessage).senderId === currentUser.id}
                                        onReply={setReplyingTo}
                                        onDelete={handleDeleteForMe}
                                        onDeleteForEveryone={(messageId) => {
                                            setSelectedMessages(new Set([messageId]));
                                            setShowDeleteModal(true);
                                        }}
                                        onOpenLightbox={setLightboxImage}
                                        onScrollToMessage={handleScrollToMessage}
                                        highlighted={highlightedMessageId === item.id}
                                        isSelected={selectedMessages.has(item.id)}
                                        isSelectionMode={isSelectionMode}
                                        showContextMenu={!isSelectionMode}
                                        isFirstInGroup={isFirstInGroup}
                                        isLastInGroup={isLastInGroup}
                                        teamPlayerCount={team.players.length}
                                        onClick={() => handleTap(item)}
                                        onContextMenu={(e) => handleLongPress(e, item)}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div ref={messagesEndRef} />
            </main>

            <DeleteActionSheet
                isOpen={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onDeleteForMe={handleConfirmDeleteForMe}
                onDeleteForEveryone={handleConfirmDeleteForEveryone}
                showForEveryone={canDeleteForEveryone}
            />

            {lightboxImage && <ImageLightbox images={[lightboxImage]} startIndex={0} onClose={() => setLightboxImage(null)} />}

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