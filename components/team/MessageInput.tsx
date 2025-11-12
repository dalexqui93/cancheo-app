import React, { useState, useRef, useEffect, useReducer } from 'react';
import type { Team, Player, ChatMessage, Notification, UserMessage } from '../../types';
import * as db from '../../database';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { FaceSmileIcon } from '../icons/FaceSmileIcon';
import { XIcon } from '../icons/XIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { PaperclipIcon } from '../icons/PaperclipIcon';
import { ArrowUturnLeftIcon } from '../icons/ArrowUturnLeftIcon';

const EMOJIS = ['👍', '😂', '⚽', '🔥', '👏', '🏆', '🎉', '💪'];

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

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
                    resolve(canvas.toDataURL('image/jpeg', 0.75));
                } else {
                    reject(new Error('No se pudo obtener el contexto del canvas.'));
                }
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

interface MessageInputState {
    inputText: string;
    showEmojis: boolean;
    attachment: { fileName: string; mimeType: string; dataUrl: string; } | null;
    isRecording: boolean;
    recordingTime: number;
}

type MessageInputAction =
    | { type: 'SET_INPUT_TEXT'; payload: string }
    | { type: 'TOGGLE_EMOJIS' }
    | { type: 'SET_ATTACHMENT'; payload: MessageInputState['attachment'] }
    | { type: 'SET_IS_RECORDING'; payload: boolean }
    | { type: 'SET_RECORDING_TIME'; payload: number }
    | { type: 'RESET' };

const initialState: MessageInputState = {
    inputText: '',
    showEmojis: false,
    attachment: null,
    isRecording: false,
    recordingTime: 0,
};

const reducer = (state: MessageInputState, action: MessageInputAction): MessageInputState => {
    switch (action.type) {
        case 'SET_INPUT_TEXT': return { ...state, inputText: action.payload };
        case 'TOGGLE_EMOJIS': return { ...state, showEmojis: !state.showEmojis };
        case 'SET_ATTACHMENT': return { ...state, attachment: action.payload };
        case 'SET_IS_RECORDING': return { ...state, isRecording: action.payload };
        case 'SET_RECORDING_TIME': return { ...state, recordingTime: action.payload };
        case 'RESET': return { ...initialState, showEmojis: state.showEmojis }; // Keep emoji panel state
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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = async (audioAttachment?: { fileName: string; mimeType: string; dataUrl: string; }) => {
        const messageAttachment = audioAttachment || state.attachment;
        if (state.inputText.trim() === '' && !messageAttachment) return;
        
        const messageData: Partial<ChatMessage> = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderProfilePicture: currentUser.profilePicture,
            text: state.inputText,
            replyTo: replyingTo ? { messageId: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
            attachment: messageAttachment ? { ...messageAttachment } : undefined,
        };

        dispatch({ type: 'RESET' });
        onCancelReply();
        
        try {
            await db.addChatMessage(team.id, messageData as Omit<ChatMessage, 'id' | 'timestamp'>);
        } catch (error) {
            console.error("Error al enviar el mensaje:", String(error));
            addNotification({ type: 'error', title: 'Error de envío', message: 'No se pudo enviar tu mensaje.' });
        }
    };

    // ... (resto de handlers: handleEmojiSelect, handleFileChange, handleStart/StopRecording)
    const handleEmojiSelect = (emoji: string) => {
        dispatch({ type: 'SET_INPUT_TEXT', payload: state.inputText + emoji });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { // 15MB limit
                addNotification({ type: 'error', title: 'Archivo muy grande', message: 'El límite para archivos es 15MB.'});
                return;
            }

            try {
                const dataUrl = file.type.startsWith('image/') ? await compressImage(file) : await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                dispatch({ type: 'SET_ATTACHMENT', payload: {
                    fileName: file.name,
                    mimeType: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
                    dataUrl: dataUrl,
                }});
            } catch (error) {
                console.error("Error al procesar el archivo:", String(error));
                addNotification({ type: 'error', title: 'Error de Archivo', message: 'No se pudo procesar el archivo seleccionado.'});
            }
        }
        e.target.value = '';
    };

    const handleStartRecording = async (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        // ... (lógica de grabación)
    };
    
    const handleStopRecording = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        // ... (lógica de detener grabación)
    };


    const isCaptain = currentUser.id === team.captainId;
    const canSendMessage = !team.messagingPermissions || team.messagingPermissions === 'all' || (team.messagingPermissions === 'captain' && isCaptain);
    
    return (
        <footer className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm z-20">
             <div className="container mx-auto">
                {state.attachment && (
                    <div className="relative p-2 mb-2 bg-gray-700 rounded-lg flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {state.attachment.mimeType.startsWith('image/') ? (
                                <img src={state.attachment.dataUrl} alt="preview" className="w-10 h-10 rounded object-cover" />
                            ) : (
                                <FileIcon className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <p className="text-sm truncate flex-grow text-white">{state.attachment.fileName}</p>
                        <button onClick={() => dispatch({ type: 'SET_ATTACHMENT', payload: null })} className="p-1 rounded-full hover:bg-gray-600 flex-shrink-0">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {replyingTo && (
                    <div className="p-2 mb-2 bg-gray-700 rounded-lg border-l-4 border-amber-500 flex items-center gap-3 overflow-hidden">
                        <ArrowUturnLeftIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                Respondiendo a {replyingTo.senderName.split(' ')[0]}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{replyingTo.text}</p>
                        </div>
                        <button onClick={onCancelReply} className="flex-shrink-0 p-1 rounded-full hover:bg-gray-600">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {state.showEmojis && (
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
                    <button onClick={() => dispatch({ type: 'TOGGLE_EMOJIS' })} className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
                        <FaceSmileIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={state.inputText}
                        onChange={(e) => dispatch({ type: 'SET_INPUT_TEXT', payload: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-grow w-full bg-gray-700 border-transparent rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button onClick={() => handleSendMessage()} className="p-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 shadow-sm transition-colors" disabled={!state.inputText.trim() && !state.attachment}>
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default MessageInput;