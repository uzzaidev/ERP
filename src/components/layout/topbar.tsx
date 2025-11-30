"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import Image from "next/image";

interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function Topbar() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Buscar usuário autenticado
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(err => console.error('Error fetching current user:', err));
  }, []);

  const displayName = currentUser?.full_name?.split(' ')[0] || 'Usuário';
  const initials = currentUser?.full_name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/30 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        {/* Search */}
        <div className="flex flex-1">
          <div className="relative max-w-xl w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar tarefas, projetos ou clientes"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
            {currentUser?.avatar_url ? (
              <Image
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-medium">
                {initials}
              </div>
            )}
            <div className="hidden text-sm text-white sm:block">
              <p className="font-medium">{displayName}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
