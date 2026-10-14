"use client";

import { useEffect, useState } from "react";

export default function AuthNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("authError") !== "columbia-email-required") {
      return;
    }

    setVisible(true);
    url.searchParams.delete("authError");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102943]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setVisible(false);
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="auth-notice-title" className="paper-panel w-full max-w-md border border-[#174f82]/15 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6eafa] text-3xl" aria-hidden="true">🎓</div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#174f82]">School email required</p>
        <h2 id="auth-notice-title" className="mt-2 text-2xl text-[#101c2a]">Only Columbia and Barnard email addresses are allowed.</h2>
        <p className="mt-3 text-sm leading-6 text-[#5e7388]">Choose your Columbia or Barnard Google account to continue.</p>
        <button type="button" autoFocus onClick={() => setVisible(false)} className="mt-6 rounded-xl bg-[#174f82] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#103b64] focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60">
          Got it
        </button>
      </section>
    </div>
  );
}
