import { AdminShell, ButtonLink, ErrorState } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTrap } from "../actions";
import { TrapForm } from "../form";
export default async function NewTrapPage() { const supabase = await createSupabaseServerClient(); const [clientsResult, sitesResult, zonesResult] = await Promise.all([supabase.from("clients").select("*").eq("status", "active").order("name"), supabase.from("sites").select("*").order("name"), supabase.from("zones").select("*").order("name")]); const error = clientsResult.error ?? sitesResult.error ?? zonesResult.error; return <AdminShell title="Nueva trampa" actions={<ButtonLink href="/trampas" variant="secondary">Volver</ButtonLink>}>{error ? <ErrorState message={error.message} /> : <TrapForm clients={clientsResult.data ?? []} sites={sitesResult.data ?? []} zones={zonesResult.data ?? []} action={createTrap} />}</AdminShell>; }
