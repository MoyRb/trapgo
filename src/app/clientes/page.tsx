import Link from "next/link";
import { AdminShell, ButtonLink, EmptyState, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  if (!hasSupabaseEnv()) return <AdminShell title="Clientes"><ErrorState message="Configura las variables públicas de Supabase." /></AdminShell>;
  const supabase = await createSupabaseServerClient();
  const { data: clients, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  return <AdminShell title="Clientes" description="Listado leído directamente desde Supabase." actions={<ButtonLink href="/clientes/nuevo">Nuevo cliente</ButtonLink>}><section className="mt-8">{error ? <ErrorState message={error.message} /> : !clients?.length ? <EmptyState title="No hay clientes" description="Crea el primer cliente para asignarle trampas." action={<ButtonLink href="/clientes/nuevo">Crear cliente</ButtonLink>} /> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{clients.map((client) => <Link className="grid gap-2 border-b border-slate-100 p-5 transition last:border-0 hover:bg-slate-50 md:grid-cols-4" href={`/clientes/${client.id}`} key={client.id}><strong>{client.name}</strong><span>{client.contact_name ?? "Sin contacto"}</span><span>{client.email ?? "Sin email"}</span><span className={client.is_active === false ? "text-slate-400" : "text-emerald-700"}>{client.is_active === false ? "Inactivo" : "Activo"}</span></Link>)}</div>}</section></AdminShell>;
}
