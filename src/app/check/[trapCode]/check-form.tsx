"use client";

import { useEffect, useState } from "react";
import { createTrapCheckAction } from "./actions";

export function CheckForm({ trapCode, trapId }: { trapCode: string; trapId: string }) {
  const [saved, setSaved] = useState(false);
  const [geo, setGeo] = useState<{ latitude: string; longitude: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => setGeo({ latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) }));
  }, []);

  async function action(formData: FormData) {
    await createTrapCheckAction(trapCode, trapId, formData);
    setSaved(true);
  }

  return <>{saved ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><strong>Revisión guardada.</strong><p className="text-sm">La evidencia quedó registrada en TrapGo.</p></div> : null}<form action={action} className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-semibold text-slate-700">Nombre del técnico<input className="rounded-xl border border-slate-300 px-3 py-3" name="technician_name" required /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Estado de la trampa<select className="rounded-xl border border-slate-300 px-3 py-3" name="trap_status" required><option value="ok">OK</option><option value="activity_detected">Actividad detectada</option><option value="damaged">Dañada</option><option value="missing">No encontrada</option><option value="needs_replacement">Necesita reemplazo</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Nivel de actividad<select className="rounded-xl border border-slate-300 px-3 py-3" name="activity_level" required><option value="none">Sin actividad</option><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Observaciones<textarea className="min-h-28 rounded-xl border border-slate-300 px-3 py-3" name="notes" placeholder="Describe evidencia, consumo, daños o acciones realizadas." /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Foto de evidencia<input accept="image/*" capture="environment" className="rounded-xl border border-slate-300 px-3 py-3" name="photo" type="file" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700">Latitud<input className="rounded-xl border border-slate-300 px-3 py-3" name="latitude" defaultValue={geo?.latitude ?? ""} /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Longitud<input className="rounded-xl border border-slate-300 px-3 py-3" name="longitude" defaultValue={geo?.longitude ?? ""} /></label></div><p className="text-sm text-slate-500">Si el navegador concede permiso, la latitud y longitud se completan automáticamente.</p><button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700" type="submit">Registrar revisión</button></form></>;
}
