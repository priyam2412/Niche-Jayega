export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 40, maxWidth: 560 }}>
      <h1>Niche Jayega API</h1>
      <p>The product UI lives in <code>/frontend</code> (Vite, port 5173).</p>
      <p>
        Health: <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}
