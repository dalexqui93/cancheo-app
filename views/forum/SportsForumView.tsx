import React, { useState, useMemo, useEffect } from 'react';
import type { User, Notification, ForumPost, ForumComment, SportsEmoji, ForumReaction } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import CreatePost from '../../components/forum/CreatePost';
import PostCard from './PostCard';
import EditPostModal from '../../components/forum/EditPostModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { GoogleGenAI } from '@google/genai';
import * as db from '../../database';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';


const moderateContent = async (text: string, imageBase64: string | null = null): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const parts: any[] = [{
            text: `Analiza el siguiente contenido (texto y/o imagen) y determina si es inapropiado para un foro deportivo. Categorías de contenido inapropiado a verificar: mensajes ofensivos o de odio, contenido sexual (explícito o sugerente), publicidad no deseada o venta de productos, violencia gráfica. Responde únicamente con 'true' si el contenido es inapropiado, o 'false' si es seguro. Texto: "${text}"`
        }];

        if (imageBase64) {
            const base64Data = imageBase64.split(',')[1];
            if (base64Data) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data,
                    },
                });
            }
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        return response.text.trim().toLowerCase() === 'true';
    } catch (error) {
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
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);

    const filters = ['Todos', 'Mis Publicaciones', 'Fútbol', 'Apuestas', 'Debate'];

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.listenToPosts((fetchedPosts: ForumPost[]) => {
            setPosts(fetchedPosts);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);


    const handleCreatePost = async (content: string, image: string | null, tags: string[]) => {
        const isFlagged = await moderateContent(content, image);
        const newPostData = {
            authorId: user.id,
            authorName: user.name,
            authorProfilePicture: user.profilePicture,
            content,
            imageUrl: image,
            tags: tags.length > 0 ? tags : ['General'],
            isFlagged,
            comments: [],
            reactions: [],
        };
        await db.addPost(newPostData);
        
        if (isFlagged) {
            addNotification({type: 'info', title: 'Publicación en Revisión', message: 'Tu publicación está pendiente de revisión por posible contenido inapropiado.'});
        } else {
            addNotification({type: 'success', title: 'Publicación Creada', message: 'Tu publicación ahora está visible en el foro.'});
        }
    };
    
    const handleToggleReaction = (postId: string, commentId: string | null, emoji: SportsEmoji) => {
        db.toggleReaction(postId, commentId, user.id, emoji);
    };

    const handleUpdatePost = (updatedPost: ForumPost) => {
        db.updatePost(updatedPost.id, {
            content: updatedPost.content,
            imageUrl: updatedPost.imageUrl,
            tags: updatedPost.tags,
        });
        setEditingPost(null);
    };

    const handleDeletePost = () => {
        if (!postToDelete) return;
        db.deletePost(postToDelete.id);
        setPostToDelete(null);
    };

    const handleAddComment = async (postId: string, content: string) => {
        const isFlagged = await moderateContent(content);
        const newCommentData = {
            authorId: user.id,
            authorName: user.name,
            authorProfilePicture: user.profilePicture,
            content,
            isFlagged,
        };
        await db.addComment(postId, newCommentData);
        if (isFlagged) {
            addNotification({ type: 'info', title: 'Comentario en Revisión', message: 'Tu comentario está pendiente de revisión.' });
        }
    };


    const filteredPosts = useMemo(() => {
        // Show flagged posts only to their author
        const visiblePosts = posts.filter(p => !p.isFlagged || p.authorId === user.id);

        if (activeFilter === 'Todos') return visiblePosts;
        if (activeFilter === 'Mis Publicaciones') return visiblePosts.filter(p => p.authorId === user.id);
        return visiblePosts.filter(p => p.tags?.includes(activeFilter));
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
                {isLoading && <div className="text-center p-8"><SpinnerIcon className="w-8 h-8 mx-auto text-[var(--color-primary-500)]" /></div>}
                {!isLoading && filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No hay publicaciones aquí. ¡Sé el primero en crear una!</p>
                    </div>
                )}
                {!isLoading && filteredPosts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onToggleReaction={handleToggleReaction}
                        onAddComment={handleAddComment}
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