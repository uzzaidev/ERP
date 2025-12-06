"use client";

import { Suspense } from 'react';
import { Loader2 } from "lucide-react";
import RegistroForm from './registro-form';

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
