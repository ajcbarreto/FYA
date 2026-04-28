export default function UserDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">Dashboard do Adotante</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Area protegida para utilizadores com role <code>user</code>.
      </p>
    </main>
  );
}
