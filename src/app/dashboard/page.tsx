import Link from "next/link";
import { createClientAction, createTrapAction } from "./actions";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CheckRow = {
  id: string;
  status: string;
  observations: string | null;
  photo_path: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  traps: { code: string; label: string; clients: { name: string } | null } | null;
};

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SetupNotice />;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: clients }, { data: traps }, { data: checks }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("traps").select("*, clients(name)").order("created_at", { ascending: false }),
    supabase.from("trap_checks").select("*, traps(code, label, clients(name))").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link className="text-sm font-semibold text-emerald-700" href="/">← TrapGo</Link>
          <h1 className="mt-3 text-3xl font-bold">Dashboard administrativo</h1>
          <p className="mt-2 text-slate-600">Alta de clientes, trampas y revisión del historial operativo.</p>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <FormCard title="Crear cliente" action={createClientAction}>
          <Input name="name" label="Empresa / Cliente" required />
          <Input name="contact_name" label="Contacto" />
          <Input name="email" label="Email" type="email" />
          <Input name="phone" label="Teléfono" />
        </FormCard>

        <FormCard title="Crear trampa" action={createTrapAction}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Cliente
            <select className="rounded-xl border border-slate-300 px-3 py-2" name="client_id" required>
              <option value="">Seleccionar cliente</option>
              {(clients ?? []).map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <Input name="label" label="Etiqueta" placeholder="Trampa cocina 01" required />
          <Input name="code" label="Código público único" placeholder="TRAP-COCINA-01" required />
          <Input name="location_description" label="Ubicación" placeholder="Debajo de tarja principal" />
        </FormCard>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Trampas</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(traps ?? []).map((trap) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={trap.id}>
              <p className="text-sm font-medium text-slate-500">{trap.clients?.name}</p>
              <h3 className="mt-1 text-lg font-semibold">{trap.label}</h3>
              <p className="mt-2 text-sm text-slate-600">{trap.location_description ?? "Sin ubicación detallada"}</p>
              <Link className="mt-4 inline-flex rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white" href={`/check/${trap.code}`}>/check/{trap.code}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Últimas revisiones</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {(checks as CheckRow[] | null ?? []).map((check) => (
            <div className="grid gap-2 border-b border-slate-100 p-4 last:border-0 md:grid-cols-5" key={check.id}>
              <strong>{check.traps?.label}</strong>
              <span>{check.traps?.clients?.name}</span>
              <span className="font-medium">{check.status}</span>
              <span>{new Date(check.created_at).toLocaleString("es")}</span>
              <span className="text-sm text-slate-600">{check.latitude && check.longitude ? `${check.latitude}, ${check.longitude}` : "Sin GPS"}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SetupNotice() {
  return <main className="mx-auto max-w-2xl px-6 py-16"><h1 className="text-3xl font-bold">Configura Supabase</h1><p className="mt-3 text-slate-600">Copia <code>.env.example</code> a <code>.env.local</code> y define las variables públicas de Supabase.</p></main>;
}

function FormCard({ title, action, children }: { title: string; action: (formData: FormData) => Promise<void>; children: React.ReactNode }) {
  return <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{title}</h2><div className="mt-5 grid gap-4">{children}<button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700" type="submit">Guardar</button></div></form>;
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700">{label}<input className="rounded-xl border border-slate-300 px-3 py-2" {...props} /></label>;
}
