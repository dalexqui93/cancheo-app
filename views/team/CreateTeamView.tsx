import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../components/icons/UploadIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import type { User } from '../../types';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { GoogleGenAI } from '@google/genai';
import { XIcon } from '../../components/icons/XIcon';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';


const LogoCreatorModal: React.FC<{
    teamName: string;
    onSelectLogo: (base64: string) => void;
    onClose: () => void;
}> = ({ teamName, onSelectLogo, onClose }) => {
    const [colors, setColors] = useState('');
    const [keywords, setKeywords] = useState('');
    const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!keywords) {
            setError('Debes ingresar al menos una palabra clave.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedLogos([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `Logo for an amateur soccer team called '${teamName}'. The main colors are ${colors || 'any'}. The logo should include: ${keywords}. Style: vector, minimalist, modern, emblem.`,
                config: { numberOfImages: 4, aspectRatio: '1:1' }
            });
            const images = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
            setGeneratedLogos(images);
        } catch (e) {
            console.error("Error generating logos:", e);
            setError('Could not generate logos. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-400"/> AI Logo Creator</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-300">Describe your dream logo. The AI will create unique options for your team.</p>
                    <div>
                        <label className="font-semibold block mb-1">Main Colors</label>
                        <input type="text" value={colors} onChange={e => setColors(e.target.value)} placeholder="e.g., blue and white" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">Keywords</label>
                        <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g., an aggressive lion, a flaming ball" className="w-full p-2 border rounded-md bg-gray-700 border-gray-600"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isLoading ? <><SpinnerIcon className="w-5 h-5"/> Generating...</> : 'Generate Logos'}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>
                 {generatedLogos.length > 0 && (
                    <div className="p-6 border-t border-white/10">
                        <h4 className="font-bold mb-3">Select your favorite:</h4>
                        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                            {generatedLogos.map((logoSrc, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => onSelectLogo(logoSrc)} 
                                    className="flex-shrink-0 w-32 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--color-primary-500)] transition-all"
                                >
                                    <img src={logoSrc} alt={`Generated Logo ${i + 1}`} className="w-full h-full object-cover"/>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {isLoading && (
                    <div className="p-6 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-400">The AI is designing... This might take a moment.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

interface CreateTeamViewProps {
    user: User;
    onBack: () => void;
    onCreate: (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
}

const CreateTeamView: React.FC<CreateTeamViewProps> = ({ user, onBack, onCreate, setIsPremiumModalOpen }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState<'Casual' | 'Intermedio' | 'Competitivo'>('Casual');
    const [logo, setLogo] = useState<string | null>(null);
    const [showLogoModal, setShowLogoModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleAiLogoClick = () => {
        setShowLogoModal(true);
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
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) {
            // Basic validation feedback
            return;
        }
        onCreate({ name, logo, level });
    };

    return (
        <div className="p-4 sm:p-6 min-h-screen flex flex-col justify-center items-center">
             <button onClick={onBack} className="absolute top-6 left-4 flex items-center gap-2 text-[var(--color-primary-400)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver
            </button>
            <div className="w-full max-w-lg">
                <div className="text-center py-12 px-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
                    <UsersIcon className="mx-auto h-16 w-16 text-gray-400" />
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
                                     <button type="button" onClick={handleAiLogoClick} className="font-semibold text-yellow-500 hover:underline text-left flex items-center gap-1">
                                        <SparklesIcon className="w-4 h-4" />
                                        Crear con IA
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
                            <button type="submit" className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Crear Equipo</button>
                        </div>
                    </form>
                </div>
            </div>
            {showLogoModal && (
                <LogoCreatorModal 
                    teamName={name}
                    onClose={() => setShowLogoModal(false)}
                    onSelectLogo={(base64) => {
                        setLogo(base64);
                        setShowLogoModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default CreateTeamView;
