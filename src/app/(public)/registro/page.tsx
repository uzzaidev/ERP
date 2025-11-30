import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function RegistroPage() {
  return (
    <div className="w-full max-w-md space-y-8 p-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">ERP UzzAI</h1>
        <p className="mt-2 text-muted-foreground">
          Think Smart, Think Uzz.Ai
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">Criar Conta</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para criar sua conta
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Criar Conta
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Ja tem uma conta? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entre aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
