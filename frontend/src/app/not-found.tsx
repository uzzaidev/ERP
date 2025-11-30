import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-semibold">Pagina nao encontrada</h2>
      <p className="mt-2 text-muted-foreground">
        A pagina que voce esta procurando nao existe.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
