import { notFound } from "next/navigation";
import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateClient } from "../../actions";
import { ClientForm } from "../../form";
export const dynamic = "force-dynamic";
export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createSupabaseServerClient(); const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single(); if (!client && !error) notFound(); if (error) return <AdminShell title="Editar cliente"><ErrorState message={error.message} /></AdminShell>; return <AdminShell title="Editar cliente" actions={<ButtonLink href={`/clientes/${id}`} variant="secondary">Cancelar</ButtonLink>}><ClientForm client={client} action={updateClient.bind(null, id)} /></AdminShell>; }
