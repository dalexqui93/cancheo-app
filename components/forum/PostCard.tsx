import React, { useState } from 'react';
import type { ForumPost, User, SportsEmoji, Notification } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { DotsHorizontalIcon } from '../icons/DotsHorizontalIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { timeSince } from '../../utils/timeSince';

interface PostCardProps {
    post: ForumPost;
    currentUser: User;
    onToggleReaction: (postId: string, commentId: string | null, emoji: SportsEmoji) => void;
    onAddComment: (postId: string, content: string) => void;
    addNotification: (notif: Omit<Notification, 'id'>) => void;
    onEdit: (post: ForumPost) => void;
    onDelete: (post: ForumPost) => void;
}

const EMOJIS: { emoji: SportsEmoji; name: string; activeColor: string }[] = [
    { emoji: '👍', name: 'Me gusta', activeColor: 'text-blue-500' },
    { emoji: '⚽', name: 'Golazo', activeColor: 'text-green-500' },
    { emoji: '🔥', name: 'En llamas', activeColor: 'text-orange-500' },
    { emoji: '🏆', name: 'Campeón', activeColor: 'text-yellow-400' },
    { emoji: '🤯', name: 'Increíble', activeColor: 'text-purple-500' },
    { emoji: '😂', name: 'Me divierte', activeColor: 'text-yellow-500' },
    { emoji: '😡', name: 'Me enoja', activeColor: 'text-red-500' },
];


const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onToggleReaction, onAddComment, addNotification, onEdit, onDelete }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            onAddComment(post.id, commentText);
            setCommentText('');
        }
    };
    
    const handleReport = () => {
        addNotification({type: 'info', title: 'Reporte Enviado', message: 'Gracias por ayudarnos a mantener la comunidad segura.'});
    };
    
    const sortedReactions = [...post.reactions].sort((a,b) => b.userIds.length - a.userIds.length);
    const totalReactions = post.reactions.reduce((sum, r) => sum + r.userIds.length, 0);
    const currentUserReaction = post.reactions.find(r => r.userIds.includes(currentUser.id));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="p-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {post.authorProfilePicture ? <img src={post.authorProfilePicture} alt={post.authorName} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400"/>}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{post.authorName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{timeSince(post.timestamp)}</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <button className="p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><DotsHorizontalIcon className="w-5 h-5" /></button>
                         <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border dark:border-gray-600">
                            {post.authorId === currentUser.id ? (
                                <>
                                    <button onClick={() => onEdit(post)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Editar</button>
                                    <button onClick={() => onDelete(post)} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600">Eliminar</button>
                                </>
                            ) : (
                                <a href="#" onClick={handleReport} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Reportar</a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <p className="my-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt="Contenido de la publicación" className="mt-3 rounded-lg w-full object-cover max-h-96" />}
                <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags?.map(tag => (
                        <span key={tag} className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 py-1 px-2.5 rounded-full">#{tag}</span>
                    ))}
                </div>
            </div>

            {/* Reactions & Comments Count */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                {totalReactions > 0 ? (
                    <div className="flex items-center">
                        <div className="flex items-center">
                            {sortedReactions.slice(0, 3).map(({ emoji }) => (
                                <span key={emoji} className="text-base border-2 border-white dark:border-gray-800 rounded-full -ml-2 first:ml-0">
                                     {emoji}
                                </span>
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                           {totalReactions}
                        </span>
                    </div>
                ) : <div />}
                <button onClick={() => setShowComments(!showComments)} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:underline">
                    {post.comments.length} {post.comments.length === 1 ? 'comentario' : 'comentarios'}
                </button>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 mx-4 mt-1"></div>
            <div className="w-full">
                <div className="flex items-center justify-around px-2 sm:px-4 py-1">
                    <div className="group flex-1 flex justify-center relative">
                        {(() => {
                            const reactionConfig = currentUserReaction ? EMOJIS.find(e => e.emoji === currentUserReaction.emoji) : null;
                            return (
                                <button className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${reactionConfig ? reactionConfig.activeColor : 'text-gray-500 dark:text-gray-400'}`}>
                                    <span className="text-xl">{reactionConfig ? reactionConfig.emoji : '🙂'}</span>
                                    <span>{reactionConfig ? reactionConfig.name : 'Reaccionar'}</span>
                                </button>
                            );
                        })()}
                        <div className="absolute bottom-full left-full -translate-x-1/2 mb-2 flex items-center gap-1 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-lg border dark:border-gray-600 transform transition-all duration-150 origin-bottom scale-90 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:pointer-events-auto z-10">
                            {EMOJIS.map(emojiConfig => (
                                <button
                                    key={emojiConfig.emoji}
                                    title={emojiConfig.name}
                                    onClick={() => onToggleReaction(post.id, null, emojiConfig.emoji)}
                                    className="text-3xl p-1 rounded-full transition-transform transform hover:scale-125"
                                >
                                    {emojiConfig.emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => {setShowComments(true); document.getElementById(`comment-input-${post.id}`)?.focus();}} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <span className="text-xl">💬</span>
                        <span>Comentar</span>
                    </button>
                </div>
            </div>
            
            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-slate-50 dark:bg-gray-800/50">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {comment.authorProfilePicture ? <img src={comment.authorProfilePicture} alt={comment.authorName} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-slate-500 dark:text-gray-400"/>}
                            </div>
                            <div className="flex-grow">
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{comment.authorName}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                                 <div className="flex items-center gap-2 mt-1 px-2">
                                     <span className="text-xs text-gray-400">{timeSince(comment.timestamp)}</span>
                                     {/* Comment reactions can be added here if needed */}
                                 </div>
                            </div>
                        </div>
                    ))}
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-3 pt-2">
                         <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {currentUser.profilePicture ? <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-slate-500 dark:text-gray-400"/>}
                        </div>
                        <div className="flex-grow relative">
                            <input
                                id={`comment-input-${post.id}`}
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleCommentSubmit()}
                                placeholder="Escribe un comentario..."
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                            />
                            <button onClick={handleCommentSubmit} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--color-primary-600)]" disabled={!commentText.trim()}>
                                <PaperAirplaneIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;