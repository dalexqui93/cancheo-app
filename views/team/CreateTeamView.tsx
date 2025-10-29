import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../components/icons/UploadIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';

interface CreateTeamViewProps {
    onBack: () => void;
    onCreate: (teamData: { name: string; logo: string | null; level: 'Casual' | 'Intermedio' | 'Competitivo' }) => void;
}

const CreateTeamView: React.FC<CreateTeamViewProps> = ({ onBack, onCreate }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState<'Casual' | 'Intermedio' | 'Competitivo'>('Casual');
    const [logo, setLogo] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setLogo(result);
                }
            };
            reader.readAsDataURL(file);
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
                            <button type="button" onClick={handleLogoClick} className="font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline">
                                Subir logo
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Equipo</label>
                        <input type="text" id="team-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
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
                        <button type="button" onClick={onBack} className="py-2 px-5 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                        <button type="submit" className="py-2 px-5 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">Crear Equipo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeamView;