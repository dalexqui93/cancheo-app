import React, { useState, useRef } from 'react';
import { View } from '../types';
import type { User, OwnerApplication } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { UploadIcon } from '../components/icons/UploadIcon';
import { XIcon } from '../components/icons/XIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';

interface OwnerRegisterViewProps {
    onRegister: (applicationData: Omit<OwnerApplication, 'id' | 'userId' | 'status' | 'userName' | 'userEmail'>, userData: Omit<User, 'id' | 'isOwner' | 'isAdmin' | 'favoriteFields' | 'isPremium' | 'playerProfile'>) => void;
    onNavigate: (view: View) => void;
    isOwnerRegisterLoading: boolean;
}

const OwnerRegisterView: React.FC<OwnerRegisterViewProps> = ({ onRegister, onNavigate, isOwnerRegisterLoading }) => {
    const [step, setStep] = useState(1);

    // User Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Complex Data
    const [complexName, setComplexName] = useState('');
    const [address, setAddress] = useState('');

    // Files
    const [rutFile, setRutFile] = useState<File | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    
    const [error, setError] = useState('');

    const rutInputRef = useRef<HTMLInputElement>(null);
    const photosInputRef = useRef<HTMLInputElement>(null);

    const handleNext = () => {
        setError('');
        if (step === 1) {
            if (!name || !email || !password || !phone) {
                setError('Por favor completa todos los campos.');
                return;
            }
             if (password.length < 8) {
                setError('La contraseña debe tener al menos 8 caracteres.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Por favor, introduce un correo electrónico válido.');
                return;
            }
        }
        if (step === 2) {
            if (!complexName || !address) {
                setError('Por favor completa todos los campos del complejo.');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleRutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRutFile(e.target.files[0]);
        }
    };

    const handlePhotosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotoFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5)); // Limit to 5 photos
        }
    };

    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rutFile || photoFiles.length === 0) {
            setError('Debes subir el RUT y al menos una foto del complejo.');
            return;
        }

        const userData = { name, email, phone, password };
        const applicationData = {
            complexName,
            address,
            phone,
            rutFileName: rutFile.name,
            photoFileNames: photoFiles.map(f => f.name),
        };
        
        onRegister(applicationData, userData);
    };

    const inputWithIconClasses = "block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-[var(--color-primary-500)] sm:text-sm bg-white dark:bg-gray-800";
    const iconInInputClasses = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400";


    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Paso 1: Datos del Propietario</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                            <div className="mt-1 relative"><UserIcon className={iconInInputClasses} /><input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputWithIconClasses} /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                            <div className="mt-1 relative"><MailIcon className={iconInInputClasses} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputWithIconClasses} /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono de Contacto</label>
                            <div className="mt-1 relative"><PhoneIcon className={iconInInputClasses} /><input type="tel" value={phone} onChange={e => {
                                const value = e.target.value;
                                if (value === '' || /^\d*$/.test(value)) {
                                    setPhone(value);
                                }
                            }} required className={inputWithIconClasses} /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                            <div className="mt-1 relative">
                                <LockIcon className={iconInInputClasses} />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className={`${inputWithIconClasses} pr-10`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-label="Toggle password visibility">
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Paso 2: Datos del Complejo</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Complejo Deportivo</label>
                            <div className="mt-1 relative"><IdentificationIcon className={iconInInputClasses} /><input type="text" value={complexName} onChange={e => setComplexName(e.target.value)} required className={inputWithIconClasses} /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                            <div className="mt-1 relative"><LocationIcon className={iconInInputClasses} /><input type="text" value={address} onChange={e => setAddress(e.target.value)} required className={inputWithIconClasses} /></div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Paso 3: Documentos</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RUT (Registro Único Tributario)</label>
                            <input type="file" ref={rutInputRef} onChange={handleRutFileChange} accept=".pdf" className="hidden" />
                            <button type="button" onClick={() => rutInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]">
                                <UploadIcon className="w-5 h-5" />
                                <span>{rutFile ? rutFile.name : 'Subir archivo PDF'}</span>
                            </button>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fotos del Complejo (máx. 5)</label>
                            <input type="file" ref={photosInputRef} onChange={handlePhotosFileChange} accept="image/*" multiple className="hidden" />
                            <button type="button" onClick={() => photosInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]">
                                <CameraIcon className="w-5 h-5" />
                                <span>Subir fotos</span>
                            </button>
                            {photoFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {photoFiles.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><XIcon className="w-3 h-3"/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                 <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Registra tu Complejo
                </h2>
                 <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Únete a la red de canchas más grande.
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border dark:border-gray-700">
                    <form onSubmit={handleSubmit}>
                        {renderStep()}
                        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                        <div className="mt-8 flex items-center justify-between">
                            {step > 1 ? (
                                <button type="button" onClick={handleBack} disabled={isOwnerRegisterLoading} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    Atrás
                                </button>
                            ) : (
                                <button type="button" onClick={() => onNavigate(View.REGISTER)} disabled={isOwnerRegisterLoading} className="text-sm font-medium text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:text-[var(--color-primary-700)] dark:hover:text-[var(--color-primary-300)] disabled:opacity-50 disabled:cursor-not-allowed">
                                    ¿Eres jugador?
                                </button>
                            )}
                            {step < 3 ? (
                                <button type="button" onClick={handleNext} disabled={isOwnerRegisterLoading} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Siguiente
                                </button>
                            ) : (
                                <button type="submit" disabled={isOwnerRegisterLoading} className="py-2 px-4 w-36 h-9 flex justify-center items-center rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                                     {isOwnerRegisterLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </>
                                    ) : (
                                        'Enviar Solicitud'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OwnerRegisterView;