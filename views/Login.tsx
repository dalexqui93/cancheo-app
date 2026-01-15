
import React, { useState } from 'react';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { View } from '../types';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';

interface LoginProps {
    onLogin: (email: string, password: string, rememberMe: boolean) => void;
    onNavigateToHome: () => void;
    onNavigate: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToHome, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
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

        onLogin(email, password, rememberMe);
    };
    
    return (
        <div className="relative min-h-screen bg-darkGreen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
            {/* Background Layer with Video and strong Blur/Overlay */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-[40px] opacity-60"
                    aria-hidden="true"
                >
                    <source src="https://v1.pinimg.com/videos/mc/720p/98/de/85/98de855abb69ed5ffcf20e62977958c4.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-darkGreen/75"></div>
            </div>

            {/* Header / Branding */}
            <div className="relative z-10 flex flex-col items-center mb-10 text-center animate-ios">
                <div 
                    className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    onClick={onNavigateToHome}
                >
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" alt="Cancheo logo" className="h-16 w-16 rounded-2xl shadow-xl mb-2" />
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        Canche<span className="text-sportGreen">o</span>
                    </h1>
                </div>
                <p className="mt-2 text-xs font-medium text-white/50 uppercase tracking-[0.2em]">
                    Conectando jugadores con las mejores canchas
                </p>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-sm animate-slide-in-up">
                <div className="bg-white/10 backdrop-blur-xl rounded-[24px] shadow-glass p-8 border border-white/15">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido de nuevo</h2>
                        <p className="text-sm text-textMuted">
                            ¿No tienes una cuenta?{' '}
                            <button
                                onClick={() => onNavigate(View.REGISTER)}
                                className="font-bold text-sportGreen hover:text-sportGreen/80 transition-colors"
                            >
                                Regístrate
                            </button>
                        </p>
                    </div>

                    <form onSubmit={handleRegularLogin} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MailIcon className="h-5 w-5 text-white/30" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="block w-full h-[52px] bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/20 focus:border-sportGreen focus:ring-1 focus:ring-sportGreen transition-all outline-none sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-white/30" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full h-[52px] bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-white placeholder-white/20 focus:border-sportGreen focus:ring-1 focus:ring-sportGreen transition-all outline-none sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Secondary Options */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input 
                                    id="remember-me" 
                                    name="remember-me" 
                                    type="checkbox" 
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)} 
                                    className="h-4 w-4 rounded-md border-white/20 text-sportGreen focus:ring-sportGreen bg-white/5" 
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-white/60"> Recordarme </label>
                            </div>
                            <div className="text-xs">
                                <button
                                    type="button"
                                    onClick={() => onNavigate(View.FORGOT_PASSWORD)}
                                    className="font-semibold text-white/60 hover:text-white transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>
                        
                        {error && (
                            <p className="text-red-400 text-xs font-semibold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                                {error}
                            </p>
                        )}

                        {/* Primary Button */}
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full h-[54px] flex items-center justify-center rounded-2xl bg-sportGreen text-white font-bold text-sm uppercase tracking-widest shadow-button hover:bg-sportGreen/90 active:scale-[0.98] transition-all overflow-hidden"
                            >
                                <span className="relative z-10">Iniciar Sesión</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bottom Register Reminder */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => onNavigate(View.REGISTER)}
                        className="text-xs font-bold text-white/40 uppercase tracking-widest hover:text-sportGreen transition-colors"
                    >
                        ¿No tienes una cuenta? <span className="text-white">Regístrate gratis</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
