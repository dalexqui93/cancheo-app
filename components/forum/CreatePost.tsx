import React, { useState, useRef } from 'react';
import type { User } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { TagIcon } from '../icons/TagIcon';

interface CreatePostProps {
    user: User;
    onPost: (content: string, image: string | null, tags: string[]) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ user, onPost }) => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const categories = ['Fútbol', 'Apuestas', 'Debate'];

    const handleSubmit = () => {
        if (content.trim() && selectedTag) {
            const tagsArray = [selectedTag];
            onPost(content, imagePreview, tagsArray);
            setContent('');
            setImagePreview(null);
            setSelectedTag('');
        }
    };
    
    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setImagePreview(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-slate-500 dark:text-gray-400"/>
                    )}
                </div>
                <div className="w-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`¿Qué estás pensando, ${user.name.split(' ')[0]}?`}
                        className="w-full bg-slate-50 dark:bg-gray-700/50 rounded-lg p-3 border-transparent focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition"
                        rows={content.split('\n').length > 1 ? 4 : 2}
                    />
                    {imagePreview && (
                        <div className="mt-4 relative">
                            <img src={imagePreview} alt="Vista previa" className="rounded-lg max-h-60 object-cover" />
                            <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Category Selection List */}
                    <div className="mt-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                            <TagIcon className="h-5 w-5" />
                            Elige una categoría para tu discusión
                        </label>
                        <div className="flex flex-col gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedTag(category)}
                                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors text-left flex items-center gap-3 ${
                                        selectedTag === category
                                            ? 'bg-[var(--color-primary-600)] text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-[var(--color-primary-500)]'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTag === category ? 'border-white bg-[var(--color-primary-600)]' : 'border-gray-400 bg-white dark:bg-gray-700'}`}>
                                       {selectedTag === category && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </span>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddImage} title="Añadir imagen" className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-400)] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || !selectedTag}
                            className="bg-[var(--color-primary-600)] text-white font-bold py-2 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Publicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;