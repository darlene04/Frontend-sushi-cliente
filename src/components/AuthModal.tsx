import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import {
  loginCustomer,
  registerCustomer,
  type AuthSession,
} from "../lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

type Mode = "login" | "register";

export default function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        await registerCustomer({
          name: name.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
        });
      }

      const auth = await loginCustomer({
        email: email.trim().toLowerCase(),
        password,
      });

      const session: AuthSession = {
        token: auth.token,
        userId: auth.userId,
        role: auth.role,
        name: name.trim() || undefined,
        email: email.trim().toLowerCase(),
      };

      onAuthenticated(session);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la autenticación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <button className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#121212] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <button
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="mb-6">
          <div className="inline-flex rounded-full bg-white/8 p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                mode === "login" ? "bg-white text-black" : "text-white/75 hover:text-white"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                mode === "register" ? "bg-white text-black" : "text-white/75 hover:text-white"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Crear cuenta
            </button>
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Entra a tu cuenta" : "Crea tu cuenta"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {mode === "login"
              ? "Usa tu email y password del backend de clientes."
              : "Te registramos como cliente y luego iniciamos sesión automáticamente."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === "register" ? (
            <label className="block">
              <span className="mb-2 block text-sm text-white/80">Nombre</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
                placeholder="Ana Torres"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm text-white/80">Email</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
              placeholder="ana@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/80">Password</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[rgb(251,35,1)] px-4 py-3 font-medium text-white transition-colors hover:bg-[rgb(225,31,1)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : null}
            <span>{mode === "login" ? "Ingresar" : "Registrarme"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
