import React from 'react';
import { View } from '../types';
import { ClockIcon } from '../components/icons/ClockIcon';

interface OwnerPendingVerificationViewProps {
  onNavigate: (view: View) => void;
}

const OwnerPendingVerificationView: React.FC<OwnerPendingVerificationViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl dark:border dark:border-gray-700">
      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
        <ClockIcon className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">
        Solicitud en Revisión
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        Gracias por registrar tu complejo de canchas en Cancheo. Hemos recibido tu información y la estamos revisando.
        <br/><br/>
        Este proceso puede tardar hasta 48 horas. Te notificaremos por correo electrónico una vez que tu cuenta haya sido aprobada.
      </p>
      <button
        onClick={() => onNavigate(View.HOME)}
        className="mt-8 w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-700)] transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default OwnerPendingVerificationView;