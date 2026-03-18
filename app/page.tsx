'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, Info, ChevronDown, ChevronUp, Check, Loader2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encodeCardData, type CarCardData } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const BUTTON_OPTIONS = [
  { id: 'evacuation', label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500', hint: 'Сообщить о риске эвакуации' },
  { id: 'damage', label: 'Повреждение', icon: ShieldAlert, color: 'bg-red-500', hint: 'Сообщить о повреждении авто' },
  { id: 'vandalism', label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500', hint: 'Сообщить о действиях вандалов' },
  { id: 'message', label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500', hint: 'Отправить произвольное сообщение' },
];

const STORAGE_KEY = 'carqr_draft';

export default function Home() {
  const [formData, setFormData] = useState<CarCardData>({
    carModel: '',
    plateNumber: '',
    ownerName: '',
    phone1: '',
    telegram: '',
    whatsapp: '',
    showText: true,
    text: 'Мешаю? Напиши мне! 📲\nЯ прибегу через минуту. Пожалуйста, не вызывай эвакуатор, я уже бегу 🏃',
    showContact: true,
    quickButtons: ['evacuation', 'damage', 'message'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instruction: false,
    car: true,
    owner: true,
    socials: false,
    message: false,
    buttons: false
  });

  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const carModelRef = React.useRef<HTMLInputElement>(null);
  const plateNumberRef = React.useRef<HTMLInputElement>(null);
  const ownerNameRef = React.useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load draft
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const validateField = useCallback((name: string, value: string) => {
    let error = '';
    if (name === 'carModel' && !value.trim()) error = 'Введите марку и модель';
    if (name === 'plateNumber' && !value.trim()) error = 'Введите госномер';
    if (name === 'ownerName' && !value.trim()) error = 'Введите имя';
    if (name === 'phone1') {
      const digits = value.replace(/\D/g, '');
      if (!digits) error = 'Введите номер телефона';
      else if (digits.length < 11) error = 'Номер слишком короткий';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    let formatted = '+7 ';
    if (digits.length > 1) {
      const main = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
      if (main.length > 0) formatted += `(${main.slice(0, 3)}`;
      if (main.length > 3) formatted += `) ${main.slice(3, 6)}`;
      if (main.length > 6) formatted += `-${main.slice(6, 8)}`;
      if (main.length > 8) formatted += `-${main.slice(8, 10)}`;
    }
    return formatted.trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (name === 'phone1' || name === 'whatsapp') {
      newValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : newValue
    }));

    if (errors[name]) {
      validateField(name, newValue);
    }
  };

  const triggerVibration = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const toggleButton = (id: string) => {
    triggerVibration(10);
    setFormData(prev => ({
      ...prev,
      quickButtons: prev.quickButtons.includes(id)
        ? prev.quickButtons.filter(b => b !== id)
        : [...prev.quickButtons, id]
    }));
  };

  const generateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const isCarValid = validateField('carModel', formData.carModel);
    const isPlateValid = validateField('plateNumber', formData.plateNumber);
    const isOwnerValid = validateField('ownerName', formData.ownerName);
    const isPhoneValid = validateField('phone1', formData.phone1);

    if (!isCarValid || !isPlateValid || !isOwnerValid || !isPhoneValid) {
      triggerVibration([100, 50, 100]);
      // Expand sections with errors
      setExpandedSections(prev => ({
        ...prev,
        car: !isCarValid || !isPlateValid || prev.car,
        owner: !isOwnerValid || !isPhoneValid || prev.owner,
      }));

      // Focus the first invalid field
      setTimeout(() => {
        if (!isCarValid) carModelRef.current?.focus();
        else if (!isPlateValid) plateNumberRef.current?.focus();
        else if (!isOwnerValid) ownerNameRef.current?.focus();
        else if (!isPhoneValid) phoneInputRef.current?.focus();
      }, 100);

      return;
    }

    setIsGenerating(true);
    triggerVibration(30);

    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const encoded = encodeCardData(formData);
    const url = `${window.location.origin}/card/${encoded}`;
    setGeneratedUrl(url);
    setIsGenerating(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setShowQR(true);
      setIsSuccess(false);
    }, 500);
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
    <div className="min-h-screen bg-gray-50 pb-8" suppressHydrationWarning>
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
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создать QR-визитку</h1>
              <p className="text-gray-800 text-sm font-medium">Данные шифруются прямо в коде</p>
            </div>
          </div>

          {/* Instruction Section */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => toggleSection('instruction')}
              className="w-full flex items-center justify-start gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-xl p-2 -ml-2"
            >
              <h2 className="text-2xl font-black text-gray-900 text-left tracking-tight">Как это работает?</h2>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                {expandedSections.instruction ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
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
                    <p className="text-gray-700 leading-relaxed">
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
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-bold text-gray-900">{item.title}</span> — {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        💡 <span className="font-bold text-gray-900">Приватность:</span> вы сами выбираете, какие контактные данные показывать. Можно оставить только кнопки быстрой связи без личной информации.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={generateQR} className="space-y-6">
            {/* Car Info */}
            <div className="space-y-4 border-b border-gray-100 pb-6 pt-2">
              <button 
                type="button"
                onClick={() => toggleSection('car')}
                className="w-full flex items-center justify-start gap-3 text-left text-lg font-black text-gray-900 uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Car className="w-6 h-6 text-red-800" />
                  Автомобиль
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  {expandedSections.car ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
                </div>
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
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">Марка и модель *</label>
                        <motion.div
                          animate={errors.carModel ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <input
                            required
                            name="carModel"
                            ref={carModelRef}
                            value={formData.carModel || ''}
                            onChange={handleInputChange}
                            placeholder="Например: Tesla Model 3"
                            autoComplete="off"
                            className={`w-full bg-white border-2 ${errors.carModel ? 'border-red-500 ring-4 ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-200 hover:border-gray-300'} rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all outline-none shadow-sm placeholder:text-gray-400 text-gray-900`}
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">Госномер *</label>
                        <motion.div
                          animate={errors.plateNumber ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <input
                            required
                            name="plateNumber"
                            ref={plateNumberRef}
                            value={formData.plateNumber || ''}
                            onChange={handleInputChange}
                            placeholder="А123ВС 777"
                            autoComplete="off"
                            className={`w-full bg-white border-2 ${errors.plateNumber ? 'border-red-500 ring-4 ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-200 hover:border-gray-300'} rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all font-mono uppercase tracking-widest outline-none shadow-sm placeholder:text-gray-400 text-gray-900`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Owner Info */}
            <div className="space-y-4 border-b border-gray-100 pb-6 pt-2">
              <button 
                type="button"
                onClick={() => toggleSection('owner')}
                className="w-full flex items-center justify-start gap-3 text-left text-lg font-black text-gray-900 uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <User className="w-6 h-6 text-red-800" />
                  Владелец
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  {expandedSections.owner ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
                </div>
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
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">Ваше имя *</label>
                        <motion.div
                          animate={errors.ownerName ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <input
                            required
                            name="ownerName"
                            ref={ownerNameRef}
                            value={formData.ownerName || ''}
                            onChange={handleInputChange}
                            placeholder="Иван Иванов"
                            autoComplete="off"
                            className={`w-full bg-white border-2 ${errors.ownerName ? 'border-red-500 ring-4 ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-200 hover:border-gray-300'} rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all outline-none shadow-sm placeholder:text-gray-400 text-gray-900`}
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">Телефон *</label>
                        <motion.div
                          animate={errors.phone1 ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <input
                            required
                            type="tel"
                            name="phone1"
                            ref={phoneInputRef}
                            value={formData.phone1 || ''}
                            onChange={handleInputChange}
                            placeholder="+7 (900) 000-00-00"
                            autoComplete="off"
                            className={`w-full bg-white border-2 ${errors.phone1 ? 'border-red-500 ring-4 ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-200 hover:border-gray-300'} rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all outline-none shadow-sm placeholder:text-gray-400 text-gray-900`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Socials */}
            <div className="space-y-4 border-b border-gray-100 pb-6 pt-2">
              <button 
                type="button"
                onClick={() => toggleSection('socials')}
                className="w-full flex items-center justify-start gap-3 text-left text-lg font-black text-gray-900 uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Send className="w-6 h-6 text-red-800" />
                  Мессенджеры
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  {expandedSections.socials ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.socials && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">Telegram</label>
                        <input
                          name="telegram"
                          value={formData.telegram || ''}
                          onChange={handleInputChange}
                          placeholder="Telegram (без @)"
                          autoComplete="off"
                          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all outline-none shadow-sm placeholder:text-gray-400 text-gray-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-900 ml-1 block uppercase tracking-wide">WhatsApp</label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="WhatsApp (номер)"
                          autoComplete="off"
                          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all outline-none shadow-sm placeholder:text-gray-400 text-gray-900"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Text */}
            <div className="space-y-4 border-b border-gray-100 pb-6 pt-2">
              <button 
                type="button"
                onClick={() => toggleSection('message')}
                className="w-full flex items-center justify-start gap-3 text-left text-lg font-black text-gray-900 uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-red-800" />
                  Сообщение
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  {expandedSections.message ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
                </div>
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
                      <label className="text-sm font-bold text-gray-900 ml-1 block mb-3 uppercase tracking-wide">Текст сообщения</label>
                      <textarea
                        name="text"
                        value={formData.text || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Текст, который увидят при сканировании..."
                        className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-3xl px-5 py-4 text-base focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 focus:shadow-[0_0_20px_rgba(17,24,39,0.1)] transition-all resize-none outline-none shadow-sm placeholder:text-gray-400 text-gray-900"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Buttons */}
            <div className="space-y-4 pt-2">
              <button 
                type="button"
                onClick={() => toggleSection('buttons')}
                className="w-full flex items-center justify-start gap-3 text-left text-lg font-black text-gray-900 uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-2 -ml-2"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-800" />
                  Быстрые кнопки
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  {expandedSections.buttons ? <ChevronUp className="w-4 h-4 text-gray-900" /> : <ChevronDown className="w-4 h-4 text-gray-900" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.buttons && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      {BUTTON_OPTIONS.map((btn) => {
                        const isActive = formData.quickButtons.includes(btn.id);
                        return (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => toggleButton(btn.id)}
                            className={`flex flex-col items-center justify-center min-h-[96px] p-4 rounded-3xl border-2 transition-all shadow-sm hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 ${
                              isActive
                                ? `${btn.color} border-transparent text-white shadow-lg ring-2 ring-offset-2 ring-gray-200`
                                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <btn.icon className={`w-7 h-7 mb-2 ${isActive ? 'text-white' : 'text-gray-900'}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-tight text-center ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {btn.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full ${isSuccess ? 'bg-green-600' : 'bg-gradient-to-r from-red-800 to-rose-950'} text-white py-4 px-10 rounded-3xl font-bold text-base uppercase tracking-wide hover:from-red-900 hover:to-black transition-all active:scale-95 shadow-xl shadow-red-900/30 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-800 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Генерация...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-7 h-7" />
                  Готово!
                </>
              ) : (
                <>
                  <QrCode className="w-7 h-7" />
                  Сгенерировать QR-код
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                triggerVibration(20);
                setFormData({
                  carModel: '',
                  plateNumber: '',
                  ownerName: '',
                  phone1: '',
                  telegram: '',
                  whatsapp: '',
                  showText: true,
                  text: 'Мешаю? Напиши мне! 📲\nЯ прибегу через минуту. Пожалуйста, не вызывай эвакуатор, я уже бегу 🏃',
                  showContact: true,
                  quickButtons: ['evacuation', 'damage', 'message'],
                });
                setErrors({});
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-bold py-3 px-6 rounded-2xl hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800"
            >
              <AlertTriangle className="w-5 h-5 rotate-180" />
              Очистить форму
            </button>
          </div>
        </div>

        <footer className="mt-16 mb-4 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Разработка и поддержка</p>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6">
                <a 
                  href="https://t.me/krisdev13" 
                  target="_blank" 
                  className="flex items-center gap-2 text-sm font-bold text-red-800 hover:text-red-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-1"
                >
                  <Send className="w-5 h-5" />
                  @krisdev13
                </a>
                <a 
                  href="mailto:info@premiumwebsite.ru" 
                  className="flex items-center gap-2 text-sm font-bold text-red-800 hover:text-red-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 rounded-lg p-1"
                >
                  <Mail className="w-5 h-5" />
                  info@premiumwebsite.ru
                </a>
              </div>
              <a 
                href="https://t.me/avtovikupkaluga" 
                target="_blank" 
                className="flex items-center gap-2 px-8 py-3 bg-red-800/10 text-red-800 rounded-full text-sm font-bold hover:bg-red-800/20 transition-all border border-red-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800"
              >
                <Send className="w-5 h-5" />
                автовыкуп в Калуге + 200км
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-900 font-bold">© 2026 CarQR. Все права защищены.</p>
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
              <p className="text-gray-700 text-sm mb-6">Распечатайте его и положите под лобовое стекло</p>
              
              <div className="bg-gray-50 p-6 rounded-3xl inline-block mb-6 border border-gray-100 w-full">
                <p className="text-red-950 font-black text-sm mb-4 leading-tight">
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
                  className="bg-gray-200 text-gray-800 py-4 px-4 rounded-2xl font-bold hover:bg-gray-300 transition-all active:scale-95"
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
