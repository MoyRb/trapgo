import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
            MVP para control verificable de trampas
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            TrapGo confirma cada revisión con QR/NFC, foto, hora y ubicación.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Crea clientes y trampas desde el dashboard, comparte la URL pública de cada trampa y recibe evidencia operativa directamente en Supabase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300" href="/dashboard">
              Abrir dashboard
            </Link>
            <a className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10" href="#flujo">
              Ver flujo MVP
            </a>
          </div>
        </div>
        <div id="flujo" className="grid gap-4 md:grid-cols-3">
          {[
            ["1", "Administrador", "Registra clientes y trampas con un código público único."],
            ["2", "Técnico", "Escanea /check/[trapCode] y carga estado, observaciones, foto y GPS."],
            ["3", "Supervisor", "Consulta historial con evidencia en el dashboard administrativo."],
          ].map(([step, title, text]) => (
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6" key={step}>
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-400 font-bold text-slate-950">{step}</span>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
