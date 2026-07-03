import Link from "next/link";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CheckRow = { id: string; status: string; latitude: number | null; longitude: number | null; created_at: string; traps: { public_code: string; code: string | null; label: string; clients: { name: string } | null } | null };

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) return <SetupNotice />;
  const supabase = await createSupabaseServerClient();
  const [{ data: clients }, { data: traps }, { data: checks }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("traps").select("*, clients(name)").order("created_at", { ascending: false }),
    supabase.from("trap_checks").select("*, traps(public_code, code, label, clients(name))").order("created_at", { ascending: false }).limit(20),
  ]);

  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-8"><header className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between"><div><Link className="text-sm font-semibold text-emerald-700" href="/">← TrapGo</Link><h1 className="mt-3 text-3xl font-bold">Dashboard administrativo</h1><p className="mt-2 text-slate-600">Accesos rápidos a clientes, trampas y revisiones.</p></div><div className="flex gap-2"><Link className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white" href="/clientes">Clientes</Link><Link className="rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white" href="/trampas">Trampas</Link></div></header><section className="mt-8 grid gap-6 md:grid-cols-2"><Card title="Clientes" count={clients?.length ?? 0} href="/clientes/nuevo" action="Nuevo cliente" /><Card title="Trampas" count={traps?.length ?? 0} href="/trampas/nueva" action="Nueva trampa" /></section><section className="mt-10"><h2 className="text-2xl font-bold">Trampas recientes</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{!traps?.length ? <p className="text-slate-500">No hay trampas registradas.</p> : traps.map((trap) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={trap.id}><p className="text-sm font-medium text-slate-500">{trap.clients?.name}</p><h3 className="mt-1 text-lg font-semibold">{trap.label}</h3><p className="mt-2 text-sm text-slate-600">{trap.site} · {trap.zone}</p><Link className="mt-4 inline-flex rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white" href={`/check/${trap.public_code}`}>/check/{trap.public_code}</Link></article>)}</div></section><section className="mt-10"><h2 className="text-2xl font-bold">Últimas revisiones</h2><div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">{!(checks as CheckRow[] | null)?.length ? <p className="p-5 text-slate-500">Sin revisiones todavía.</p> : (checks as CheckRow[]).map((check) => <div className="grid gap-2 border-b border-slate-100 p-4 last:border-0 md:grid-cols-5" key={check.id}><strong>{check.traps?.label}</strong><span>{check.traps?.clients?.name}</span><span className="font-medium">{check.status}</span><span>{new Date(check.created_at).toLocaleString("es")}</span><span className="text-sm text-slate-600">{check.latitude && check.longitude ? `${check.latitude}, ${check.longitude}` : "Sin GPS"}</span></div>)}</div></section></main>;
}

function Card({ title, count, href, action }: { title: string; count: number; href: string; action: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-slate-500">Total</p><h2 className="mt-1 text-3xl font-bold">{count} {title.toLowerCase()}</h2><Link className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white" href={href}>{action}</Link></article>; }
function SetupNotice() { return <main className="mx-auto max-w-2xl px-6 py-16"><h1 className="text-3xl font-bold">Configura Supabase</h1><p className="mt-3 text-slate-600">Copia <code>.env.example</code> a <code>.env.local</code> y define las variables públicas de Supabase.</p></main>; }
