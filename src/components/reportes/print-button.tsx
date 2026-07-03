"use client";

export function PrintButton() {
  return (
    <button
      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Imprimir
    </button>
  );
}
