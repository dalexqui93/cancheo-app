import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../components/icons/UploadIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import type { User } from '../../types';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { GoogleGenAI } from '@google/genai';
import { XIcon } from '../../components/icons/XIcon';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';


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
                prompt: `Logo para un equipo de fútbol amateur llamado '${teamName}'. Los colores principales son ${colors || 'cualquiera'}. El logo debe incluir: ${keywords}. Estilo: vector, minimalista, moderno, emblema.`,
                config: { numberOfImages: 4, aspectRatio: '1:1' }
            });
            const images = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
            setGeneratedLogos(images);
        } catch (e) {
            console.error("Error al generar logos:", e);
            setError('No se pudieron generar los logos. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"><SparklesIcon className="w-6 h-6 text-yellow-400"/> Creador de Logos con IA</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Describe el logo de tus sueños. La IA creará opciones únicas para tu equipo.</p>
                    <div>
                        <label className="font-semibold block mb-1 text-gray-900 dark:text-gray-100">Colores principales</label>
                        <input type="text" value={colors} onChange={e => setColors(e.target.value)} placeholder="Ej: azul y blanco" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1 text-gray-900 dark:text-gray-100">Palabras clave</label>
                        <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Ej: un león agresivo, una pelota en llamas" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isLoading ? <><SpinnerIcon className="w-5 h-5"/> Generando...</> : 'Generar Logos'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
                 {generatedLogos.length > 0 && (
                    <div className="p-6 border-t dark:border-gray-700">
                        <h4 className="font-bold mb-3 text-gray-900 dark:text-gray-100">Selecciona tu favorito:</h4>
                        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                            {generatedLogos.map((logoSrc, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => onSelectLogo(logoSrc)} 
                                    className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--color-primary-500)] transition-all"
                                >
                                    <img src={logoSrc} alt={`Logo generado ${i + 1}`} className="w-full h-full object-cover"/>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {isLoading && (
                    <div className="p-6 border-t dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está diseñando... Esto puede tomar un momento.</p>
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
                alert("No se pudo cargar la imagen del logo. Intenta con JPG o PNG.");
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
        <div>
            <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border dark:border-gray-700">
                <UsersIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Crea tu Equipo</h2>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">Reúne a tu plantilla, define tus tácticas y prepárate para competir. Empieza dándole una identidad a tu equipo.</p>
                
                <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo del Equipo</label>
                        <div className="flex items-center gap-4">
                            <div onClick={handleLogoClick} className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed dark:border-gray-500">
                                {logo ? (
                                    <img src={logo} alt="Previsualización del logo" className="w-full h-full object-cover"/>
                                ) : (
                                    <UploadIcon className="w-8 h-8 text-gray-400"/>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button type="button" onClick={handleLogoClick} className="font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline text-left">
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
                        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Equipo</label>
                        <input type="text" id="team-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel Competitivo</label>
                        <div className="flex gap-2">
                            {(['Casual', 'Intermedio', 'Competitivo'] as const).map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setLevel(l)}
                                    className={`py-2 px-4 rounded-md text-sm font-semibold transition flex-grow ${level === l ? 'bg-[var(--color-primary-600)] text-white shadow' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t dark:border-gray-700 pt-5 flex justify-end gap-3">
                        <button type="button" onClick={onBack} className="py-2 px-5 rounded-lg font-semibold bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-800/50 dark:text-orange-300 dark:hover:bg-orange-800/80">Cancelar</button>
                        <button type="submit" className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Crear Equipo</button>
                    </div>
                </form>
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