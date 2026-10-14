"use client";

import { useEffect } from "react";

export default function AuthNotice() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("authError") !== "columbia-email-required") {
      return;
    }

    window.alert("Only Columbia and Barnard email addresses are allowed.");
    url.searchParams.delete("authError");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
