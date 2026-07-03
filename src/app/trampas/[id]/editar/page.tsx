import { notFound } from "next/navigation";
import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateTrap } from "../../actions";
import { TrapForm } from "../../form";
export const dynamic = "force-dynamic";
export default async function EditTrapPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createSupabaseServerClient(); const [{ data: trap, error }, { data: clients }] = await Promise.all([supabase.from("traps").select("*").eq("id", id).single(), supabase.from("clients").select("*").order("name")]); if (!trap && !error) notFound(); if (error) return <AdminShell title="Editar trampa"><ErrorState message={error.message} /></AdminShell>; return <AdminShell title="Editar trampa" actions={<ButtonLink href={`/trampas/${id}`} variant="secondary">Cancelar</ButtonLink>}><TrapForm trap={trap} clients={clients ?? []} action={updateTrap.bind(null, id)} /></AdminShell>; }
