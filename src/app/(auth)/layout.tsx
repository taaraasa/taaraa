export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="starfield relative flex min-h-screen items-center justify-center bg-space-900 bg-taaraa-radial px-4 py-10">
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
