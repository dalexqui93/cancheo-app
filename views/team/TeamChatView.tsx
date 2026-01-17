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
import { TrashIcon } from '../../components/icons/TrashIcon';
import ImageLightbox from '../../components/ImageLightbox';
import MessageInput from '../../components/team/MessageInput';
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
            setDeletedForMeIds(new Set(JSON.parse(storedIds) as string[]));
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
            setMessages([]);
            setDeletedForMeIds(new Set<string>());
            localStorage.removeItem(localStorageKey);
            addNotification({type: 'info', title: 'Chat Vaciado', message: 'Historial eliminado.'});
        } catch (error) {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo vaciar el chat.' });
        }
    }, [team.id, localStorageKey, addNotification]);

    const handleScrollToMessage = useCallback((messageId: string) => {
        const element = messageRefs.current.get(messageId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => setHighlightedMessageId(null), 1500);
        }
    }, []);

    const toggleSelection = (messageId: string) => {
        setSelectedMessages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(messageId)) newSelection.delete(messageId);
            else newSelection.add(messageId);
            return newSelection;
        });
    };

    const handleTap = (message: ChatItem) => {
        if (isSelectionMode && message.type === 'user') toggleSelection(message.id);
    };
    
    const handleCancelSelection = () => setSelectedMessages(new Set());

    const handleDeleteSelected = () => setShowDeleteModal(true);
    
    const handleConfirmDeleteForMe = () => {
        selectedMessages.forEach((id: string) => handleDeleteForMe(id));
        setShowDeleteModal(false);
        handleCancelSelection();
    };

    const handleConfirmDeleteForEveryone = async () => {
        try {
            const deletePromises = Array.from(selectedMessages).map((id: string) => db.deleteChatMessage(team.id, id));
            await Promise.all(deletePromises);
        } catch (error) {
            addNotification({ type: 'error', title: 'Error', message: 'Fallo al eliminar para todos.' });
        } finally {
            setShowDeleteModal(false);
            handleCancelSelection();
        }
    };
    
    const canDeleteForEveryone = useMemo(() => {
        if (!isSelectionMode) return false;
        return Array.from(selectedMessages).every((id: string) => {
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
            result.push(message);
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

    return (
        <div className="flex flex-col h-screen bg-bgMain-light dark:bg-bgMain-dark overflow-hidden transition-colors duration-300">
            {/* Header Adaptativo */}
            <header className={`flex-shrink-0 flex items-center justify-between p-4 border-b backdrop-blur-md sticky top-0 z-40 transition-all ${isSelectionMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-bgSurface-light/80 dark:bg-bgSurface-dark/80 border-borderDefault-light dark:border-borderDefault-dark'}`}>
                {isSelectionMode ? (
                    <>
                        <div className="flex items-center gap-4">
                            <button onClick={handleCancelSelection} className="p-2 active:scale-90"><XIcon className="w-6 h-6" /></button>
                            <span className="font-black text-lg">{selectedMessages.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={handleDeleteSelected} className="p-2 active:scale-90"><TrashIcon className="w-6 h-6" /></button>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90"><ChevronLeftIcon className="w-6 h-6 text-textMuted-light" /></button>
                        <button onClick={() => setIsInfoView(true)} className="flex items-center gap-3 flex-1 px-2 group">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-borderDefault-light dark:border-borderDefault-dark group-active:scale-95 transition-transform">
                                {team.logo ? <img src={team.logo} alt="logo" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-textDisabled-light"/>}
                            </div>
                            <div className="text-left">
                                <h2 className="font-black text-sm uppercase tracking-wider text-textMain-light dark:text-textMain-dark truncate max-w-[180px]">{team.name}</h2>
                                <p className="text-[10px] font-bold text-textMuted-light uppercase tracking-widest">{team.players.length} miembros</p>
                            </div>
                        </button>
                        <button onClick={() => setIsInfoView(true)} className="p-2 text-textMuted-light"><DotsVerticalIcon className="w-5 h-5"/></button>
                    </>
                )}
            </header>
            
            {/* Mensajes Area */}
            <main className="flex-1 overflow-y-auto ios-scroller px-4 bg-gray-50/50 dark:bg-black/20">
                 <div className="flex flex-col pb-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 text-brand" /></div>
                    ) : (
                        items.map((item, index) => {
                            if (item.type === 'date') {
                                return (
                                    <div key={item.id} className="text-center my-6">
                                        <span className="bg-bgSurface-light dark:bg-bgSurface-dark text-textMuted-light dark:text-textMuted-dark text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm border border-borderDefault-light dark:border-borderDefault-dark">
                                            {item.date}
                                        </span>
                                    </div>
                                );
                            }
                            if (item.type === 'system') {
                                return (
                                    <div key={item.id} className="text-center my-3 px-8">
                                        <p className="text-[10px] font-bold text-textMuted-light dark:text-textMuted-dark bg-gray-100 dark:bg-gray-900 inline-block py-1 px-3 rounded-lg">
                                            {item.text}
                                        </p>
                                    </div>
                                );
                            }

                            const isUserMessage = item.type === 'user';
                            const prevItem = items[index - 1];
                            const nextItem = items[index + 1];
                            
                            const isFirstInGroup = !prevItem || prevItem.type !== 'user' || (isUserMessage && prevItem.senderId !== item.senderId);
                            const isLastInGroup = !nextItem || nextItem.type !== 'user' || (isUserMessage && nextItem.senderId !== item.senderId);
                            
                            return (
                                <div key={item.id} ref={el => messageRefs.current.set(item.id, el)}>
                                    <ChatMessageBubble 
                                        message={item as UserMessage}
                                        isCurrentUser={item.senderId === currentUser.id}
                                        onReply={setReplyingTo}
                                        onDelete={handleDeleteForMe}
                                        onDeleteForEveryone={() => { setSelectedMessages(new Set([item.id])); setShowDeleteModal(true); }}
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
                                        onContextMenu={(e) => { e.preventDefault(); if(!isSelectionMode) toggleSelection(item.id); }}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div ref={messagesEndRef} />
            </main>

            {/* Input Overlay */}
            <MessageInput 
                team={team}
                currentUser={currentUser}
                addNotification={addNotification}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
            />

            {/* Modals & Action Sheets */}
            {lightboxImage && <ImageLightbox images={[lightboxImage]} startIndex={0} onClose={() => setLightboxImage(null)} />}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteModal(false)}>
                    <div className="w-full bg-bgSurface-light dark:bg-bgSurface-dark rounded-t-[32px] p-6 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
                        <h3 className="font-black text-xl uppercase italic tracking-tighter mb-6">¿Eliminar Mensaje?</h3>
                        <div className="space-y-3">
                            {canDeleteForEveryone && (
                                <button onClick={handleConfirmDeleteForEveryone} className="w-full py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl active:scale-95 transition-all">Eliminar para todos</button>
                            )}
                            <button onClick={handleConfirmDeleteForMe} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-textMain-light dark:text-textMain-dark font-bold rounded-2xl active:scale-95 transition-all">Eliminar para mí</button>
                            <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-textMuted-light font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamChatView;