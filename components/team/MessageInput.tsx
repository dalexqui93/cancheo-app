import React, { useState, useRef, useReducer } from 'react';
import type { Team, Player, Notification, UserMessage } from '../../types';
import * as db from '../../database';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { FaceSmileIcon } from '../icons/FaceSmileIcon';
import { XIcon } from '../icons/XIcon';
import { PaperclipIcon } from '../icons/PaperclipIcon';
import { ArrowUturnLeftIcon } from '../icons/ArrowUturnLeftIcon';

const EMOJIS = ['⚽', '🔥', '🏆', '💪', '👏', '😂', '👍', '🏃'];

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
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
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } else {
                    reject(new Error('Canvas context failure'));
                }
            };
        };
    });
};

interface MessageInputState {
    inputText: string;
    showEmojis: boolean;
    attachment: { fileName: string; mimeType: string; dataUrl: string; } | null;
}

type MessageInputAction =
    | { type: 'SET_INPUT_TEXT'; payload: string }
    | { type: 'TOGGLE_EMOJIS' }
    | { type: 'SET_ATTACHMENT'; payload: MessageInputState['attachment'] }
    | { type: 'RESET' };

const initialState: MessageInputState = {
    inputText: '',
    showEmojis: false,
    attachment: null,
};

const reducer = (state: MessageInputState, action: MessageInputAction): MessageInputState => {
    switch (action.type) {
        case 'SET_INPUT_TEXT': return { ...state, inputText: action.payload };
        case 'TOGGLE_EMOJIS': return { ...state, showEmojis: !state.showEmojis };
        case 'SET_ATTACHMENT': return { ...state, attachment: action.payload };
        case 'RESET': return { ...initialState };
        default: return state;
    }
};

interface MessageInputProps {
    team: Team;
    currentUser: Player;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    replyingTo: UserMessage | null;
    onCancelReply: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ team, currentUser, addNotification, replyingTo, onCancelReply }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = async () => {
        const trimmedText = state.inputText.trim();
        if (trimmedText === '' && !state.attachment) return;
    
        const messageData = {
            type: 'user' as const,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: trimmedText,
            ...(currentUser.profilePicture && { senderProfilePicture: currentUser.profilePicture }),
            ...(replyingTo && { replyTo: { messageId: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text } }),
            ...(state.attachment && { attachment: { ...state.attachment } }),
        };

        dispatch({ type: 'RESET' });
        onCancelReply();
        
        try {
            await db.addChatMessage(team.id, messageData);
        } catch (error) {
            console.error("Error sending message:", String(error));
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo enviar el mensaje.' });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = file.type.startsWith('image/') ? await compressImage(file) : await new Promise<string>((resolve) => {
                    const r = new FileReader();
                    r.onload = (ev) => resolve(ev.target?.result as string);
                    r.readAsDataURL(file);
                });
                dispatch({ type: 'SET_ATTACHMENT', payload: {
                    fileName: file.name,
                    mimeType: file.type,
                    dataUrl
                }});
            } catch (err) {
                addNotification({ type: 'error', title: 'Error de archivo', message: 'No se pudo cargar el archivo.' });
            }
        }
    };

    return (
        <div className="px-4 pb-8 pt-2 bg-gradient-to-t from-bgMain-light dark:from-bgMain-dark via-bgMain-light/95 dark:via-bgMain-dark/95 to-transparent backdrop-blur-md">
            <div className="container mx-auto max-w-2xl">
                {/* Reply Indicator Panel */}
                {replyingTo && (
                    <div className="mb-2 p-3 bg-bgSurface-light dark:bg-bgSurface-dark rounded-2xl border border-borderDefault-light dark:border-borderDefault-dark shadow-lg animate-ios flex items-center gap-3">
                        <div className="w-1 bg-brand rounded-full h-8" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-brand">Respondiendo a {replyingTo.senderName.split(' ')[0]}</p>
                            <p className="text-xs text-textMuted-light dark:text-textMuted-dark truncate">{replyingTo.text}</p>
                        </div>
                        <button onClick={onCancelReply} className="p-2 text-textMuted-light hover:text-textMain-light transition-colors">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Attachment Preview */}
                {state.attachment && (
                    <div className="mb-2 p-2 bg-bgSurface-light dark:bg-bgSurface-dark rounded-2xl border border-borderDefault-light dark:border-borderDefault-dark shadow-lg animate-ios flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {state.attachment.mimeType.startsWith('image/') ? (
                                <img src={state.attachment.dataUrl} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-textMuted-light"><PaperclipIcon className="w-5 h-5"/></div>
                            )}
                        </div>
                        <span className="text-xs font-bold truncate flex-1">{state.attachment.fileName}</span>
                        <button onClick={() => dispatch({ type: 'SET_ATTACHMENT', payload: null })} className="p-2 text-rose-500"><XIcon className="w-4 h-4"/></button>
                    </div>
                )}

                {/* Main Input Container */}
                <div className="flex items-end gap-2 bg-bgSurface-light dark:bg-bgSurface-dark border border-borderDefault-light dark:border-borderDefault-dark rounded-[28px] p-1.5 shadow-premium-light dark:shadow-premium-dark">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-textMuted-light hover:text-brand transition-colors active:scale-90"
                    >
                        <PaperclipIcon className="w-6 h-6" />
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            rows={1}
                            value={state.inputText}
                            onChange={(e) => dispatch({ type: 'SET_INPUT_TEXT', payload: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Escribe un mensaje..."
                            className="w-full max-h-32 py-3 px-4 bg-gray-50 dark:bg-gray-900 border-none rounded-[20px] text-sm font-medium focus:ring-1 focus:ring-brand/30 transition-all outline-none resize-none"
                        />
                    </div>

                    <button 
                        onClick={() => dispatch({ type: 'TOGGLE_EMOJIS' })}
                        className={`p-3 transition-colors active:scale-90 ${state.showEmojis ? 'text-brand' : 'text-textMuted-light'}`}
                    >
                        <FaceSmileIcon className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleSendMessage}
                        disabled={!state.inputText.trim() && !state.attachment}
                        className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-button disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:shadow-none active:scale-90 transition-all"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 ml-0.5" />
                    </button>
                </div>

                {/* Emoji Panel */}
                {state.showEmojis && (
                    <div className="mt-3 p-3 bg-bgSurface-light dark:bg-bgSurface-dark rounded-3xl border border-borderDefault-light dark:border-borderDefault-dark shadow-2xl animate-ios grid grid-cols-8 gap-1">
                        {EMOJIS.map(emoji => (
                            <button 
                                key={emoji} 
                                onClick={() => dispatch({ type: 'SET_INPUT_TEXT', payload: state.inputText + emoji })}
                                className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInput;