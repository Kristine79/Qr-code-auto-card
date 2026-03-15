'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/FirebaseProvider';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CarCardForm, { CardFormData } from '@/components/CarCardForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CardFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'cards'), {
        ...data,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      router.push('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cards');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bold text-xl tracking-tight">Новая визитка</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <CarCardForm onSubmit={onSubmit} isLoading={isSubmitting} />
      </main>
    </div>
  );
}
