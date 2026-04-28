export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">Painel Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Area protegida para utilizadores com role <code>admin</code>.
      </p>
    </main>
  );
}
