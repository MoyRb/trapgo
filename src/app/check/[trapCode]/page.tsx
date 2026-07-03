import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { createTrapCheckAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CheckPage({ params }: { params: Promise<{ trapCode: string }> }) {
  const { trapCode } = await params;
  if (!hasSupabaseEnv()) return <main className="mx-auto max-w-xl px-6 py-12"><h1 className="text-2xl font-bold">Supabase no configurado</h1></main>;

  const supabase = await createSupabaseServerClient();
  const { data: trap } = await supabase.from("traps").select("*, clients(name)").eq("code", trapCode).single();
  if (!trap) notFound();

  const action = createTrapCheckAction.bind(null, trap.code, trap.id);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <Link className="text-sm font-semibold text-emerald-700" href="/">TrapGo</Link>
        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-slate-500">{trap.clients?.name}</p>
        <h1 className="mt-1 text-3xl font-bold">Revisión de {trap.label}</h1>
        <p className="mt-2 text-slate-600">Código: <strong>{trap.code}</strong> · {trap.location_description ?? "Sin ubicación detallada"}</p>

        <form action={action} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Estado de la trampa
            <select className="rounded-xl border border-slate-300 px-3 py-3" name="status" required>
              <option value="ok">Sin actividad</option>
              <option value="activity">Con actividad / captura</option>
              <option value="damaged">Dañada</option>
              <option value="missing">No encontrada</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Observaciones
            <textarea className="min-h-28 rounded-xl border border-slate-300 px-3 py-3" name="observations" placeholder="Describe evidencia, consumo, daños o acciones realizadas." />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Foto de evidencia
            <input accept="image/*" capture="environment" className="rounded-xl border border-slate-300 px-3 py-3" name="photo" type="file" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Latitud<input className="rounded-xl border border-slate-300 px-3 py-3" name="latitude" placeholder="19.4326" /></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Longitud<input className="rounded-xl border border-slate-300 px-3 py-3" name="longitude" placeholder="-99.1332" /></label>
          </div>
          <p className="text-sm text-slate-500">Tip: el navegador puede autocompletar GPS si integras permisos de ubicación en la siguiente iteración; este MVP persiste los campos enviados.</p>
          <button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700" type="submit">Registrar revisión</button>
        </form>
      </section>
    </main>
  );
}
