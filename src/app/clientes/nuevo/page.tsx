import { AdminShell, ButtonLink } from "@/components/admin/ui";
import { createClient } from "../actions";
import { ClientForm } from "../form";
export default function NewClientPage() { return <AdminShell title="Nuevo cliente" actions={<ButtonLink href="/clientes" variant="secondary">Volver</ButtonLink>}><ClientForm action={createClient} /></AdminShell>; }
