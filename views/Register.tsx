
import React, { useState } from 'react';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { GenderIcon } from '../components/icons/GenderIcon';
import { View } from '../types';
import type { User } from '../types';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';

interface RegisterProps {
    onRegister: (newUser: Omit<User, 'id' | 'isAdmin' | 'favoriteFields' | 'isPremium' | 'playerProfile'>) => void;
    onNavigate: (view: View) => void;
    isRegisterLoading: boolean;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigate, isRegisterLoading }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [identification, setIdentification] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Masculino');
    
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all fields are mandatory
        if (!name || !email || !phone || !password || !confirmPassword || !identification || !age || !gender) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
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

        const newUser = {
            name,
            email,
            phone,
            password,
            identification,
            age: parseInt(age),
            gender,
            isOwner: false,
            notificationPreferences: {
                newAvailability: true,
                specialDiscounts: true,
                importantNews: true,
            },
            loyalty: {},
            paymentMethods: [],
        };

        onRegister(newUser);
    };

    return (
        <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
            <img
                src="https://i.pinimg.com/1200x/f9/89/d2/f989d246718c1e7a76fb3bd6933f602e.jpg"
                alt="Jugador de fútbol"
                className="absolute inset-0 w-full h-full object-cover filter blur-sm brightness-60 scale-110"
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 w-full max-w-md animate-slide-in-up">
                <div className="flex items-center justify-center gap-2 cursor-pointer mb-6" onClick={() => onNavigate(View.HOME)}>
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo logo" className="h-10 w-10 rounded-full" />
                    <h1 className="text-4xl font-bold tracking-tight text-white">Canche<span className="text-[var(--color-primary-400)]">o</span></h1>
                </div>

                <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white text-center">
                            Crea una cuenta nueva
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-200">
                            ¿Ya tienes una cuenta?{' '}
                            <button onClick={() => onNavigate(View.LOGIN)} className="font-medium text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)]">
                                Inicia sesión
                            </button>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-100">Nombre Completo</label>
                                <div className="mt-1 relative">
                                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="identification" className="block text-sm font-medium text-gray-100">Identificación</label>
                                <div className="mt-1 relative">
                                    <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input 
                                        id="identification" 
                                        name="identification" 
                                        type="tel" 
                                        required 
                                        value={identification} 
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*$/.test(value)) {
                                                setIdentification(value);
                                            }
                                        }}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-100">Edad</label>
                                    <div className="mt-1 relative">
                                        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input id="age" name="age" type="number" required value={age} onChange={(e) => setAge(e.target.value)} min="12" max="100"
                                            className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                    </div>
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-100">Género</label>
                                    <div className="mt-1 relative">
                                        <GenderIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <select id="gender" name="gender" required value={gender} onChange={(e) => setGender(e.target.value)}
                                            className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white"
                                        >
                                            <option value="Masculino" className="text-gray-900">Masculino</option>
                                            <option value="Femenino" className="text-gray-900">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-100">Correo Electrónico</label>
                                <div className="mt-1 relative">
                                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-100">Teléfono</label>
                                <div className="mt-1 relative">
                                    <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input id="phone" name="phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*$/.test(value)) {
                                                setPhone(value);
                                            }
                                        }}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-100">Contraseña</label>
                                <div className="mt-1 relative">
                                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 pr-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-100">Confirmar Contraseña</label>
                                <div className="mt-1 relative">
                                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input id="confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 pr-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300"
                                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            
                            {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}

                            <div>
                                <button type="submit" disabled={isRegisterLoading}
                                    className="flex w-full justify-center items-center rounded-md border border-transparent bg-[var(--color-primary-600)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isRegisterLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </>
                                    ) : (
                                        'Registrarse'
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-500" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gray-800/50 px-2 text-gray-200 backdrop-blur-sm rounded-md">O</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => onNavigate(View.OWNER_REGISTER)}
                                    className="font-medium text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)]"
                                >
                                    ¿Tienes una cancha? Regístrala aquí
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Register;
