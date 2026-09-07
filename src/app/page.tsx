export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl bg-gray-50 p-10 font-sans text-gray-900 antialiased">
      <h1 className="text-2xl font-semibold text-brand-700">Niche Jayega API</h1>
      <p className="mt-3 text-gray-700">
        The product UI lives in <code className="rounded bg-gray-200 px-1">/frontend</code> (Vite,
        port 5173).
      </p>
      <p className="mt-3">
        Health:{" "}
        <a className="text-brand-600 underline" href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
