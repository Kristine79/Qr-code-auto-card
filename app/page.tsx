'use client';

import React, { useState } from 'react';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encodeCardData, type CarCardData } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const BUTTON_OPTIONS = [
  { id: 'evacuation', label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500' },
  { id: 'damage', label: 'Повреждение', icon: ShieldAlert, color: 'bg-red-500' },
  { id: 'vandalism', label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500' },
  { id: 'message', label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500' },
];

export default function Home() {
  const [formData, setFormData] = useState<CarCardData>({
    carModel: '',
    plateNumber: '',
    ownerName: '',
    phone1: '',
    showText: true,
    text: 'Пожалуйста, позвоните мне, если моя машина мешает.',
    showContact: true,
    quickButtons: ['evacuation', 'damage', 'message'],
  });

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleButton = (id: string) => {
    setFormData(prev => ({
      ...prev,
      quickButtons: prev.quickButtons.includes(id)
        ? prev.quickButtons.filter(b => b !== id)
        : [...prev.quickButtons, id]
    }));
  };

  const generateQR = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeCardData(formData);
    const url = `${window.location.origin}/card/${encoded}`;
    setGeneratedUrl(url);
    setShowQR(true);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${formData.plateNumber || 'car'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CarQR</span>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Stateless Mode
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создать QR-визитку</h1>
              <p className="text-gray-500 text-sm">Данные не сохраняются на сервере, а шифруются в коде</p>
            </div>
          </div>

          <form onSubmit={generateQR} className="space-y-8">
            {/* Car Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Car className="w-4 h-4" />
                Автомобиль
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Марка и модель</label>
                  <input
                    required
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleInputChange}
                    placeholder="Например: Tesla Model 3"
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Госномер</label>
                  <input
                    required
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    placeholder="А123ВС 777"
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all font-mono uppercase tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" />
                Владелец
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Ваше имя</label>
                  <input
                    required
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Иван Иванов"
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Телефон</label>
                  <input
                    required
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleInputChange}
                    placeholder="+7 900 000-00-00"
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Send className="w-4 h-4" />
                Мессенджеры (необязательно)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  placeholder="Telegram (без @)"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all"
                />
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="WhatsApp (номер)"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            {/* Custom Text */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Сообщение
              </h3>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows={3}
                placeholder="Текст, который увидят при сканировании..."
                className="w-full bg-gray-50 border-none rounded-3xl px-5 py-4 focus:ring-2 focus:ring-red-500 transition-all resize-none"
              />
            </div>

            {/* Quick Buttons */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Быстрые кнопки
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUTTON_OPTIONS.map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => toggleButton(btn.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${
                      formData.quickButtons.includes(btn.id)
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 border-transparent text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <btn.icon className="w-6 h-6 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white py-5 rounded-[2rem] font-bold text-xl hover:from-red-700 hover:to-rose-800 transition-all active:scale-95 shadow-2xl shadow-red-100 flex items-center justify-center gap-3"
            >
              <QrCode className="w-6 h-6" />
              Сгенерировать QR-код
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-800 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-red-200" />
            Как это работает?
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Вся информация о вашей машине зашифрована прямо внутри QR-кода. Мы не храним ваши данные на сервере.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <span>Заполните форму выше вашими контактами.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <span>Нажмите кнопку генерации и скачайте QR-код.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <span>Распечатайте его и положите под лобовое стекло.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && generatedUrl && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ваш QR-код готов!</h2>
              <p className="text-gray-500 text-sm mb-8">Распечатайте его и положите под лобовое стекло</p>
              
              <div className="bg-gray-50 p-6 rounded-3xl inline-block mb-8 border border-gray-100">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={generatedUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 text-white py-4 px-4 rounded-2xl font-bold hover:from-red-700 hover:to-rose-800 transition-all active:scale-95 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Скачать изображение
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="bg-gray-100 text-gray-600 py-4 px-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
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
