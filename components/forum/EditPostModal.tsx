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
    const [images, setImages] = useState<string[]>(post.imageUrls || []);
    const [selectedTag, setSelectedTag] = useState<string>(post.tags?.[0] || 'Fútbol');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const categories = ['Fútbol', 'Apuestas', 'Debate'];
    const MAX_IMAGES = 5;

    const handleSave = () => {
        const updatedPost: ForumPost = {
            ...post,
            content,
            imageUrls: images,
            tags: [selectedTag],
        };
        onSave(updatedPost);
    };

    const handleAddImage = () => {
        if (images.length >= MAX_IMAGES) return;
        fileInputRef.current?.click();
    };
    
    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (images.length + files.length > MAX_IMAGES) {
            alert(`Puedes subir un máximo de ${MAX_IMAGES} imágenes.`);
            return;
        }

        // FIX: Explicitly type 'file' as 'File' to resolve type inference issues.
        files.forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = e => setImages(prev => [...prev, e.target?.result as string]);
            reader.readAsDataURL(file);
        });
        event.target.value = '';
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
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={img} alt={`Vista previa ${index + 1}`} className="rounded-lg w-full h-full object-cover" />
                                    <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full hover:bg-black/80">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
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
                    <button onClick={handleAddImage} title="Añadir/Cambiar imagen" disabled={images.length >= MAX_IMAGES} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                       <ImageIcon className="w-6 h-6" />
                    </button>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
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