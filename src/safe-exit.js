/* ================================================================
   Safe exit: wipe the page first, then try to leave.
   ================================================================ */
import { revokeAllPhotoUrls } from "./photos.js";

function safeExit(){
  try { revokeAllPhotoUrls(); } catch {}
  document.body.innerHTML = "";
  document.title = "Weather";
  const dest = "https://www.google.com/search?q=weather";
  try { window.top.location.replace(dest); return; } catch {}
  try { window.location.replace(dest); } catch {}
}

export function initSafeExit(){
  document.getElementById("exitBtn").addEventListener("click", safeExit);
  let lastEsc = 0;
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const now = Date.now(); if (now - lastEsc < 900) safeExit(); lastEsc = now;
  });
}
