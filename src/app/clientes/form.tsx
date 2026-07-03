import { Field, inputClass, submitClass } from "@/components/admin/ui";
import type { Client } from "@/lib/crud/types";

export function ClientForm({ client, action }: { client?: Client; action: (formData: FormData) => Promise<void> }) {
  return <form action={action} className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><Field label="Empresa / Cliente"><input className={inputClass} defaultValue={client?.name ?? ""} name="name" required /></Field><Field label="Contacto"><input className={inputClass} defaultValue={client?.contact_name ?? ""} name="contact_name" /></Field><Field label="Email"><input className={inputClass} defaultValue={client?.email ?? ""} name="email" type="email" /></Field><Field label="Teléfono"><input className={inputClass} defaultValue={client?.phone ?? ""} name="phone" /></Field><Field label="Estado"><select className={inputClass} defaultValue={client?.is_active === false ? "false" : "true"} name="is_active"><option value="true">Activo</option><option value="false">Inactivo</option></select></Field><button className={submitClass} type="submit">Guardar cliente</button></form>;
}
