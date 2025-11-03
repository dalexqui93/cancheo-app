import React, { useState, useMemo } from 'react';
import type { User, Notification, ForumPost, ForumComment, SportsEmoji, ForumReaction } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import CreatePost from '../../components/forum/CreatePost';
import PostCard from '../../components/forum/PostCard';
import EditPostModal from '../../components/forum/EditPostModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { GoogleGenAI } from '@google/genai';

const mockPostsData: ForumPost[] = [
    {
        id: 'post1',
        authorId: 'u2',
        authorName: 'Ana García',
        authorProfilePicture: 'https://i.pravatar.cc/150?u=u2',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 5),
        content: '¡Qué partidazo el de anoche! El gol de último minuto fue increíble. ¿Creen que el equipo mantendrá este nivel en la final?',
        imageUrl: 'https://picsum.photos/seed/partido1/1200/800',
        tags: ['Fútbol', 'Debate'],
        reactions: [
            { emoji: '🔥', userIds: ['u1', 'u3'] },
            { emoji: '⚽', userIds: ['u5'] },
            { emoji: '🤯', userIds: ['u6'] },
            { emoji: '🏆', userIds: ['u4'] }
        ],
        comments: [
            { id: 'c1', authorId: 'u3', authorName: 'Luis Fernandez', authorProfilePicture: 'https://i.pravatar.cc/150?u=u3', timestamp: new Date(new Date().getTime() - 1000 * 60 * 3), content: 'Totalmente de acuerdo, la defensa estuvo impecable.', reactions: [{ emoji: '👍', userIds: ['u2'] }] },
            { id: 'c2', authorId: 'u1', authorName: 'Carlos Pérez', authorProfilePicture: 'https://i.pravatar.cc/150?u=u1', timestamp: new Date(new Date().getTime() - 1000 * 60 * 2), content: 'No estoy tan seguro, el mediocampo perdió muchos balones en la segunda mitad. Hay que mejorar eso.', reactions: [] },
            { id: 'c3', authorId: 'u4', authorName: 'Marta Gomez', authorProfilePicture: 'https://i.pravatar.cc/150?u=u4', timestamp: new Date(new Date().getTime() - 1000 * 60 * 1), content: 'Concuerdo con Carlos. Si no ajustamos la presión en el medio, la final será muy difícil. El rival tiene jugadores muy rápidos.', reactions: [{ emoji: '👍', userIds: ['u1'] }] },
        ],
    },
    {
        id: 'post2',
        authorId: 'u5',
        authorName: 'Juan Rodriguez',
        authorProfilePicture: 'https://i.pravatar.cc/150?u=u5',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2),
        content: 'Análisis de apuestas para la jornada de mañana: creo que el equipo local tiene una cuota muy interesante de 2.5. El delantero estrella vuelve de lesión. ¿Qué opinan?',
        tags: ['Apuestas'],
        reactions: [
            { emoji: '👍', userIds: ['u1', 'u6'] },
            { emoji: '😂', userIds: ['u3'] },
            { emoji: '😡', userIds: ['u4'] },
        ],
        comments: [],
    },
];

