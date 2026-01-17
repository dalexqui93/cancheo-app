import React from 'react';
import type { UserMessage } from '../../types';
import { DotsVerticalIcon } from '../icons/DotsVerticalIcon';
import { UserIcon } from '../icons/UserIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { DoubleCheckIcon } from '../icons/DoubleCheckIcon';
import { BanIcon } from '../icons/BanIcon';
import { ArrowUturnLeftIcon } from '../icons/ArrowUturnLeftIcon';

const MessageStatusIcon: React.FC<{ message: UserMessage; teamPlayerCount: number; }> = ({ message, teamPlayerCount }) => {
  if (message.id.startsWith('temp-')) {
    return <ClockIcon className="w-3 h-3 text-textMuted-light/50" aria-label="Enviando" />;
  }
  const isReadAll = message.readBy && message.readBy.length >= teamPlayerCount - 1;
  if (isReadAll) {
    return <DoubleCheckIcon className="w-3.5 h-3.5 text-brand" aria-label="Leído por todos" />;
  }
  return <CheckIcon className="w-3.5 h-3.5 text-textMuted-light/40" aria-label="Enviado" />;
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
        <div className="w-8 h-8 rounded-2xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-borderDefault-light dark:border-borderDefault-dark shadow-sm">
            {message.senderProfilePicture ? (
                <img src={message.senderProfilePicture} alt={message.senderName} className="w-full h-full object-cover" />
            ) : (
                <UserIcon className="w-5 h-5 text-textDisabled-light m-1.5" />
            )}
        </div>
    );

    if (message.deleted) {
        return (
             <div 
                className={`flex items-center gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'} group relative`}
                onClick={onClick}
            >
                <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-borderDefault-light dark:border-borderDefault-dark">
                    <p className="text-xs italic text-textMuted-light dark:text-textMuted-dark flex items-center gap-2">
                        <BanIcon className="w-3 h-3 flex-shrink-0" />
                        <span>Mensaje eliminado</span>
                    </p>
                </div>
            </div>
        );
    }
    
    const bubbleColor = isCurrentUser 
        ? 'bg-brand text-white shadow-md shadow-brand/10' 
        : 'bg-bgSurface-light dark:bg-bgSurface-dark text-textMain-light dark:text-textMain-dark border border-borderDefault-light dark:border-borderDefault-dark shadow-sm';

    const bubbleClasses = isCurrentUser
        ? `rounded-2xl ${isFirstInGroup ? 'rounded-tr-sm' : ''} ${isLastInGroup ? 'rounded-br-2xl' : ''}`
        : `rounded-2xl ${isFirstInGroup ? 'rounded-tl-sm' : ''} ${isLastInGroup ? 'rounded-bl-2xl' : ''}`;
        
    return (
        <div 
            className={`flex items-end gap-2 group relative transition-all ${isCurrentUser ? 'justify-end pl-12' : 'justify-start pr-12'} ${isFirstInGroup ? 'mt-6' : 'mt-1'} ${highlighted ? 'scale-[1.02] z-10' : ''}`}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            {/* Selección visual */}
            {isSelectionMode && (
                <div className={`absolute inset-y-0 ${isCurrentUser ? '-right-4' : '-left-4'} flex items-center px-2 z-20`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand border-brand' : 'bg-transparent border-textDisabled-light'}`}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                </div>
            )}

            {!isCurrentUser && (
                <div className="w-8 flex-shrink-0">
                    {isLastInGroup ? <Avatar /> : <div className="w-8" />}
                </div>
            )}
            
            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {!isCurrentUser && isFirstInGroup && (
                    <p className="text-[10px] font-black text-textMuted-light dark:text-textMuted-dark uppercase tracking-widest mb-1.5 ml-2">
                        {message.senderName.split(' ')[0]}
                    </p>
                )}

                <div className={`relative transition-all duration-300 ${bubbleColor} ${bubbleClasses} ${highlighted ? 'ring-2 ring-brand ring-offset-2 dark:ring-offset-black' : ''}`}>
                    {/* Reply Preview */}
                    {message.replyTo && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (message.replyTo?.messageId) onScrollToMessage(message.replyTo.messageId);
                            }} 
                            className={`block w-[calc(100%-1rem)] text-left m-2 p-2 rounded-xl border-l-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm transition-opacity hover:opacity-80 ${isCurrentUser ? 'border-white/30' : 'border-brand/40'}`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-tight truncate ${isCurrentUser ? 'text-white' : 'text-brand'}`}>
                                {message.replyTo.senderName.split(' ')[0]}
                            </p>
                            <p className="text-xs opacity-70 truncate max-w-[200px]">{message.replyTo.text}</p>
                        </button>
                    )}

                    {/* Image Attachment */}
                    {message.attachment && message.attachment.mimeType.startsWith('image/') && (
                        <div className="p-1">
                            <img 
                                src={message.attachment.dataUrl} 
                                alt="Attachment" 
                                className="rounded-xl max-w-full h-auto object-cover cursor-pointer hover:brightness-95 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLightbox(message.attachment!.dataUrl);
                                }}
                            />
                        </div>
                    )}

                    {/* File Attachment */}
                    {message.attachment && !message.attachment.mimeType.startsWith('image/') && (
                        <a 
                            href={message.attachment.dataUrl} 
                            download={message.attachment.fileName}
                            className={`flex items-center gap-3 p-3 m-1 rounded-xl transition-colors ${isCurrentUser ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate pr-2">{message.attachment.fileName}</p>
                                <p className="text-[9px] opacity-60 uppercase font-black">Descargar</p>
                            </div>
                        </a>
                    )}

                    {/* Text content */}
                    {message.text && (
                        <p className="text-sm leading-relaxed px-4 py-2.5 break-words font-medium">
                            {message.text}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className={`flex items-center gap-1.5 px-3 pb-1.5 -mt-1 justify-end opacity-60`}>
                        <span className="text-[9px] font-bold uppercase tabular-nums">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isCurrentUser && <MessageStatusIcon message={message} teamPlayerCount={teamPlayerCount} />}
                    </div>
                </div>
            </div>
            
            {/* Quick Reply Trigger (Mobile Friendly) */}
            {!isSelectionMode && showContextMenu && (
                <button
                    onClick={(e) => { e.stopPropagation(); onReply(message); }}
                    className={`p-2 rounded-full bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark shadow-md opacity-0 group-hover:opacity-100 transition-all active:scale-90 absolute top-1/2 -translate-y-1/2 ${isCurrentUser ? '-left-10' : '-right-10'}`}
                >
                    <ArrowUturnLeftIcon className={`w-4 h-4 text-textMuted-light ${isCurrentUser ? 'transform -scale-x-100' : ''}`} />
                </button>
            )}
        </div>
    );
});

export default ChatMessageBubble;