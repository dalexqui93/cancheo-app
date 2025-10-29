import React, { useState } from 'react';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { View } from '../types';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';

interface LoginProps {
    onLogin: (email: string, password: string) => void;
    onNavigateToHome: () => void;
    onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToHome, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegularLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return;
        }

        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        onLogin(email, password);
    };
    
    return (
        <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover filter blur-sm brightness-60 scale-110"
                aria-hidden="true"
            >
                <source src="https://v1.pinimg.com/videos/mc/720p/98/de/85/98de855abb69ed5ffcf20e62977958c4.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0"></div>

            <div className="relative z-10 w-full max-w-sm animate-slide-in-up">
                 {/* Branding Section */}
                <div className="text-center text-white mb-8">
                    <div 
                        className="flex items-center justify-center gap-2 cursor-pointer mb-4"
                        onClick={onNavigateToHome}
                    >
                        <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo logo" className="h-10 w-10 rounded-full" />
                        <h1 className="text-4xl font-bold tracking-tight">Canche<span className="text-[var(--color-primary-400)]">o</span></h1>
                    </div>
                    <p className="text-lg text-gray-200">Conectando jugadores con las mejores canchas.</p>
                </div>
                
                {/* Form Section */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Bienvenido de Nuevo</h2>
                        <p className="mt-2 text-sm text-gray-200">
                            ¿No tienes una cuenta?{' '}
                            <button
                                onClick={() => onNavigate(View.REGISTER)}
                                className="font-medium text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)]"
                            >
                                Regístrate
                            </button>
                        </p>
                    </div>
                    <div className="mt-6">
                        <form onSubmit={handleRegularLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-100">
                                    Correo Electrónico
                                </label>
                                <div className="mt-1 relative">
                                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input
                                        id="email" name="email" type="email" autoComplete="email" required
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                                    Contraseña
                                </label>
                                <div className="mt-1 relative">
                                     <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input
                                        id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-white/30 py-2 px-3 pl-10 pr-10 placeholder-gray-300 shadow-sm focus:border-[var(--color-primary-400)] focus:outline-none focus:ring-[var(--color-primary-400)] sm:text-sm bg-white/10 text-white"
                                    />
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300/50 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-400)] bg-transparent" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200"> Recordarme </label>
                                </div>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={() => onNavigate(View.FORGOT_PASSWORD)}
                                        className="font-medium text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)]"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                             </div>
                            
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md border border-transparent bg-[var(--color-primary-600)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
                                >
                                    Iniciar Sesión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;