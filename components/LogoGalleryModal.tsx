import React, { useState, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { UploadIcon } from './icons/UploadIcon';

const freeLogos = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY2MEMxMCAxMDAgNTAgMTIwIDUwIDEyMFM5MCAxMDAgOTAgNjBWMjBaIiBmaWxsPSIjMDM2OUYzIiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0xMCA2MEg5MCIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMjUgNjBWMTIwTTQyIDYwVjEyME01OCA2MFYxMjBNNzUgNjBWMTIwIiBzdHJva2U9IiNGRkYiIHN0cm9rZS1wYXJhbWV0ZXI9ImZpbGwtcnVsZTogZXZlbm9kZDsiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik01MCAyNWw1Ljg3OCAxMS45NyAxMy4yMi45NTYtOS42ODYgOC43NiAyLjUgMTMuMDE0TDUwIDUwLjZsLTExLjkxMiA3LjEgMi41LTEzLjAxNC05LjY4Ni04Ljc2IDEzLjIyLS45NTZaIiBmaWxsPSIjRkZGIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI0Q0MDAwMCIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48ZyBmaWxsPSIjRkZGIj48cGF0aCBkPSJNNTAsMjUgbC0xMiw1IDI KMTIgMTAsNSAxMCwtNSAyLC0xMiB6Ii8+PHBhdGggZD0iTTM4LDMwIGwtMTAsLTUgLTIsMTIgMTAsNSB6Ii8+PHBhdGggZD0iTTYyLDMwIGwxMCwtNSAyLDEyIC0xMCw1eiIvPjxwYXRoIGQ9Ik0zNiw0NyBsLTEyLC0yIDUsMTAgMTIsLTMgeiIvPjxwYXRoIGQ9Ik02NCw0NyBsMTIsLTIgLTUsMTAgLTEyLC0zIHoiLz48cGF0aCBkPSJNNTAsNTcgbC0xMCw1IDUsMTAgMTAsMCA1LC0xMCB6Ii8+PC9nPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY5MEw1MCAxMjAgTDkwIDkwIFYyMFoiIGZpbGw9IiMwMDgwODAiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTIwIDQ1IEw1MCA2MCBMODAgNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI4Ii8+PHBhdGggZD0iTTIwIDY1IEw1MCA4MCBMODAgNjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI4Ii8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMTAwIj48cGF0aCBkPSJNNzUgMTBMMzUgNDBWODVMMzUgODUgQzM1IDg1IDYwIDcwIDc1IDcwIEM5MCA3MCAxMTUgODUgMTE1IDg1IEwxMTUgNDBaIiBmaWxsPSIjNDg1Qjc3IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0zNSA0MEMyNSA0MCAxNSA1MCAxMCA2MEgzMEMzNSA1NSAzNSA0MHoiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMTE1IDQwIEMxMjUgNDAgMTM1IDUwIDE0MCA2MEgxMjBDMTE1IDU1IDExNSA0MHoiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY2MEMxMCAxMDAgNTAgMTIwIDUwIDEyMFM5MCAxMDAgOTAgNjBWMjBaIiBmaWxsPSIjNkE3OTg3IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik00MCA0MEg2MFY2MEg0MFY0MFogTTQwIDYwIEwzNSA4MEg2NUw2MCA2MFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTQyIDMyIEg0N1Y0MEg0MiBNNTMgMzIgSDU4VjQwSDUzIiBmaWxsPSIjRkZGIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY2MEMxMCAxMDAgNTAgMTIwIDUwIDEyMFM5MCAxMDAgOTAgNjBWMjBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAwTDEwIDIwVjYwQzEwIDEwMCA1MCAxMjAgNTAgMTIwUzkwIDEwMCA5MCA2MFYyMFoiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJNMCA4MEwxMDAgMjAiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIxOCIvPjxwYXRoIGQ9Ik0wIDExMEwxMDAgNTAiIHN0cm9rZT0iIzAwNjFCMiIgc3Ryb2tlLXdpZHRoPSIxOCIvPjwvc3ZnPg==',
];