const moderateContent = async (text: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analiza el siguiente texto por toxicidad, lenguaje de odio, spam, o contenido extremadamente inapropiado. Responde únicamente con 'true' si es inapropiado, o 'false' si es seguro. Texto: "${text}"`
        });
        return response.text.trim().toLowerCase() === 'true';
    } catch (error) {
        // Fix: Explicitly convert error to string for consistent and safe logging.
        console.error("Error en la moderación de contenido:", String(error));
        return false; // Fail safe
    }
};


interface SportsForumViewProps {
    user: User;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onBack: () => void;
}

const SportsForumView: React.FC<SportsForumViewProps> = ({ user, addNotification, onBack }) => {
    const [posts, setPosts] = useState<ForumPost[]>(mockPostsData);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);

    const filters = ['Todos', 'Mis Publicaciones', 'Fútbol', 'Apuestas', 'Debate'];

    const handleCreatePost = async (content: string, image: string | null, tags: string[]) => {
        const isFlagged = await moderateContent(content);
        const newPost: ForumPost = {
            id: `post-${Date.now()}`,
            authorId: user.id,
            authorName: user.name,
            authorProfilePicture: user.profilePicture,
            timestamp: new Date(),
            content: content,
            imageUrl: image || undefined,
            tags: tags.length > 0 ? tags : ['General'],
            reactions: [],
            comments: [],
            isFlagged,
        };
        setPosts(prev => [newPost, ...prev]);
        
        if (isFlagged) {
            addNotification({type: 'info', title: 'Publicación en Revisión', message: 'Tu publicación está pendiente de revisión por posible contenido inapropiado.'});
        } else {
            addNotification({type: 'success', title: 'Publicación Creada', message: 'Tu publicación ahora está visible en el foro.'});
        }
    };
    
    const handleToggleReaction = (postId: string, commentId: string | null, emoji: SportsEmoji) => {
        setPosts(posts => posts.map(p => {
            if (p.id !== postId) return p;
    
            const updateReactions = (originalReactions: ForumReaction[]): ForumReaction[] => {
                let userPreviousReaction: SportsEmoji | undefined;
                originalReactions.forEach(r => {
                    if (r.userIds.includes(user.id)) {
                        userPreviousReaction = r.emoji;
                    }
                });
    
                let newReactions = [...originalReactions];
    
                if (userPreviousReaction) {
                    newReactions = newReactions.map(r => {
                        if (r.emoji === userPreviousReaction) {
                            return { ...r, userIds: r.userIds.filter(id => id !== user.id) };
                        }
                        return r;
                    }).filter(r => r.userIds.length > 0);
                }
    
                if (userPreviousReaction !== emoji) {
                    const reactionIndex = newReactions.findIndex(r => r.emoji === emoji);
                    if (reactionIndex > -1) {
                        newReactions = newReactions.map(r => r.emoji === emoji ? { ...r, userIds: [...r.userIds, user.id] } : r);
                    } else {
                        newReactions.push({ emoji, userIds: [user.id] });
                    }
                }
                // Fix: A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.
                return newReactions;
            };
    
            if (commentId) {
                return {
                    ...p,
                    comments: p.comments.map(c => {
                        if (c.id !== commentId) return c;
                        return { ...c, reactions: updateReactions(c.reactions) };
                    })
                };
            } else {
                return { ...p, reactions: updateReactions(p.reactions) };
            }
        }));
    };

    const handleUpdatePost = (updatedPost: ForumPost) => {
        setPosts(posts => posts.map(p => p.id === updatedPost.id ? updatedPost : p));
        setEditingPost(null);
    };

    const handleDeletePost = () => {
        if (!postToDelete) return;
        setPosts(posts => posts.filter(p => p.id !== postToDelete.id));
        setPostToDelete(null);
    };

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'Todos') return posts;
        if (activeFilter === 'Mis Publicaciones') return posts.filter(p => p.authorId === user.id);
        return posts.filter(p => p.tags?.includes(activeFilter));
    }, [posts, activeFilter, user.id]);

    return (
        <div className="p-4 sm:p-6 pb-[5.5rem] md:pb-4 space-y-6 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-semibold mb-2 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a DaviPlay
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Foro Deportivo</h1>

            <CreatePost user={user} onPost={handleCreatePost} />

            {/* Filters */}
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                            activeFilter === filter
                                ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Posts */}
            <div className="space-y-6">
                {filteredPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onToggleReaction={handleToggleReaction}
                        onAddComment={async (postId, content) => {
                            const isFlagged = await moderateContent(content);
                            const newComment: ForumComment = {
                                id: `comment-${Date.now()}`,
                                authorId: user.id,
                                authorName: user.name,
                                authorProfilePicture: user.profilePicture,
                                timestamp: new Date(),
                                content,
                                reactions: [],
                                isFlagged,
                            };
                            setPosts(posts => posts.map(p => {
                                if (p.id !== postId) return p;
                                return { ...p, comments: [...p.comments, newComment] };
                            }));
                            if (isFlagged) {
                                addNotification({ type: 'info', title: 'Comentario en Revisión', message: 'Tu comentario está pendiente de revisión.' });
                            }
                        }}
                        addNotification={addNotification}
                        onEdit={setEditingPost}
                        onDelete={setPostToDelete}
                    />
                ))}
            </div>

            {editingPost && (
                <EditPostModal 
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSave={handleUpdatePost}
                />
            )}
            
            <ConfirmationModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={handleDeletePost}
                title="Eliminar Publicación"
                message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar"
            />
        </div>
    );
};

export default SportsForumView;
