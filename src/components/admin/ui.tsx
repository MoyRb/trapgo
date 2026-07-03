import Link from "next/link";

export function AdminShell({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-8"><header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between"><div><Link className="text-sm font-semibold text-emerald-700" href="/">← TrapGo</Link><h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-slate-600">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}</header>{children}</main>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const cls = variant === "primary" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
  return <Link className={`inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition ${cls}`} href={href}>{children}</Link>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-xl text-slate-600">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><strong>Error</strong><p className="mt-1 text-sm">{message}</p></div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>;
}

export const inputClass = "rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export const submitClass = "rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700";