const premiumLogos = [
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgyPSIwIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y4ZDRhNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2YyYjgyMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik01MCAwTDUgMjBWNjVDNSAxMDUgNTAgMTIwIDUwIDEyMFM5NSAxMDUgOTUgNjVW MjBaIiBmaWxsPSIjMjIyIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAxMEwxNSAyOFY2NUMxNSA5NSA1MCAxMTAgNTAgMTEwUzg1IDk1IDg1IDY1VjI4WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI2cpIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNjIgMzVsLTcgMTAtNSA1LTUgMTUgMiAxMiAxNCA1IDEzLTggMy0xNC05LTE1eiBNNDQgNDhsNCA1IDgtMiA1IDUgNS04LTUtMTAgNSA1LTgtMjAtNS01eiIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==', price: '29.999' },
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InMiIHgyPSIwIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2UzZTJlMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2M3YzZjNiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik01MCAwTDUgMjBWNjVDNSAxMDUgNTAgMTIwIDUwIDEyMFM5NSAxMDUgOTUgNjVW MjBaIiBmaWxsPSIjNDEzYzZhIiBzdHJva2U9InVybCgjcykiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAyNUMyNSA0MCAyNSA2MCA1MCA4MEw3NSA2MFY0MFoiIGZpbGw9InVybCgjcykiLz48cGF0aCBkPSJNNTAgMjVMMjUgNDBINzVMMjUgNDBaIE0yNSA0MEwyNSA2MEg3NVY2MFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+', price: '29.999' },
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgyPSIwIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y4ZDRhNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2YyYjgyMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik01MCAwTDQgMjBWNjVDNCAxMDUgNTAgMTIwIDUwIDEyMFM5NiAxMDUgOTYgNjVW MjBaIiBmaWxsPSIjMDAwIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0yNSA0MEwzNSAzMEw1MCA0MEw2NSAzMEw3NSA0MEw1MCA3MFoiIGZpbGw9InVybCgjZykiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjI4IiByPSI0IiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNjUiIGN5PSIyOCIgcj0iNCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjQiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=', price: '29.999' },
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNIDMwIDgwIEEgMzAgMzAgMCAwIDEgNzAgODAgTCA1MCA1MCB6IiBmaWxsPSIjQzAwIj48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCA1MCA1MCIgdG89IjM2MCA1MCA1MCIgZHVyPSIxMHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9wYXRoPjxwYXRoIGQ9Ik0gNTAgMjAgQSAzMCAzMCAwIDAgMSA1MCA4MCAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+', price: '29.999' },
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY2MEMxMCAxMDAgNTAgMTIwIDUwIDEyMFM5MCAxMDAgOTAgNjBWMjBaIiBmaWxsPSIjMDMwMDVDIiBzdHJva2U9IiMwMEFGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAzMEE1MCA4MCAwIDAgMCAyNSA2MEE4MCA1MCAwIDAgMCA1MCA5MEExMDAgNTAgMCAwIDAgNzUgNjBBMjAgODAgMCAwIDAgNTAgMzAiIGZpbGw9IiMwMEFGRkYiLz48cGF0aCBkPSJNNTAgMzVDNDAgNDAgNDAgNTUgNTAgNTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAzMDA1QyIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+', price: '29.999' },
    { url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzIyMiIgc3Ryb2tlPSIjZmVkNzAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjYwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmVkNzAwIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjYwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmVkNzAwIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmVkNzAwIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=', price: '29.999' },
];

type Tab = 'free' | 'premium' | 'canva';

interface LogoGalleryModalProps {
  teamName: string;
  onSelectLogo: (logoUrl: string) => void;
  onClose: () => void;
}

const LogoGalleryModal: React.FC<LogoGalleryModalProps> = ({ teamName, onSelectLogo, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('canva');
    const [selectedLogo, setSelectedLogo] = useState<{ url: string; price?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = () => {
        if (!selectedLogo) return;

        if (selectedLogo.price) {
            setIsProcessing(true);
            setTimeout(() => {
                onSelectLogo(selectedLogo.url);
            }, 1500);
        } else {
            onSelectLogo(selectedLogo.url);
        }
    };
    
    const renderCanvaCreator = () => {
        const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadedLogo(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };

        const canvaUrl = `https://www.canva.com/create/logos/?q=${encodeURIComponent(teamName)}`;

        return (
             <div className="p-6 flex flex-col items-center justify-center text-center">
                 <img src="https://static.canva.com/static/images/Canva_Wordmark_1024_RGB.png" alt="Canva Logo" className="w-32 mb-4"/>
                <h3 className="text-2xl font-bold">Crea tu Logo Profesional</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">
                    Usa el poder de Canva para diseñar un logo único y luego súbelo aquí.
                </p>

                <div className="text-left w-full max-w-sm mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-600)] text-white font-bold flex items-center justify-center flex-shrink-0">1</div>
                        <div>
                            <p className="font-semibold">Diseña en Canva</p>
                            <a href={canvaUrl} target="_blank" rel="noopener noreferrer" className="w-full mt-1 inline-block py-2 px-5 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 shadow-sm text-sm">
                                Crear logo en Canva
                            </a>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-600)] text-white font-bold flex items-center justify-center flex-shrink-0">2</div>
                        <div>
                            <p className="font-semibold">Descarga y Sube</p>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-sm">
                                <UploadIcon className="w-5 h-5"/>
                                Seleccionar archivo...
                            </button>
                        </div>
                    </div>
                </div>

                {uploadedLogo && (
                    <div className="mt-6">
                        <h4 className="font-bold mb-2">Vista Previa</h4>
                        <div className="w-40 h-40 bg-gray-900 rounded-xl flex items-center justify-center p-2 relative shadow-lg">
                            <img src={uploadedLogo} alt="Uploaded logo" className="max-w-full max-h-full object-contain"/>
                        </div>
                         <button onClick={() => onSelectLogo(uploadedLogo)} className="mt-4 py-2 px-8 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm">
                            Usar este Logo
                        </button>
                    </div>
                )}
             </div>
        );
    };

    const renderGallery = () => (
        <>
            <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                    {(activeTab === 'free' ? freeLogos : premiumLogos).map((logo, i) => (
                        <button key={i} onClick={() => setSelectedLogo(typeof logo === 'string' ? { url: logo } : logo)} className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center p-2 border-2 border-transparent hover:border-[var(--color-primary-500)] transition-colors relative group">
                            <img src={typeof logo === 'string' ? logo : logo.url} alt={`Logo ${i + 1}`} className="max-w-full max-h-full object-contain" />
                            {typeof logo !== 'string' && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                                    ${logo.price}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    const renderPreview = () => (
        <>
             <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <button onClick={() => setSelectedLogo(null)} className="flex items-center gap-1 font-semibold text-sm hover:text-gray-300"><ChevronLeftIcon className="w-5 h-5"/> Volver</button>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-56 h-56 bg-gray-900 rounded-xl flex items-center justify-center p-4 relative shadow-lg">
                    <img src={selectedLogo!.url} alt="Selected logo" className="max-w-full max-h-full object-contain"/>
                </div>
                <h4 className="text-2xl font-bold mt-4">{teamName}</h4>
                <p className="text-sm text-gray-400">Así se verá tu nuevo logo</p>
            </div>
            <div className="p-4 bg-gray-900/50 border-t border-white/10 flex justify-end">
                <button onClick={handleConfirm} disabled={isProcessing} className="py-2 px-5 w-48 h-10 flex justify-center items-center rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm disabled:bg-gray-500">
                    {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : (selectedLogo?.price ? `Comprar por $${selectedLogo.price}` : 'Usar este Logo')}
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                 <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Galería de Logos</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-4 border-b border-white/10">
                    <div className="flex space-x-1 rounded-lg bg-gray-900/50 p-1">
                        <button onClick={() => setActiveTab('canva')} className={`w-full rounded-md py-1.5 text-sm font-semibold leading-5 transition flex items-center justify-center gap-1 ${activeTab === 'canva' ? 'bg-gray-700 shadow text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>
                           <img src="https://static.canva.com/static/images/favicon.ico" className="w-4 h-4" alt="Canva Favicon"/> Diseñar en Canva
                        </button>
                        <button onClick={() => setActiveTab('free')} className={`w-full rounded-md py-1.5 text-sm font-semibold leading-5 transition ${activeTab === 'free' ? 'bg-gray-700 shadow text-white' : 'text-gray-300 hover:bg-gray-600/50'}`}>Gratis</button>
                        <button onClick={() => setActiveTab('premium')} className={`w-full rounded-md py-1.5 text-sm font-semibold leading-5 transition flex items-center justify-center gap-1 ${activeTab === 'premium' ? 'bg-gray-700 shadow text-yellow-400' : 'text-gray-300 hover:bg-gray-600/50'}`}><SparklesIcon className="w-4 h-4"/> Premium</button>
                    </div>
                </div>

                {selectedLogo ? renderPreview() : (
                    <div className="flex-grow overflow-y-auto">
                        {activeTab === 'canva' && renderCanvaCreator()}
                        {(activeTab === 'free' || activeTab === 'premium') && renderGallery()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogoGalleryModal;
