import Link from "next/link";
import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type TrapStatus = Database["public"]["Tables"]["traps"]["Row"]["status"];

type DashboardCheck = {
  id: string;
  status: string;
  observations: string | null;
  photo_path: string | null;
  photo_url: string | null;
  created_at: string;
  traps: {
    label: string;
    site: string;
    zone: string;
    public_code: string;
    clients: { name: string } | null;
  } | null;
};

type ActiveTrapRow = {
  id: string;
  label: string;
  site: string;
  zone: string;
  status: TrapStatus;
  clients: { name: string } | null;
  trap_checks: { id: string; created_at: string; status: string; photo_path: string | null }[];
};

type MetricCardProps = {
  title: string;
  value: number;
  helper: string;
  tone?: "emerald" | "blue" | "amber" | "rose" | "slate";
};

const activityStatuses = ["activity"];
const pendingStatuses = ["maintenance", "lost", "damaged", "missing", "pending"];
const activeTrapStatuses = ["active"];

function startOfTodayIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <AdminShell title="Dashboard administrativo" description="Métricas operativas de TrapGo.">
        <ErrorState message="Configura Supabase para consultar métricas reales." />
      </AdminShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const todayIso = startOfTodayIso();

  const [
    clientsResult,
    activeTrapsResult,
    todayChecksResult,
    activityChecksResult,
    pendingTrapsResult,
    latestChecksResult,
    highActivityTrapsResult,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("traps").select("id", { count: "exact", head: true }).in("status", activeTrapStatuses),
    supabase.from("trap_checks").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("trap_checks").select("id", { count: "exact", head: true }).in("status", activityStatuses),
    supabase.from("traps").select("id", { count: "exact", head: true }).in("status", pendingStatuses),
    supabase
      .from("trap_checks")
      .select("id,status,observations,photo_path,created_at,traps(label,site,zone,public_code,clients(name))")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("traps")
      .select("id,label,site,zone,status,clients(name),trap_checks!inner(id,created_at,status,photo_path)")
      .eq("trap_checks.status", "activity")
      .order("created_at", { referencedTable: "trap_checks", ascending: false })
      .limit(10),
  ]);

  const firstError = [
    clientsResult.error,
    activeTrapsResult.error,
    todayChecksResult.error,
    activityChecksResult.error,
    pendingTrapsResult.error,
    latestChecksResult.error,
    highActivityTrapsResult.error,
  ].find(Boolean);

  const latestChecks = ((latestChecksResult.data ?? []) as Omit<DashboardCheck, "photo_url">[]).map((check) => ({
    ...check,
    photo_url: check.photo_path ? supabase.storage.from("trap-photos").getPublicUrl(check.photo_path).data.publicUrl : null,
  }));
  const highActivityTraps = ((highActivityTrapsResult.data ?? []) as ActiveTrapRow[])
    .filter((trap) => trap.trap_checks.length > 0)
    .slice(0, 10);

  return (
    <AdminShell
      title="Dashboard administrativo"
      description="Métricas en tiempo real consultadas directamente desde Supabase, sin Prisma ni datos simulados."
      actions={
        <>
          <ButtonLink href="/clientes/nuevo">Crear cliente</ButtonLink>
          <ButtonLink href="/trampas/nueva" variant="secondary">Crear trampa</ButtonLink>
        </>
      }
    >
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total de clientes" value={clientsResult.count ?? 0} helper="Clientes registrados" tone="emerald" />
        <MetricCard title="Trampas activas" value={activeTrapsResult.count ?? 0} helper="status active" tone="blue" />
        <MetricCard title="Revisiones hoy" value={todayChecksResult.count ?? 0} helper="Desde las 00:00 locales" tone="slate" />
        <MetricCard title="Con actividad" value={activityChecksResult.count ?? 0} helper="Revisiones status activity" tone="rose" />
        <MetricCard title="Servicios pendientes" value={pendingTrapsResult.count ?? 0} helper="Dañadas, perdidas o mantenimiento" tone="amber" />
      </section>

      {firstError ? <section className="mt-6"><ErrorState message={firstError.message} /></section> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <QuickLink href="/clientes/nuevo" title="Crear cliente" description="Alta de una nueva cuenta." />
        <QuickLink href="/trampas/nueva" title="Crear trampa" description="Asignar QR y ubicación." />
        <QuickLink href="/reportes" title="Ver reportes" description="Ir a reportes operativos." />
        <QuickLink href="/tecnicos" title="Ver técnicos" description="Consultar equipo técnico." />
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Últimas 10 revisiones</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha/hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Trampa</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Nivel</th>
                  <th className="px-4 py-3">Técnico</th>
                  <th className="px-4 py-3">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestChecks.length ? latestChecks.map((check) => <ReviewRow check={check} key={check.id} />) : <tr><td className="px-4 py-6 text-slate-500" colSpan={8}>Sin revisiones registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trampas con actividad alta</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {highActivityTraps.length ? highActivityTraps.map((trap) => <HighActivityTrap trap={trap} key={trap.id} />) : <p className="p-5 text-sm text-slate-500">No hay trampas con actividad detectada.</p>}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function MetricCard({ title, value, helper, tone = "slate" }: MetricCardProps) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{title}</p><strong className={`mt-3 inline-flex rounded-2xl px-3 py-2 text-3xl font-black ring-1 ${tones[tone]}`}>{value}</strong><p className="mt-3 text-xs text-slate-500">{helper}</p></article>;
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return <Link className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md" href={href}><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm text-slate-600">{description}</p></Link>;
}

function ReviewRow({ check }: { check: DashboardCheck }) {
  const activityLevel = getActivityLevel(check.status);
  return (
    <tr className="align-top">
      <td className="px-4 py-4 text-slate-700">{formatDate(check.created_at)}</td>
      <td className="px-4 py-4 font-medium">{check.traps?.clients?.name ?? "Sin cliente"}</td>
      <td className="px-4 py-4">{check.traps?.label ?? "Sin trampa"}</td>
      <td className="px-4 py-4 text-slate-600">{check.traps ? `${check.traps.site} · ${check.traps.zone}` : "Sin zona"}</td>
      <td className="px-4 py-4"><StatusBadge status={check.status} /></td>
      <td className="px-4 py-4 font-semibold">{activityLevel}</td>
      <td className="px-4 py-4 text-slate-500">No registrado</td>
      <td className="px-4 py-4">{check.photo_path ? <a className="font-semibold text-emerald-700 underline" href={check.photo_url ?? check.photo_path ?? "#"} target="_blank" rel="noreferrer">Ver foto</a> : <span className="text-slate-400">Sin foto</span>}</td>
    </tr>
  );
}

function HighActivityTrap({ trap }: { trap: ActiveTrapRow }) {
  const lastActivity = trap.trap_checks[0];
  return <article className="border-b border-slate-100 p-5 last:border-0"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{trap.clients?.name ?? "Sin cliente"}</p><h3 className="mt-1 font-bold">{trap.label}</h3></div><StatusBadge status="activity" /></div><p className="mt-3 text-sm text-slate-600">{trap.site} · {trap.zone}</p><p className="mt-2 text-xs text-slate-500">Última actividad: {lastActivity ? formatDate(lastActivity.created_at) : "Sin fecha"}</p></article>;
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "activity" ? "bg-rose-50 text-rose-700" : status === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}>{status}</span>;
}

function getActivityLevel(status: string) {
  if (status === "activity") return "Alta";
  if (status === "ok") return "Sin actividad";
  return "Requiere atención";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
