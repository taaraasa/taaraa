import { Logo } from "@/components/brand/Logo";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-space-800/80 p-8 shadow-glow backdrop-blur-xl">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-sm text-white/50">Welcome back to your universe of sound.</p>
      </div>
      <LoginForm />
    </div>
  );
}
