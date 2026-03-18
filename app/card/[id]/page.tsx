'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { decodeCardData, type CarCardData } from '@/lib/utils';
import { 
  Car, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  AlertTriangle,
  ShieldAlert,
  Info,
  QrCode,
  Download,
  User,
  Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

const BUTTON_CONFIG: Record<string, { label: string, icon: any, color: string }> = {
  evacuation: { label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500' },
  damage: { label: 'Повреждение', icon: ShieldAlert, color: 'bg-red-500' },
  vandalism: { label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500' },
  message: { label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500' },
};

export default function PublicCardView() {
  const params = useParams();
  const id = params.id as string;
  const [alertSent, setAlertSent] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  const card = React.useMemo(() => {
    if (!id) return null;
    return decodeCardData(id);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [card, id]);

  const sendAlert = (type: string) => {
    // Show local success message
    setAlertSent(type);
    
    const config = BUTTON_CONFIG[type];
    
    // Simple notification: Open Telegram with pre-filled message
    if (card?.telegram) {
      const alertMessage = encodeURIComponent(`Здравствуйте! Я у вашего авто ${card.carModel} (${card.plateNumber}). Сигнал: ${config?.label || type}. Пожалуйста, выйдите.`);
      window.open(`https://t.me/${card.telegram.replace('@', '')}?text=${alertMessage}`, '_blank');
    } else if (card?.phone1) {
      // If no telegram, maybe they want to call?
      // window.location.href = `tel:${card.phone1}`;
    }

    setTimeout(() => setAlertSent(null), 3000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${card?.plateNumber || 'car'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-gray-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Визитка не найдена</h1>
        <p className="text-gray-700 mt-2">Возможно, ссылка повреждена или неверна.</p>
      </div>
    );
  }

  const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/card/${id}` : '';

  if (!mounted) return null;

  return (
    <div 
      className="min-h-screen pb-12 transition-colors duration-500" 
      style={{ 
        backgroundColor: card.backgroundColor || '#f9fafb',
        color: card.textColor || '#111827'
      }}
      suppressHydrationWarning
    >
      {/* Hero Section */}
      <div 
        className="pt-12 pb-24 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500"
        style={{ 
          background: `linear-gradient(to bottom right, ${card.themeColor || '#991b1b'}, ${card.themeColor ? `${card.themeColor}dd` : '#4c0519'})`,
          color: '#ffffff' // Hero text usually white for contrast
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="relative w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden">
              <Car className="w-8 h-8 text-white" />
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <QrCode className="w-6 h-6" />
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2">{card.carModel}</h1>
          <div 
            className="inline-block bg-white px-4 py-1 rounded-lg font-mono font-bold text-xl uppercase tracking-widest shadow-lg"
            style={{ color: card.themeColor || '#111827' }}
          >
            {card.plateNumber}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-12 space-y-6">
        {/* Quick Actions */}
        {card.quickButtons.length > 0 && (
          <section className="grid grid-cols-2 gap-4">
            {card.quickButtons.map((btnId) => {
              const config = BUTTON_CONFIG[btnId];
              if (!config) return null;
              const Icon = config.icon;
              const isSent = alertSent === btnId;

              return (
                <motion.button
                  key={btnId}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendAlert(btnId)}
                  disabled={!!alertSent}
                  className={`relative overflow-hidden flex flex-col items-center justify-center min-h-[100px] p-4 rounded-3xl shadow-lg transition-all border-2 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
                    isSent 
                      ? 'bg-green-600 border-green-600 text-white ring-green-600' 
                      : `border-transparent text-white ring-offset-white`
                  }`}
                  style={!isSent ? { backgroundColor: card.themeColor || '#991b1b' } : {}}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isSent ? 'animate-bounce' : ''}`} />
                  <span className="font-bold text-xs uppercase tracking-tight text-center">
                    {isSent ? 'Отправлено!' : config.label}
                  </span>
                </motion.button>
              );
            })}
          </section>
        )}

        {/* Contact Info */}
        {card.showContact && (
          <section className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6">
            <h3 
              className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
              style={{ color: card.textColor || '#111827' }}
            >
              <Phone className="w-4 h-4" style={{ color: card.themeColor || '#991b1b' }} />
              Контакты владельца
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <User className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider opacity-70" style={{ color: card.textColor || '#111827' }}>Владелец</p>
                  <p className="font-bold text-lg" style={{ color: card.textColor || '#111827' }}>{card.ownerName}</p>
                  {card.telegram && (
                    <p className="text-sm font-medium text-sky-600 flex items-center gap-1 mt-0.5">
                      <Send className="w-3 h-3" />
                      @{card.telegram.replace('@', '')}
                    </p>
                  )}
                </div>
              </div>

              <a href={`tel:${card.phone1}`} className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-2xl p-1 -m-1">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider opacity-70" style={{ color: card.textColor || '#111827' }}>Телефон</p>
                  <p className="font-bold text-lg" style={{ color: card.textColor || '#111827' }}>{card.phone1}</p>
                </div>
              </a>

              {card.telegram && (
                <a href={`https://t.me/${card.telegram.replace('@', '')}`} target="_blank" className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-2xl p-1 -m-1">
                  <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center group-hover:bg-sky-200 transition-colors shadow-sm">
                    <Send className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-70" style={{ color: card.textColor || '#111827' }}>Telegram</p>
                    <p className="font-bold text-lg" style={{ color: card.textColor || '#111827' }}>{card.telegram}</p>
                  </div>
                </a>
              )}

              {card.whatsapp && (
                <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-2xl p-1 -m-1">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors shadow-sm">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-70" style={{ color: card.textColor || '#111827' }}>WhatsApp</p>
                    <p className="font-bold text-lg" style={{ color: card.textColor || '#111827' }}>{card.whatsapp}</p>
                  </div>
                </a>
              )}

              {card.max && (
                <div className="flex items-center gap-4 group rounded-2xl p-1 -m-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-70" style={{ color: card.textColor || '#111827' }}>Max</p>
                    <p className="font-bold text-lg" style={{ color: card.textColor || '#111827' }}>{card.max}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-1 gap-4">
          {card.phone1 && (
            <a 
              href={`tel:${card.phone1}`}
              className="flex items-center justify-center gap-3 text-white py-5 rounded-[2rem] font-bold text-lg transition-all active:scale-95 shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
              style={{ backgroundColor: card.themeColor || '#991b1b' }}
            >
              <Phone className="w-6 h-6" />
              Позвонить владельцу
            </a>
          )}
          {card.telegram && (
            <a 
              href={`https://t.me/${card.telegram.replace('@', '')}`}
              target="_blank"
              className="flex items-center justify-center gap-3 bg-[#229ED9] text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-[#1c86b9] transition-all active:scale-95 shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
            >
              <Send className="w-6 h-6" />
              Написать в Telegram
            </a>
          )}
        </div>
      </main>

      <footer className="mt-12 mb-8 text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Разработка и поддержка</p>
          <div className="flex items-center gap-4">
            <a 
              href="https://t.me/krisdev13" 
              target="_blank" 
              className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-1"
            >
              <Send className="w-4 h-4" />
              @krisdev13
            </a>
            <a 
              href="mailto:info@premiumwebsite.ru" 
              className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-1"
            >
              <Mail className="w-4 h-4" />
              info@premiumwebsite.ru
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-900 font-bold">© 2026 CarQR. Все права защищены.</p>
      </footer>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ваш QR-код</h2>
              <p className="text-gray-700 text-sm mb-6">Распечатайте и положите под лобовое стекло</p>
              
              <div className="bg-gray-50 p-6 rounded-3xl inline-block mb-6 border border-gray-100 w-full">
                {cardUrl.length > 2900 ? (
                  <div className="flex flex-col items-center justify-center p-4 text-red-600 space-y-2">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-xs font-bold uppercase">Данные слишком длинные</p>
                  </div>
                ) : (
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={cardUrl}
                    size={280}
                    level="L"
                    includeMargin={true}
                    className="mx-auto"
                  />
                )}
                {card.qrText && (
                  <p className="mt-4 text-xs font-bold text-gray-900 uppercase tracking-widest">
                    {card.qrText}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-800 to-rose-950 text-white py-3 px-4 rounded-2xl font-bold hover:from-red-900 hover:to-black transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Скачать
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="bg-gray-200 text-gray-800 py-3 px-4 rounded-2xl font-bold hover:bg-gray-300 transition-all active:scale-95"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
