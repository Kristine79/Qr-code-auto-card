'use client';

import React, { useState } from 'react';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encodeCardData, type CarCardData } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const BUTTON_OPTIONS = [
  { id: 'evacuation', label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500' },
  { id: 'damage', label: 'Повреждение', icon: ShieldAlert, color: 'bg-red-500' },
  { id: 'vandalism', label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500' },
  { id: 'message', label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500' },
];

const CAR_MODELS = [
  'Toyota Camry', 'Toyota Corolla', 'Toyota RAV4', 'Toyota Land Cruiser',
  'Honda Civic', 'Honda Accord', 'Honda CR-V',
  'Ford Focus', 'Ford Mustang', 'Ford Explorer',
  'BMW 3 Series', 'BMW 5 Series', 'BMW X5', 'BMW X3',
  'Mercedes-Benz C-Class', 'Mercedes-Benz E-Class', 'Mercedes-Benz S-Class', 'Mercedes-Benz GLE',
  'Audi A4', 'Audi A6', 'Audi Q5', 'Audi Q7',
  'Volkswagen Golf', 'Volkswagen Passat', 'Volkswagen Tiguan', 'Volkswagen Polo',
  'Hyundai Solaris', 'Hyundai Creta', 'Hyundai Tucson', 'Hyundai Santa Fe',
  'Kia Rio', 'Kia Sportage', 'Kia Ceed', 'Kia K5',
  'Lada Vesta', 'Lada Granta', 'Lada Niva',
  'Tesla Model 3', 'Tesla Model Y', 'Tesla Model S', 'Tesla Model X',
  'Mazda CX-5', 'Mazda 6', 'Mazda 3',
  'Nissan Qashqai', 'Nissan X-Trail', 'Nissan Juke',
  'Skoda Octavia', 'Skoda Rapid', 'Skoda Kodiaq',
  'Renault Logan', 'Renault Duster', 'Renault Sandero',
  'Lexus RX', 'Lexus NX', 'Lexus LX',
  'Porsche Cayenne', 'Porsche Macan', 'Porsche 911',
  'Land Rover Range Rover', 'Land Rover Defender',
  'Volvo XC60', 'Volvo XC90',
  'Chery Tiggo', 'Haval Jolion', 'Geely Coolray'
];

export default function Home() {
  const [formData, setFormData] = useState<CarCardData>({
    carModel: '',
    plateNumber: '',
    ownerName: '',
    phone1: '',
    phone2: '',
    email: '',
    telegram: '',
    whatsapp: '',
    showText: true,
    text: 'Мешаю? Напиши мне! 📲\nЯ прибегу через минуту. Пожалуйста, не вызывай эвакуатор, я уже бегу 🏃',
    showContact: true,
    quickButtons: ['evacuation', 'damage', 'message'],
  });

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instruction: false,
    car: false,
    owner: true,
    socials: false,
    message: false,
    buttons: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" suppressHydrationWarning>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-rose-950 rounded-lg flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CarQR</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-rose-950 rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создать QR-визитку</h1>
              <p className="text-gray-500 text-sm">Данные шифруются прямо в коде</p>
            </div>
          </div>

          {/* Instruction Section */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <button
              type="button"
              onClick={() => toggleSection('instruction')}
              className="w-full flex items-center justify-between group"
            >
              <h2 className="text-xl font-bold text-gray-900">Как это работает?</h2>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                {expandedSections.instruction ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSections.instruction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-6">
                    <p className="text-gray-500 leading-relaxed">
                      Автовизитка — ваш цифровой бейдж для автомобиля. Разместите QR-код на лобовом стекле, чтобы другие участники движения могли быстро связаться с вами.
                    </p>

                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Заполните форму', desc: 'укажите марку, госномер и, при желании, контактные данные и кнопки быстрой связи.' },
                        { step: 2, title: 'Сгенерируйте QR-код', desc: 'нажмите кнопку, и система создаст уникальный код с вашими данными.' },
                        { step: 3, title: 'Скачайте и распечатайте', desc: 'разместите QR-код под лобовым стеклом или на видном месте автомобиля.' },
                        { step: 4, title: 'Получайте уведомления', desc: 'при сканировании кода откроется страница с вашей визиткой и кнопками связи.' },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center text-sm font-bold">
                            {item.step}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-900">{item.title}</span> — {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        💡 <span className="font-bold text-gray-900">Приватность:</span> вы сами выбираете, какие контактные данные показывать. Можно оставить только кнопки быстрой связи без личной информации.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={generateQR} className="space-y-5">
            {/* Car Info */}
            <div className="space-y-3 border-b border-gray-50 pb-5">
              <button 
                type="button"
                onClick={() => toggleSection('car')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Автомобиль
                </div>
                {expandedSections.car ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {expandedSections.car && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Марка и модель *</label>
                        <input
                          required={expandedSections.car}
                          name="carModel"
                          list="car-models"
                          value={formData.carModel || ''}
                          onChange={handleInputChange}
                          placeholder="Например: Tesla Model 3"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                        />
                        <datalist id="car-models">
                          {CAR_MODELS.map(model => (
                            <option key={model} value={model} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Госномер *</label>
                        <input
                          required={expandedSections.car}
                          name="plateNumber"
                          value={formData.plateNumber || ''}
                          onChange={handleInputChange}
                          placeholder="А123ВС 777"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all font-mono uppercase tracking-widest"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Owner Info */}
            <div className="space-y-3 border-b border-gray-50 pb-5">
              <button 
                type="button"
                onClick={() => toggleSection('owner')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Владелец
                </div>
                {expandedSections.owner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {expandedSections.owner && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Ваше имя *</label>
                        <input
                          required={expandedSections.owner}
                          name="ownerName"
                          value={formData.ownerName || ''}
                          onChange={handleInputChange}
                          placeholder="Иван Иванов"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Основной телефон *</label>
                        <input
                          required={expandedSections.owner}
                          name="phone1"
                          value={formData.phone1 || ''}
                          onChange={handleInputChange}
                          placeholder="+7 900 000-00-00"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Доп. телефон</label>
                        <input
                          name="phone2"
                          value={formData.phone2 || ''}
                          onChange={handleInputChange}
                          placeholder="+7 900 000-00-00"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          placeholder="example@mail.ru"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Socials */}
            <div className="space-y-3 border-b border-gray-50 pb-5">
              <button 
                type="button"
                onClick={() => toggleSection('socials')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Мессенджеры
                </div>
                {expandedSections.socials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {expandedSections.socials && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <input
                        name="telegram"
                        value={formData.telegram || ''}
                        onChange={handleInputChange}
                        placeholder="Telegram (без @)"
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                      />
                      <input
                        name="whatsapp"
                        value={formData.whatsapp || ''}
                        onChange={handleInputChange}
                        placeholder="WhatsApp (номер)"
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 focus:ring-2 focus:ring-red-800 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Text */}
            <div className="space-y-3 border-b border-gray-50 pb-5">
              <button 
                type="button"
                onClick={() => toggleSection('message')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Сообщение
                </div>
                {expandedSections.message ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {expandedSections.message && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <textarea
                        name="text"
                        value={formData.text || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Текст, который увидят при сканировании..."
                        className="w-full bg-white border border-gray-200 rounded-3xl px-5 py-3 focus:ring-2 focus:ring-red-800 transition-all resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Buttons */}
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => toggleSection('buttons')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Быстрые кнопки
                </div>
                {expandedSections.buttons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {expandedSections.buttons && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      {BUTTON_OPTIONS.map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => toggleButton(btn.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${
                            formData.quickButtons.includes(btn.id)
                              ? 'bg-gradient-to-br from-red-800 to-rose-950 border-transparent text-white shadow-lg'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          <btn.icon className="w-6 h-6 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-800 to-rose-950 text-white py-4 rounded-[2rem] font-bold text-xl hover:from-red-900 hover:to-black transition-all active:scale-95 shadow-2xl shadow-red-900/20 flex items-center justify-center gap-3"
            >
              <QrCode className="w-6 h-6" />
              Сгенерировать QR-код
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setFormData({
                carModel: '',
                plateNumber: '',
                ownerName: '',
                phone1: '',
                phone2: '',
                email: '',
                telegram: '',
                whatsapp: '',
                showText: true,
                text: 'Мешаю? Напиши мне! 📲\nЯ прибегу через минуту. Пожалуйста, не вызывай эвакуатор, я уже бегу 🏃',
                showContact: true,
                quickButtons: ['evacuation', 'damage', 'message'],
              })}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium py-2 px-4 rounded-xl hover:bg-gray-50"
            >
              <AlertTriangle className="w-4 h-4 rotate-180" />
              Очистить форму
            </button>
          </div>
        </div>

        <footer className="mt-12 mb-8 text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Разработка и поддержка</p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <a 
                  href="https://t.me/krisdev13" 
                  target="_blank" 
                  className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-900 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  @krisdev13
                </a>
                <a 
                  href="mailto:info@premiumwebsite.ru" 
                  className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-900 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@premiumwebsite.ru
                </a>
              </div>
              <a 
                href="https://t.me/avtovikupkaluga" 
                target="_blank" 
                className="flex items-center gap-2 px-6 py-2.5 bg-red-800/10 text-red-800 rounded-full text-sm font-bold hover:bg-red-800/20 transition-all border border-red-800/20"
              >
                <Send className="w-4 h-4" />
                автовыкуп в Калуге + 200км
              </a>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 CarQR. Все права защищены.</p>
        </footer>
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
              <p className="text-gray-500 text-sm mb-6">Распечатайте его и положите под лобовое стекло</p>
              
              <div className="bg-gray-50 p-6 rounded-3xl inline-block mb-6 border border-gray-100 w-full">
                <p className="text-red-900 font-bold text-sm mb-4 leading-tight">
                  Мешаю? Не грусти — напиши! 📲<br/>
                  Отсканируй код, и я прибегу через минуту. Пожалуйста, не вызывай эвакуатор, я уже бегу 🏃
                </p>
                <QRCodeSVG
                  id="qr-code-svg"
                  value={generatedUrl}
                  size={240}
                  level="M"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-800 to-rose-950 text-white py-4 px-4 rounded-2xl font-bold hover:from-red-900 hover:to-black transition-all active:scale-95 shadow-lg"
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
