import Link from "next/link";
import { AdminShell, ErrorState } from "@/components/admin/ui";
import { asReportDatabaseClient } from "@/lib/supabase/report-db";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientRow = { id: string; name: string; contact_name?: string | null; business_name?: string | null };
type ServiceOrderRow = { id: string; scheduled_date: string; status: string; clients: { name: string } | null; sites: { name: string } | null };

export default async function ReportsPage() {
  if (!hasSupabaseEnv()) {
    return <AdminShell title="Reportes"><ErrorState message="Configura Supabase para consultar reportes reales." /></AdminShell>;
  }

  const supabase = await createSupabaseServerClient();
  const db = asReportDatabaseClient(supabase);
  const [clientsResult, serviceOrdersResult] = await Promise.all([
    db.from("clients").select("id,name,contact_name,business_name").order("name", { ascending: true }).limit(50),
    db.from("service_orders").select("id,scheduled_date,status,clients(name),sites(name)").order("scheduled_date", { ascending: false }).limit(50),
  ]);

  const clients = (clientsResult.data ?? []) as ClientRow[];
  const serviceOrders = (serviceOrdersResult.data ?? []) as ServiceOrderRow[];
  const error = clientsResult.error ?? serviceOrdersResult.error;

  return (
    <AdminShell title="Reportes" description="Vistas web imprimibles consultadas directamente desde Supabase, listas para una futura exportación a PDF.">
      {error ? <section className="mt-8"><ErrorState message={error.message} /></section> : null}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ReportList title="Reportes por cliente" description="Incluye datos del cliente, sitios, trampas, revisiones, actividad, evidencias y observaciones.">
          {clients.length ? clients.map((client) => (
            <Link className="block border-b border-slate-100 p-4 transition last:border-0 hover:bg-slate-50" href={`/reportes/cliente/${client.id}`} key={client.id}>
              <strong className="text-slate-950">{client.name}</strong>
              <p className="mt-1 text-sm text-slate-600">{client.business_name ?? client.contact_name ?? "Sin razón social/contacto"}</p>
            </Link>
          )) : <p className="p-4 text-sm text-slate-500">No hay clientes registrados.</p>}
        </ReportList>

        <ReportList title="Reportes por servicio" description="Resume orden, técnico, trampas revisadas/pendientes, evidencias, observaciones y cierre.">
          {serviceOrders.length ? serviceOrders.map((order) => (
            <Link className="block border-b border-slate-100 p-4 transition last:border-0 hover:bg-slate-50" href={`/reportes/servicio/${order.id}`} key={order.id}>
              <strong className="text-slate-950">{order.clients?.name ?? "Cliente no disponible"}</strong>
              <p className="mt-1 text-sm text-slate-600">{order.sites?.name ?? "Sitio no disponible"} · {formatDate(order.scheduled_date)} · {order.status}</p>
            </Link>
          )) : <p className="p-4 text-sm text-slate-500">No hay servicios registrados.</p>}
        </ReportList>
      </section>
    </AdminShell>
  );
}

function ReportList({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-slate-600">{description}</p></div>{children}</article>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(value));
}
