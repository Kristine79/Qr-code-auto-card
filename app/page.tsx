'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Car, Trash2, Edit, QrCode, LogIn, LogOut, Send, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

interface CarCard {
  id: string;
  carModel: string;
  plateNumber: string;
  ownerName: string;
}

interface Notification {
  id: string;
  cardId: string;
  type: string;
  timestamp: any;
  carModel?: string;
}

export default function Dashboard() {
  const { user, loading, login, logout } = useAuth();
  const [cards, setCards] = useState<CarCard[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'cards' | 'notifications'>('cards');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'cards'), where('ownerId', '==', user.uid));
    
    const unsubscribeCards = onSnapshot(q, (snapshot) => {
      const cardList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarCard[];
      setCards(cardList);
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cards');
      setFetching(false);
    });

    return () => unsubscribeCards();
  }, [user]);

  useEffect(() => {
    if (!user || cards.length === 0) {
      return;
    }

    const nq = query(
      collection(db, 'notifications'), 
      where('timestamp', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    );
    
    const unsubscribeNotifications = onSnapshot(nq, (snapshot) => {
      const notifList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      const userCardIds = cards.map(c => c.id);
      const filtered = notifList
        .filter(n => userCardIds.includes(n.cardId))
        .map(n => ({
          ...n,
          carModel: cards.find(c => c.id === n.cardId)?.carModel
        }))
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      setNotifications(filtered);
    });

    return () => unsubscribeNotifications();
  }, [user, cards, notifications.length]);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту визитку?')) return;
    try {
      await deleteDoc(doc(db, 'cards', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cards/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">CarQR</h1>
          <p className="text-gray-600 mb-8">
            Создайте умную QR-визитку для вашего автомобиля. Получайте уведомления в Telegram, если с вашей машиной что-то не так.
          </p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            <LogIn className="w-5 h-5" />
            Войти через Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CarQR</span>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Выйти"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8 mt-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Визитки
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'notifications' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Оповещения
              {notifications.length > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          {activeTab === 'cards' && (
            <Link
              href="/create"
              className="flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Создать
            </Link>
          )}
        </div>

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : activeTab === 'cards' ? (
          cards.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">У вас пока нет визиток</p>
              <p className="text-gray-400 text-sm mt-1">Создайте свою первую визитку прямо сейчас</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                          <Car className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{card.carModel}</h3>
                          <p className="text-gray-500 font-mono tracking-wider uppercase">{card.plateNumber}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/card/${card.id}`}
                          className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                          title="Просмотр"
                        >
                          <QrCode className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/edit/${card.id}`}
                          className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          <div className="grid gap-4">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Оповещений пока нет</p>
                <p className="text-gray-400 text-sm mt-1">Здесь будут появляться уведомления о вашей машине</p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      notif.type === 'evacuation' ? 'bg-orange-100 text-orange-600' :
                      notif.type === 'damage' ? 'bg-red-100 text-red-600' :
                      notif.type === 'vandalism' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">
                          {notif.type === 'evacuation' ? 'Эвакуация!' :
                           notif.type === 'damage' ? 'Повреждение!' :
                           notif.type === 'vandalism' ? 'Вандализм!' :
                           'Новое сообщение'}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {notif.timestamp?.toDate().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Автомобиль: <span className="font-semibold text-gray-700">{notif.carModel}</span></p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
