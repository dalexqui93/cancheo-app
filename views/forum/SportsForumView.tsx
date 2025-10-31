import React, { useState, useMemo } from 'react';
import type { User, Notification, ForumPost, ForumComment, SportsEmoji, ForumReaction } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import CreatePost from '../../components/forum/CreatePost';
import PostCard from '../../components/forum/PostCard';
import EditPostModal from '../../components/forum/EditPostModal';
import ConfirmationModal from '../../components/ConfirmationModal';

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


interface SportsForumViewProps {
    user: User;
    addNotification: (notif: Omit<Notification, 'id'>) => void;
    onBack: () => void;
}

const SportsForumView: React.FC<SportsForumViewProps> = ({ user, addNotification, onBack }) => {
    const [posts, setPosts] = useState<ForumPost[]>(mockPostsData);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);

    const filters = ['Todos', 'Mis Publicaciones', 'Fútbol', 'Apuestas', 'Debate'];

    const handleCreatePost = (content: string, image: string | null, tags: string[]) => {
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
        };
        setPosts(prev => [newPost, ...prev]);
        addNotification({type: 'success', title: 'Publicación Creada', message: 'Tu publicación ahora está visible en el foro.'});
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
    
    const handleAddComment = (postId: string, content: string) => {
        const newComment: ForumComment = {
            id: `c-${Date.now()}`,
            authorId: user.id,
            authorName: user.name,
            authorProfilePicture: user.profilePicture,
            timestamp: new Date(),
            content: content,
            reactions: [],
        };

        setPosts(posts => posts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        }));
    };

    const handleUpdatePost = (updatedPost: ForumPost) => {
        setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
        setEditingPost(null);
        addNotification({type: 'success', title: 'Publicación Actualizada', message: 'Tus cambios han sido guardados.'});
    };

    const handleDeletePost = (post: ForumPost) => {
        setPostToDelete(post);
    };

    const confirmDeletePost = () => {
        if (postToDelete) {
            setPosts(posts.filter(p => p.id !== postToDelete.id));
            addNotification({type: 'info', title: 'Publicación Eliminada', message: 'Tu publicación ha sido eliminada del foro.'});
            setPostToDelete(null);
        }
    };

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'Todos') return posts;
        if (activeFilter === 'Mis Publicaciones') {
            return posts.filter(post => post.authorId === user.id);
        }
        return posts.filter(post => post.tags?.includes(activeFilter));
    }, [posts, activeFilter, user.id]);


    return (
        <div className="pb-24 md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver a Comunidad
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Foro Deportivo</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Un espacio para compartir y debatir tu pasión por el deporte.</p>
            
            <div className="space-y-6">
                <CreatePost user={user} onPost={handleCreatePost} />
                
                <div>
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors
                                        ${activeFilter === filter
                                            ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="space-y-4">
                        {filteredPosts.map(post => (
                           <PostCard 
                                key={post.id} 
                                post={post}
                                currentUser={user}
                                onToggleReaction={handleToggleReaction}
                                onAddComment={handleAddComment}
                                addNotification={addNotification}
                                onEdit={setEditingPost}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onSave={handleUpdatePost}
                    onClose={() => setEditingPost(null)}
                />
            )}
            <ConfirmationModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={confirmDeletePost}
                title="Confirmar Eliminación"
                message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
                confirmButtonText="Sí, eliminar"
            />
        </div>
    );
};

export default SportsForumView;