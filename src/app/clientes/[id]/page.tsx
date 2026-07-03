import { notFound } from "next/navigation";
import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deactivateClient, deleteClient } from "../actions";

function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="text-sm font-semibold text-slate-500">{label}</dt><dd className="mt-1 font-medium text-slate-950">{value || "No registrado"}</dd></div>; }

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ data: client, error }, { data: traps }] = await Promise.all([supabase.from("clients").select("*").eq("id", id).single(), supabase.from("traps").select("id,name,public_code,status").eq("client_id", id).order("created_at", { ascending: false })]);
  if (!client && !error) notFound();
  if (error) return <AdminShell title="Cliente"><ErrorState message={error.message} /></AdminShell>;
  return <AdminShell title={client.name} description="Detalle del cliente desde Supabase." actions={<><ButtonLink href="/clientes" variant="secondary">Clientes</ButtonLink><ButtonLink href={`/clientes/${id}/editar`}>Editar</ButtonLink></>}><section className="mt-8 grid gap-6 lg:grid-cols-3"><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><dl className="grid gap-4 sm:grid-cols-2"><Info label="Razón social" value={client.business_name} /><Info label="Contacto" value={client.contact_name} /><Info label="Email" value={client.email} /><Info label="Teléfono" value={client.contact_phone} /><Info label="Dirección" value={client.address} /><Info label="Estado" value={client.status === "inactive" ? "Inactivo" : "Activo"} /><Info label="Notas" value={client.notes} /></dl><div className="mt-6 flex flex-wrap gap-3"><form action={deactivateClient.bind(null, id)}><button className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50">Desactivar</button></form><form action={deleteClient.bind(null, id)}><button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Eliminar</button></form></div></article><aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Trampas asignadas</h2><div className="mt-4 grid gap-3">{!traps?.length ? <p className="text-sm text-slate-500">Sin trampas asignadas.</p> : traps.map((trap) => <a className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50" href={`/trampas/${trap.id}`} key={trap.id}><strong>{trap.name}</strong><p className="text-sm text-slate-500">{trap.public_code} · {trap.status}</p></a>)}</div></aside></section></AdminShell>;
}
