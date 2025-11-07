import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../components/icons/UploadIcon';
import { ShieldIcon } from '../../components/icons/ShieldIcon';
import type { User } from '../../types';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import LogoGalleryModal from '../../components/LogoGalleryModal';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';


interface CreateTeamViewProps {
    user: User;
    onBack: () => void;
    onCreate: (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => Promise<void>;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
}

const CreateTeamView: React.FC<CreateTeamViewProps> = ({ user, onBack, onCreate, setIsPremiumModalOpen }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState<'Casual' | 'Intermedio' | 'Competitivo'>('Casual');
    const [logo, setLogo] = useState<string | null>(null);
    const [showLogoGallery, setShowLogoGallery] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 128; // Logos can be small
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/png'); // PNG for logos
                    setLogo(dataUrl);
                }
                URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                alert("Could not load logo image. Try JPG or PNG.");
            };
            img.src = objectUrl;
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || isCreating) {
            return;
        }
        setIsCreating(true);
        try {
            await onCreate({ name, logo, level });
            // The parent component handles success notification and state change
        } catch (error) {
            // The parent component handles error notification
            console.error("Team creation failed", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 min-h-screen flex flex-col justify-center items-center">
             <button onClick={onBack} className="absolute top-6 left-4 flex items-center gap-2 text-[var(--color-primary-400)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver
            </button>
            <div className="w-full max-w-lg">
                <div className="text-center py-12 px-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
                    <ShieldIcon className="mx-auto h-16 w-16 text-[var(--color-primary-400)]" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight">Crea tu Equipo</h2>
                    <p className="mt-2 text-base text-gray-400 max-w-md mx-auto">Reúne a tu plantilla, define tus tácticas y prepárate para competir.</p>
                    
                    <form onSubmit={handleSubmit} className="mt-8 mx-auto space-y-6 text-left">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Logo del Equipo</label>
                            <div className="flex items-center gap-4">
                                <div onClick={handleLogoClick} className="w-24 h-24 bg-black/30 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-500">
                                    {logo ? (
                                        <img src={logo} alt="Logo preview" className="w-full h-full object-cover"/>
                                    ) : (
                                        <UploadIcon className="w-8 h-8 text-gray-400"/>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button type="button" onClick={handleLogoClick} className="font-semibold text-[var(--color-primary-400)] hover:underline text-left">
                                        Subir logo
                                    </button>
                                     <button type="button" onClick={() => setShowLogoGallery(true)} className="font-semibold text-yellow-500 hover:underline text-left flex items-center gap-1">
                                        <SparklesIcon className="w-4 h-4" />
                                        Elegir de la Galería
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="team-name" className="block text-sm font-medium text-gray-300">Nombre del Equipo</label>
                            <input type="text" id="team-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-black/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nivel Competitivo</label>
                            <div className="flex gap-2">
                                {(['Casual', 'Intermedio', 'Competitivo'] as const).map(l => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setLevel(l)}
                                        className={`py-2 px-4 rounded-md text-sm font-semibold transition flex-grow ${level === l ? 'bg-[var(--color-primary-600)] text-white shadow' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-5 flex justify-end gap-3">
                            <button type="submit" disabled={isCreating} className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-36 h-10">
                                {isCreating ? <SpinnerIcon className="w-5 h-5"/> : 'Crear Equipo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showLogoGallery && (
                <LogoGalleryModal 
                    teamName={name || 'Tu Equipo'}
                    onClose={() => setShowLogoGallery(false)}
                    onSelectLogo={(logoUrl) => {
                        setLogo(logoUrl);
                        setShowLogoGallery(false);
                    }}
                />
            )}
        </div>
    );
};

export default CreateTeamView;