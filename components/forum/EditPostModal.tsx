import React, { useState, useRef } from 'react';
import type { ForumPost } from '../../types';
import { XIcon } from '../icons/XIcon';
import { ImageIcon } from '../icons/ImageIcon';

interface EditPostModalProps {
    post: ForumPost;
    onSave: (updatedPost: ForumPost) => void;
    onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onSave, onClose }) => {
    const [content, setContent] = useState(post.content);
    const [image, setImage] = useState<string | null>(post.imageUrl || null);
    const [selectedTag, setSelectedTag] = useState<string>(post.tags?.[0] || 'Fútbol');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const categories = ['Fútbol', 'Apuestas', 'Debate'];

    const handleSave = () => {
        const updatedPost: ForumPost = {
            ...post,
            content,
            imageUrl: image || undefined,
            tags: [selectedTag],
        };
        onSave(updatedPost);
    };

    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Editar Publicación</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-700/50 rounded-lg p-3 border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition"
                        rows={5}
                    />
                    {image && (
                        <div className="relative">
                            <img src={image} alt="Vista previa" className="rounded-lg max-h-60 object-cover" />
                            <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><XIcon className="w-4 h-4" /></button>
                        </div>
                    )}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                         <div className="flex flex-col gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedTag(category)}
                                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors text-left flex items-center gap-3 ${ selectedTag === category ? 'bg-[var(--color-primary-600)] text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' }`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTag === category ? 'border-white bg-[var(--color-primary-600)]' : 'border-gray-400 bg-white dark:bg-gray-700'}`}>
                                       {selectedTag === category && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </span>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-between items-center">
                    <button onClick={handleAddImage} title="Añadir/Cambiar imagen" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                       <ImageIcon className="w-6 h-6" />
                    </button>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <div className="flex gap-3">
                        <button onClick={onClose} className="py-2 px-5 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                        <button onClick={handleSave} className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;