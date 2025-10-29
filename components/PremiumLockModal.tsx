import React from 'react';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PremiumLockModalProps {
    onClose: () => void;
}

const PremiumFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3">
        <CheckCircleIcon className="w-5 h-5 text-[var(--color-primary-400)] mt-0.5 flex-shrink-0" />
        <span className="text-gray-300">{children}</span>
    </li>
);

const PremiumLockModal: React.FC<PremiumLockModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" 
            aria-modal="true" 
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-700 animate-slide-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                        type="button"
                        className="rounded-md bg-gray-700/50 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                        onClick={onClose}
                    >
                        <span className="sr-only">Cerrar</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-8 text-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-5 shadow-lg">
                        <SparklesIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold leading-6" id="modal-title">
                            Desbloquea Funciones Premium
                        </h3>
                        <div className="mt-3">
                            <p className="text-sm text-gray-400">
                                Pasa a Premium para personalizar tu experiencia y dominar la comunidad.
                            </p>
                        </div>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm">
                        <PremiumFeature>Personalización de <strong>Apariencia</strong> (temas y colores).</PremiumFeature>
                        <PremiumFeature>Acceso completo a la <strong>Comunidad</strong>.</PremiumFeature>
                        <PremiumFeature>Crea y gestiona tu propio <strong>Equipo</strong>.</PremiumFeature>
                        <PremiumFeature>Compite en <strong>Torneos</strong> exclusivos.</PremiumFeature>
                         <PremiumFeature>Participa en el <strong>Foro Deportivo</strong>.</PremiumFeature>
                    </ul>
                </div>
                
                <div className="bg-gray-800/50 px-6 py-4 space-y-3">
                     <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-br from-yellow-400 to-orange-500 px-4 py-3 text-base font-bold text-black shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-opacity"
                        onClick={onClose} // In a real app, this would lead to a purchase flow
                    >
                        Actualizar a Premium
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        onClick={onClose}
                    >
                        Quizás más tarde
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumLockModal;