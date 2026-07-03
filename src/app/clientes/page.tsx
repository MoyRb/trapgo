import Link from "next/link";
import { AdminShell, ButtonLink, EmptyState, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  if (!hasSupabaseEnv()) return <AdminShell title="Clientes"><ErrorState message="Configura Supabase." /></AdminShell>;
  const supabase = await createSupabaseServerClient();
  const { data: clients, error } = await supabase.from("clients").select("id,name,business_name,contact_name,email,contact_phone,status,created_at").order("created_at", { ascending: false });
  return <AdminShell title="Clientes" description="Listado real leído desde Supabase." actions={<ButtonLink href="/clientes/nuevo">Nuevo cliente</ButtonLink>}><section className="mt-8">{error ? <ErrorState message={error.message} /> : !clients?.length ? <EmptyState title="No hay clientes" description="Crea el primer cliente para asignarle trampas." action={<ButtonLink href="/clientes/nuevo">Crear cliente</ButtonLink>} /> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{clients.map((client) => <Link className="grid gap-2 border-b border-slate-100 p-5 transition last:border-0 hover:bg-slate-50 md:grid-cols-5" href={`/clientes/${client.id}`} key={client.id}><strong>{client.name}</strong><span>{client.business_name ?? "Sin razón social"}</span><span>{client.contact_name ?? "Sin contacto"}</span><span>{client.email ?? client.contact_phone ?? "Sin contacto"}</span><span className={client.status === "inactive" ? "text-slate-400" : "text-emerald-700"}>{client.status === "inactive" ? "Inactivo" : "Activo"}</span></Link>)}</div>}</section></AdminShell>;
}
