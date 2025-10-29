import React from 'react';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import Accordion from '../components/Accordion';
import { View } from '../types';

interface HelpViewProps {
    onNavigate: (view: View, options?: { isBack?: boolean }) => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
            <button onClick={() => onNavigate(View.PROFILE, { isBack: true })} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Perfil
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Ayuda y Soporte</h1>
            <p className="text-gray-600 dark:text-gray-400">
                Encuentra respuestas a tus preguntas más comunes.
            </p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Preguntas Frecuentes</h2>
                
                <Accordion title="¿Cómo busco una cancha?">
                    <p>Usa la barra de búsqueda en la página de inicio para buscar por ciudad o nombre de la cancha. También puedes usar los botones de categoría (Fútbol 5, 7, 11) para ver todas las canchas de un tamaño específico.</p>
                </Accordion>
                
                <Accordion title="¿Cómo guardo una cancha en mis favoritos?">
                    <p>En la tarjeta de la cancha o en la página de detalles, haz clic en el ícono de corazón (♡). Tus canchas favoritas aparecerán en la sección "Mis Canchas Favoritas" de tu perfil para un acceso rápido.</p>
                </Accordion>

                <Accordion title="¿Cómo reservo una cancha?">
                    <p>Una vez que encuentres una cancha, ve a su página de detalles. Selecciona una fecha y una hora disponible en el calendario, haz clic en "Reservar ahora" y sigue los pasos para añadir extras y confirmar tu pago.</p>
                </Accordion>

                <Accordion title="¿Qué métodos de pago aceptan?">
                    <p>Aceptamos pagos con las principales tarjetas de crédito y débito. También, muchas canchas ofrecen la opción de "Pagar en el sitio", lo que te permite reservar tu espacio y pagar en efectivo o con otros métodos directamente en el establecimiento.</p>
                </Accordion>
                
                <Accordion title="¿Puedo cancelar mi reserva?">
                    <p>Sí, puedes cancelar tu reserva desde la sección "Mis Reservas". Ve al detalle de la reserva que deseas cancelar y busca la opción para hacerlo. Ten en cuenta que se aplican nuestras políticas de cancelación.</p>
                </Accordion>

                <Accordion title="¿Cuál es la política de cancelación?">
                    <p>Puedes cancelar una reserva sin costo alguno si lo haces con más de 6 horas de antelación. Si pagaste con tarjeta, recibirás un reembolso completo. Las cancelaciones realizadas con menos de 6 horas de antelación no son reembolsables.</p>
                </Accordion>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 text-center">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">¿Aún necesitas ayuda?</h2>
                 <p className="text-gray-600 dark:text-gray-400 mb-4">Si no encuentras la respuesta que buscas, nuestro equipo de soporte está listo para ayudarte.</p>
                 <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="mailto:soporte@cancheo.com" className="font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline">soporte@cancheo.com</a>
                    <span className="hidden sm:block text-gray-300 dark:text-gray-600">|</span>
                    <a href="tel:+573001234567" className="font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:underline">+57 300 123 4567</a>
                 </div>
            </div>
        </div>
    );
};

export default HelpView;