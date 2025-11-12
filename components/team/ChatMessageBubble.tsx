import React from 'react';
import type { UserMessage } from '../../types';
import { DotsVerticalIcon } from '../icons/DotsVerticalIcon';
import { UserIcon } from '../icons/UserIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { DoubleCheckIcon } from '../icons/DoubleCheckIcon';
import { BanIcon } from '../icons/BanIcon';

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

interface ChatMessageBubbleProps {
    message: UserMessage;
    isCurrentUser: boolean;
    onReply: (message: UserMessage) => void;
    onDelete: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    onOpenLightbox: (imageUrl: string) => void;
    onScrollToMessage: (messageId: string) => void;
    highlighted: boolean;
    isSelected: boolean;
    isSelectionMode: boolean;
    showContextMenu: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    teamPlayerCount: number;
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = React.memo(({
    message, isCurrentUser, onReply, onDelete, onDeleteForEveryone, onOpenLightbox, onScrollToMessage,
    highlighted, isSelected, isSelectionMode, showContextMenu, isFirstInGroup, isLastInGroup, teamPlayerCount,
    onClick, onContextMenu
}) => {
    
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
             <div 
                className={`flex items-center gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-0.5 group relative ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}
                onClick={onClick}
                onContextMenu={onContextMenu}
            >
                {isSelectionMode && !isCurrentUser && (
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-800 border-gray-500'}`}>
                            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                )}

                {!isCurrentUser && !isSelectionMode && <div className="w-8 flex-shrink-0"></div>}
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
                    <p className="text-sm italic text-gray-500 flex items-center gap-2">
                        <BanIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Este mensaje fue eliminado</span>
                    </p>
                </div>
                {isSelectionMode && isCurrentUser && (
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-800 border-gray-500'}`}>
                            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                )}
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
        
    return (
        <div 
            className={`flex ${isSelectionMode ? 'items-center' : 'items-end'} gap-2 group relative ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0.5'} ${highlighted ? 'animate-highlight-pulse rounded-2xl' : ''}`}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            {!isCurrentUser && (
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center self-end">
                    {isSelectionMode ? (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all self-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-800 border-gray-500'}`}>
                            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                        </div>
                    ) : (
                        isLastInGroup ? <Avatar /> : <div/>
                    )}
                </div>
            )}
            
            <div className={`flex items-center gap-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`max-w-xs md:max-w-md relative shadow-none ${bubbleColor} ${bubbleClasses} ${isFileOnlyMessage ? 'p-2' : 'px-4 py-2'}`}>
                    {!isCurrentUser && isFirstInGroup && (
                        <p className="text-xs font-bold mb-1 text-amber-300">{message.senderName}</p>
                    )}
                    {message.replyTo && (
                        <button onClick={(e) => {
                            if (isSelectionMode) {
                                e.preventDefault();
                                return;
                            }
                            e.stopPropagation();
                            if (message.replyTo?.messageId) onScrollToMessage(message.replyTo.messageId);
                        }} className="w-full text-left mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/50 cursor-pointer hover:bg-black/30">
                            <p className="text-xs font-bold">{message.replyTo.senderName.split(' ')[0]}</p>
                            <p className="text-xs opacity-80 truncate">{message.replyTo.text}</p>
                        </button>
                    )}
                    {message.attachment && (
                        <div className={isFileOnlyMessage ? '' : 'my-2'}>
                            {message.attachment.mimeType.startsWith('image/') ? (
                                <img src={message.attachment.dataUrl} alt={message.attachment.fileName} className="rounded-lg max-w-64 h-auto cursor-pointer" onClick={(e) => {
                                    if (isSelectionMode) {
                                        e.preventDefault();
                                        return;
                                    }
                                    e.stopPropagation();
                                    onOpenLightbox(message.attachment.dataUrl);
                                }} />
                            ) : (
                                <a href={message.attachment.dataUrl} download={message.attachment.fileName} onClick={e => {
                                    if (isSelectionMode) {
                                        e.preventDefault();
                                    } else {
                                        e.stopPropagation();
                                    }
                                }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/20 transition-colors">
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

            {isSelectionMode && isCurrentUser && (
                <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-800 border-gray-500'}`}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                </div>
            )}
        </div>
    );
});

export default ChatMessageBubble;