import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { CheckForm } from "./check-form";

export const dynamic = "force-dynamic";

export default async function CheckPage({ params }: { params: Promise<{ trapCode: string }> }) {
  const { trapCode } = await params;
  if (!hasSupabaseEnv()) return <main className="mx-auto max-w-xl px-6 py-12"><h1 className="text-2xl font-bold">Supabase no configurado</h1></main>;
  const supabase = await createSupabaseServerClient();
  const { data: trap } = await supabase.from("traps").select("id,public_code,name,expected_location,status,clients(name),sites(name),zones(name)").eq("public_code", trapCode).single();
  if (!trap) notFound();
  return <main className="min-h-screen bg-slate-100 px-6 py-8"><section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm"><Link className="text-sm font-semibold text-emerald-700" href="/">TrapGo</Link><p className="mt-6 text-sm font-medium uppercase tracking-wide text-slate-500">{trap.clients?.name}</p><h1 className="mt-1 text-3xl font-bold">Revisión de {trap.name}</h1><p className="mt-2 text-slate-600">Código: <strong>{trap.public_code}</strong> · {trap.sites?.name ?? "Sin sitio"} · {trap.zones?.name ?? "Sin zona"}</p><p className="mt-1 text-sm text-slate-500">{trap.expected_location ?? "Sin ubicación esperada"}</p><CheckForm trapCode={trap.public_code} trapId={trap.id} /></section></main>;
}
