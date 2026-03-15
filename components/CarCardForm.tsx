'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Car, 
  User, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Smartphone
} from 'lucide-react';

const cardSchema = z.object({
  carModel: z.string().min(1, 'Введите марку и модель'),
  plateNumber: z.string().min(1, 'Введите госномер'),
  ownerName: z.string().min(1, 'Введите имя владельца'),
  phone1: z.string().min(1, 'Введите контактный телефон'),
  phone2: z.string().optional(),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  showText: z.boolean().default(false),
  text: z.string().optional(),
  showContact: z.boolean().default(true),
  quickButtons: z.array(z.string()).default([]),
  tgNotificationId: z.string().optional(),
  emailNotification: z.string().email('Некорректный email').optional().or(z.literal('')),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface Props {
  initialData?: Partial<CardFormData>;
  onSubmit: (data: CardFormData) => void;
  isLoading?: boolean;
}

const QUICK_BUTTONS = [
  { id: 'evacuation', label: 'Вероятность эвакуации' },
  { id: 'damage', label: 'Повреждение от других ТС' },
  { id: 'vandalism', label: 'Вандализм' },
  { id: 'message', label: 'Сообщение владельцу' },
];

export default function CarCardForm({ initialData, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      showText: false,
      showContact: true,
      quickButtons: [],
      ...initialData,
    },
  });

  const selectedButtons = watch('quickButtons') || [];

  const toggleButton = (id: string) => {
    if (selectedButtons.includes(id)) {
      setValue('quickButtons', selectedButtons.filter(b => b !== id));
    } else {
      setValue('quickButtons', [...selectedButtons, id]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      {/* Car Info */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Car className="w-5 h-5 text-gray-400" />
          Информация о ТС
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Марка и модель ТС</label>
            <input
              {...register('carModel')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Например: Toyota Camry"
            />
            {errors.carModel && <p className="text-red-500 text-xs mt-1">{errors.carModel.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Госномер ТС</label>
            <input
              {...register('plateNumber')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all uppercase font-mono"
              placeholder="А 001 АА 77"
            />
            {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</p>}
          </div>
        </div>
      </section>

      {/* Custom Text */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            Текст объявления
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('showText')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
          </label>
        </div>
        {watch('showText') && (
          <textarea
            {...register('text')}
            rows={4}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all resize-none"
            placeholder="Введите текст, который увидят при сканировании..."
          />
        )}
      </section>

      {/* Owner Contact */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Контактные данные владельца
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('showContact')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
          </label>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя владельца</label>
            <input
              {...register('ownerName')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактный телефон</label>
            <input
              {...register('phone1')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактный телефон #2</label>
            <input
              {...register('phone2')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактный email</label>
            <input
              {...register('email')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram аккаунт</label>
            <input
              {...register('telegram')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp номер</label>
            <input
              {...register('whatsapp')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Quick Buttons */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-gray-400" />
          Кнопки быстрой связи
        </h3>
        <div className="grid gap-3">
          {QUICK_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => toggleButton(btn.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                selectedButtons.includes(btn.id)
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
              }`}
            >
              <span className="font-medium">{btn.label}</span>
              {selectedButtons.includes(btn.id) ? (
                <CheckCircle2 className="w-5 h-5 text-gray-900" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-100" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Send className="w-5 h-5 text-gray-400" />
          Отправка оповещений
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Telegram ID для оповещений
            </label>
            <input
              {...register('tgNotificationId')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="ID из бота @userinfobot"
            />
            <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-wider">
              Управление списком аккаунтов оповещений через мессенджер Telegram доступно в разделе Профиль - Оповещения
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email для оповещений
            </label>
            <input
              {...register('emailNotification')}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 px-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:active:scale-100"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить визитку'}
        </button>
      </div>
    </form>
  );
}
