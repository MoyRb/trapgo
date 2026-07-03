import Link from "next/link";
import { ErrorState } from "@/components/admin/ui";
import { PrintButton } from "@/components/reportes/print-button";
import { asReportDatabaseClient } from "@/lib/supabase/report-db";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ clientId: string }> };
type Client = { id: string; name: string; business_name: string | null; contact_name: string | null; contact_phone: string | null; address: string | null; notes: string | null };
type Site = { id: string; name: string; address: string | null; notes: string | null };
type Trap = { id: string; public_code: string; name: string; expected_location: string | null; status: string; sites: { name: string } | null; zones: { name: string } | null };
type Check = { id: string; checked_at: string; trap_status: string; activity_level: string | null; notes: string | null; photo_url: string | null; traps: { name: string; public_code: string; sites: { name: string } | null; zones: { name: string } | null } | null };

export default async function ClientReportPage({ params }: PageProps) {
  const { clientId } = await params;
  if (!hasSupabaseEnv()) return <ReportFrame><ErrorState message="Configura Supabase para consultar el reporte." /></ReportFrame>;

  const supabase = await createSupabaseServerClient();
  const db = asReportDatabaseClient(supabase);
  const [clientResult, sitesResult, trapsResult, checksResult] = await Promise.all([
    db.from("clients").select("id,name,business_name,contact_name,contact_phone,address,notes").eq("id", clientId).single(),
    db.from("sites").select("id,name,address,notes").eq("client_id", clientId).order("name"),
    db.from("traps").select("id,public_code,name,expected_location,status,sites(name),zones(name)").eq("client_id", clientId).eq("status", "active").order("name"),
    db.from("trap_checks").select("id,checked_at,trap_status,activity_level,notes,photo_url,traps!inner(name,public_code,client_id,sites(name),zones(name))").eq("traps.client_id", clientId).order("checked_at", { ascending: false }).limit(25),
  ]);

  const error = clientResult.error ?? sitesResult.error ?? trapsResult.error ?? checksResult.error;
  const client = clientResult.data as Client | null;
  const sites = (sitesResult.data ?? []) as Site[];
  const traps = (trapsResult.data ?? []) as Trap[];
  const checks = (checksResult.data ?? []) as Check[];
  const activityChecks = checks.filter((check) => check.activity_level && check.activity_level !== "none");
  const photos = checks.filter((check) => check.photo_url);

  return (
    <ReportFrame actions={<><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold print:hidden" href="/reportes">Volver</Link><PrintButton /></>}>
      {error ? <ErrorState message={error.message} /> : null}
      {!client ? <ErrorState message="Cliente no encontrado." /> : (
        <Document title="Reporte por cliente" subtitle={client.name}>
          <Section title="Datos del cliente"><InfoGrid items={[["Razón social", client.business_name], ["Contacto", client.contact_name], ["Teléfono", client.contact_phone], ["Dirección", client.address]]} /></Section>
          <Section title="Sitios registrados"><SimpleList items={sites.map((site) => `${site.name}${site.address ? ` · ${site.address}` : ""}${site.notes ? ` · ${site.notes}` : ""}`)} empty="Sin sitios registrados." /></Section>
          <Section title="Trampas activas"><SimpleList items={traps.map((trap) => `${trap.name} (${trap.public_code}) · ${trap.sites?.name ?? "Sin sitio"} · ${trap.zones?.name ?? "Sin zona"}${trap.expected_location ? ` · ${trap.expected_location}` : ""}`)} empty="Sin trampas activas." /></Section>
          <Section title="Últimas revisiones"><ChecksTable checks={checks} /></Section>
          <Section title="Actividad detectada"><SimpleList items={activityChecks.map((check) => `${formatDateTime(check.checked_at)} · ${check.traps?.name ?? "Trampa"} · ${check.activity_level}`)} empty="Sin actividad detectada en las últimas revisiones." /></Section>
          <Section title="Fotos de evidencia"><EvidenceGrid checks={photos} /></Section>
          <Section title="Observaciones"><SimpleList items={[client.notes, ...checks.map((check) => check.notes)].filter(Boolean) as string[]} empty="Sin observaciones registradas." /></Section>
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
function ChecksTable({ checks }: { checks: Check[] }) { return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b"><th className="py-2">Fecha</th><th>Trampa</th><th>Ubicación</th><th>Estado</th><th>Actividad</th></tr></thead><tbody>{checks.length ? checks.map((check) => <tr className="border-b align-top" key={check.id}><td className="py-2">{formatDateTime(check.checked_at)}</td><td>{check.traps?.name ?? "No disponible"}</td><td>{check.traps?.sites?.name ?? "Sin sitio"} · {check.traps?.zones?.name ?? "Sin zona"}</td><td>{check.trap_status}</td><td>{check.activity_level ?? "No registrada"}</td></tr>) : <tr><td className="py-3 text-slate-500" colSpan={5}>Sin revisiones.</td></tr>}</tbody></table></div>; }
function EvidenceGrid({ checks }: { checks: Check[] }) { return checks.length ? <div className="grid gap-4 sm:grid-cols-2">{checks.map((check) => <figure className="break-inside-avoid rounded-xl border border-slate-200 p-3" key={check.id}><img alt={`Evidencia de ${check.traps?.name ?? "trampa"}`} className="h-48 w-full rounded-lg object-cover" src={check.photo_url ?? ""} /><figcaption className="mt-2 text-xs text-slate-600">{formatDateTime(check.checked_at)} · {check.traps?.name ?? "Trampa"}</figcaption></figure>)}</div> : <p className="text-slate-500">Sin fotos de evidencia.</p>; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
