import { SessionLauncher } from "@/components/session-launcher";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">TeachMeAny</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Record once through the UI, replay through UI or API
        </p>
      </div>
      <SessionLauncher />
    </main>
  );
}
