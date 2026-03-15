'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/FirebaseProvider';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import CarCardForm, { CardFormData } from '@/components/CarCardForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCard() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, loading } = useAuth();
  const [initialData, setInitialData] = useState<CardFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchCard() {
      if (!id) return;
      try {
        const docRef = doc(db, 'cards', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CardFormData;
          // Security check: only owner can edit
          if (user && data.ownerId !== user.uid) {
            router.push('/');
            return;
          }
          setInitialData(data);
        } else {
          router.push('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `cards/${id}`);
      } finally {
        setFetching(false);
      }
    }

    if (!loading && user) {
      fetchCard();
    } else if (!loading && !user) {
      router.push('/');
    }
  }, [id, user, loading, router]);

  const onSubmit = async (data: CardFormData) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'cards', id);
      await updateDoc(docRef, {
        ...data,
      });
      router.push('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cards/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bold text-xl tracking-tight">Редактировать</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <CarCardForm initialData={initialData} onSubmit={onSubmit} isLoading={isSubmitting} />
      </main>
    </div>
  );
}
