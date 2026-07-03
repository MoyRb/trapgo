import Link from "next/link";
import { ErrorState } from "@/components/admin/ui";
import { PrintButton } from "@/components/reportes/print-button";
import { asReportDatabaseClient } from "@/lib/supabase/report-db";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ serviceOrderId: string }> };
type ServiceOrder = { id: string; scheduled_date: string; status: string; notes: string | null; clients: { id: string; name: string } | null; sites: { id: string; name: string; address: string | null } | null; profiles: { full_name: string | null } | null };
type Trap = { id: string; public_code: string; name: string; status: string; expected_location: string | null; zones: { name: string } | null };
type Check = { id: string; checked_at: string; trap_status: string; activity_level: string | null; notes: string | null; photo_url: string | null; traps: Trap | null };

export default async function ServiceReportPage({ params }: PageProps) {
  const { serviceOrderId } = await params;
  if (!hasSupabaseEnv()) return <ReportFrame><ErrorState message="Configura Supabase para consultar el reporte." /></ReportFrame>;

  const supabase = await createSupabaseServerClient();
  const db = asReportDatabaseClient(supabase);
  const orderResult = await db.from("service_orders").select("id,scheduled_date,status,notes,clients(id,name),sites(id,name,address),profiles(full_name)").eq("id", serviceOrderId).single();
  const order = orderResult.data as ServiceOrder | null;
  const [checksResult, trapsResult] = order ? await Promise.all([
    db.from("trap_checks").select("id,checked_at,trap_status,activity_level,notes,photo_url,traps(id,public_code,name,status,expected_location,zones(name))").eq("service_order_id", serviceOrderId).order("checked_at", { ascending: true }),
    db.from("traps").select("id,public_code,name,status,expected_location,zones(name)").eq("site_id", order.sites?.id ?? "").order("name"),
  ]) : [{ data: [], error: null }, { data: [], error: null }];

  const checks = (checksResult.data ?? []) as Check[];
  const siteTraps = (trapsResult.data ?? []) as Trap[];
  const checkedIds = new Set(checks.map((check) => check.traps?.id).filter(Boolean));
  const pendingTraps = siteTraps.filter((trap) => !checkedIds.has(trap.id));
  const evidenceChecks = checks.filter((check) => check.photo_url);
  const observations = [order?.notes, ...checks.map((check) => check.notes)].filter(Boolean) as string[];
  const error = orderResult.error ?? checksResult.error ?? trapsResult.error;

  return (
    <ReportFrame actions={<><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold print:hidden" href="/reportes">Volver</Link><PrintButton /></>}>
      {error ? <ErrorState message={error.message} /> : null}
      {!order ? <ErrorState message="Servicio no encontrado." /> : (
        <Document title="Reporte por servicio" subtitle={`${order.clients?.name ?? "Cliente"} · ${order.sites?.name ?? "Sitio"}`}>
          <Section title="Datos del servicio"><InfoGrid items={[["Cliente", order.clients?.name ?? null], ["Sitio", order.sites?.name ?? null], ["Dirección", order.sites?.address ?? null], ["Técnico", order.profiles?.full_name ?? null], ["Fecha programada", formatDate(order.scheduled_date)], ["Estado del servicio", order.status]]} /></Section>
          <Section title="Trampas revisadas"><TrapCheckTable checks={checks} /></Section>
          <Section title="Trampas pendientes"><SimpleList items={pendingTraps.map((trap) => `${trap.name} (${trap.public_code}) · ${trap.zones?.name ?? "Sin zona"}${trap.expected_location ? ` · ${trap.expected_location}` : ""}`)} empty="No hay trampas pendientes para este sitio." /></Section>
          <Section title="Evidencias"><EvidenceGrid checks={evidenceChecks} /></Section>
          <Section title="Observaciones"><SimpleList items={observations} empty="Sin observaciones registradas." /></Section>
          <Section title="Resumen final"><p className="text-slate-700">Servicio {order.status}. Se revisaron {checks.length} de {siteTraps.length} trampas registradas en el sitio. Quedan {pendingTraps.length} trampas pendientes y {evidenceChecks.length} evidencias fotográficas adjuntas.</p></Section>
        </Document>
      )}
    </ReportFrame>
  );
}

function ReportFrame({ actions, children }: { actions?: React.ReactNode; children: React.ReactNode }) { return <main className="mx-auto min-h-screen max-w-5xl bg-slate-100 px-4 py-8 print:bg-white print:p-0"><div className="mb-4 flex justify-end gap-2 print:hidden">{actions}</div>{children}</main>; }
function Document({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <article className="bg-white p-8 shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0"><header className="border-b border-slate-300 pb-6"><p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700">TrapGo</p><h1 className="mt-3 text-3xl font-black">{title}</h1><p className="mt-2 text-xl text-slate-700">{subtitle}</p><p className="mt-2 text-sm text-slate-500">Generado: {formatDateTime(new Date().toISOString())}</p></header>{children}</article>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="break-inside-avoid border-b border-slate-200 py-6 last:border-0"><h2 className="mb-4 text-lg font-bold text-slate-950">{title}</h2>{children}</section>; }
function InfoGrid({ items }: { items: [string, string | null][] }) { return <dl className="grid gap-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 text-slate-900">{value ?? "No registrado"}</dd></div>)}</dl>; }
function SimpleList({ items, empty }: { items: string[]; empty: string }) { return items.length ? <ul className="list-disc space-y-2 pl-5 text-slate-700">{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="text-slate-500">{empty}</p>; }
function TrapCheckTable({ checks }: { checks: Check[] }) { return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b"><th className="py-2">Fecha</th><th>Trampa</th><th>Zona</th><th>Estado</th><th>Actividad</th></tr></thead><tbody>{checks.length ? checks.map((check) => <tr className="border-b align-top" key={check.id}><td className="py-2">{formatDateTime(check.checked_at)}</td><td>{check.traps?.name ?? "No disponible"}</td><td>{check.traps?.zones?.name ?? "Sin zona"}</td><td>{check.trap_status}</td><td>{check.activity_level ?? "No registrada"}</td></tr>) : <tr><td className="py-3 text-slate-500" colSpan={5}>Sin trampas revisadas.</td></tr>}</tbody></table></div>; }
function EvidenceGrid({ checks }: { checks: Check[] }) { return checks.length ? <div className="grid gap-4 sm:grid-cols-2">{checks.map((check) => <figure className="break-inside-avoid rounded-xl border border-slate-200 p-3" key={check.id}><img alt={`Evidencia de ${check.traps?.name ?? "trampa"}`} className="h-48 w-full rounded-lg object-cover" src={check.photo_url ?? ""} /><figcaption className="mt-2 text-xs text-slate-600">{formatDateTime(check.checked_at)} · {check.traps?.name ?? "Trampa"}</figcaption></figure>)}</div> : <p className="text-slate-500">Sin evidencias fotográficas.</p>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
