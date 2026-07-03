import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTrap } from "../actions";
import { TrapForm } from "../form";
export const dynamic = "force-dynamic";
export default async function NewTrapPage() { const supabase = await createSupabaseServerClient(); const { data: clients, error } = await supabase.from("clients").select("*").neq("is_active", false).order("name"); return <AdminShell title="Nueva trampa" actions={<ButtonLink href="/trampas" variant="secondary">Volver</ButtonLink>}>{error ? <ErrorState message={error.message} /> : <TrapForm clients={clients ?? []} action={createTrap} />}</AdminShell>; }
