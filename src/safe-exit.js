/* ================================================================
   Safe exit: wipe the page first, then leave for a neutral site.
   The neutral site is added as a new history entry, so pressing Back
   returns to this app, empty: nothing is stored, and a page restored
   from the browser's back/forward cache is reloaded instead of shown.
   ================================================================ */
import { revokeAllPhotoUrls } from "./photos.js";

let exited = false;

function safeExit(){
  exited = true;
  try { revokeAllPhotoUrls(); } catch {}
  document.body.innerHTML = "";
  document.title = "Weather";
  const dest = "https://www.google.com/search?q=weather";
  try { window.top.location.assign(dest); return; } catch {}
  try { window.location.assign(dest); } catch {}
}

export function initSafeExit(){
  document.getElementById("exitBtn").addEventListener("click", safeExit);
  let lastEsc = 0;
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const now = Date.now(); if (now - lastEsc < 900) safeExit(); lastEsc = now;
  });
  // Back after a safe exit: never show the wiped page from cache, load a fresh one.
  window.addEventListener("pageshow", e => { if (e.persisted && exited) location.reload(); });
}
