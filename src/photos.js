import { MESSAGES } from "./content.js";
import { esc, toast } from "./util.js";

/* ================================================================
   Step 5: evidence photos. Re-drawing each image on a canvas and saving
   it as a new JPEG drops all embedded metadata, including GPS.
   ================================================================ */
const photos = []; // {id, name, blob, url, w, h, before, after, msg}

function readGpsInfo(buf){
  const b = new Uint8Array(buf);
  if (b[0] === 0xFF && b[1] === 0xD8){
    const dv = new DataView(buf); let off = 2;
    while (off + 4 < b.length){
      if (b[off] !== 0xFF) break;
      const marker = b[off + 1];
      if (marker === 0xDA || marker === 0xD9) break;
      const size = dv.getUint16(off + 2);
      if (marker === 0xE1 && dv.getUint32(off + 4) === 0x45786966){ // "Exif"
        const t = off + 10;
        const little = dv.getUint16(t) === 0x4949;
        const u16 = o => dv.getUint16(o, little), u32 = o => dv.getUint32(o, little);
        try {
          const ifd = t + u32(t + 4); const count = u16(ifd);
          for (let i = 0; i < count; i++){
            const e = ifd + 2 + i * 12;
            if (u16(e) === 0x8825){ const g = t + u32(e + 8); return { exif:true, gps: u16(g) > 0 }; }
          }
        } catch {}
        return { exif:true, gps:false };
      }
      off += 2 + size;
    }
    return { exif:false, gps:false };
  }
  return { exif:false, gps:false, unknown:true };
}

function loadImage(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 0); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("decode")); };
    img.src = url;
  });
}
function encodeJpeg(src, w, h, q){
  return new Promise(res => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high"; ctx.drawImage(src, 0, 0, w, h);
    c.toBlob(b => res(b), "image/jpeg", q);
  });
}
const fmtMB = n => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

async function processPhoto(file, target){
  const info = readGpsInfo(await file.arrayBuffer());
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { try { src = await loadImage(file); } catch { return { error: true }; } }
  const W = src.width, H = src.height, long = Math.max(W, H);
  const MAX_LONG = 2400, MIN_LONG = 1600; // below about 1600px, screenshot text starts to blur
  let scale = Math.min(1, MAX_LONG / long), q = 0.88, blob;
  for (let k = 0; k < 12; k++){
    blob = await encodeJpeg(src, Math.round(W * scale), Math.round(H * scale), q);
    if (blob.size <= target) break;
    if (q > 0.7) q -= 0.08;
    else if (long * scale * 0.85 >= Math.min(MIN_LONG, long)) scale *= 0.85;
    else break;
  }
  const fits = blob.size <= target;
  const resized = scale < 1 || file.size > target;
  const msg = !fits ? MESSAGES.photoTooBig()
    : resized ? (info.gps ? MESSAGES.photoResizedGps() : MESSAGES.photoResized())
    : (info.gps ? MESSAGES.photoGpsOnly() : MESSAGES.photoClean());
  return { blob, w: Math.round(W * scale), h: Math.round(H * scale), fits, msg, gps: info.gps };
}

function baseName(n){ return n.replace(/\.[^.]+$/, "").replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "photo"; }

function renderPhotos(){
  const list = document.getElementById("photoList");
  list.innerHTML = photos.map(p => p.error
    ? `<li class="photo"><img alt=""><div class="meta"><b>${esc(p.name)}</b><span class="warn">This browser couldn’t open this file. iPhone HEIC photos open in Safari; in other browsers, a screenshot of the photo works.</span></div></li>`
    : `<li class="photo"><img src="${p.url}" alt="Preview of ${esc(p.name)}"><div class="meta"><b>${esc(p.name)}</b>
        <span>${fmtMB(p.before)} to ${fmtMB(p.after)}, ${p.w} × ${p.h}</span>
        <span class="${p.msg.kind === "ok" ? "good" : "warn"}">${esc(p.msg.text)}</span>
        <span>Check the preview to confirm text is still readable.</span></div>
        <button class="small-btn" type="button" data-save="${p.id}">Save</button></li>`
  ).join("");
  const ready = photos.filter(p => !p.error);
  document.getElementById("photoActions").hidden = !photos.length;
  document.getElementById("saveAll").hidden = !ready.length;
  list.querySelectorAll("[data-save]").forEach(b => b.addEventListener("click", () => savePhoto(+b.dataset.save)));
}

/* Plain browser download: the file is built in memory and handed to the
   browser's own save flow. Nothing is uploaded anywhere. */
function saveFile(filename, blob){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener"; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast("Download started");
}
function savePhoto(id){ const p = photos.find(x => x.id === id); if (p) saveFile(`${baseName(p.name)}-ready.jpg`, p.blob); }

async function saveAll(){
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip(); const used = new Set();
  photos.filter(p => !p.error).forEach(p => {
    let n = `${baseName(p.name)}-ready.jpg`, k = 2;
    while (used.has(n)) n = `${baseName(p.name)}-ready-${k++}.jpg`;
    used.add(n); zip.file(n, p.blob);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveFile("petition-photos.zip", blob);
}

let pid = 0;
async function addFiles(files){
  const target = +document.getElementById("target").value;
  for (const file of files){
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) continue;
    const r = await processPhoto(file, target);
    if (r.error) photos.push({ id: ++pid, name: file.name, error: true });
    else photos.push({ id: ++pid, name: file.name, blob: r.blob, url: URL.createObjectURL(r.blob), w: r.w, h: r.h, before: file.size, after: r.blob.size, msg: r.msg });
    renderPhotos();
  }
}

export function revokeAllPhotoUrls(){
  photos.forEach(p => p.url && URL.revokeObjectURL(p.url));
}

export function initPhotos(){
  const input = document.getElementById("photoInput"), drop = document.getElementById("drop");
  input.addEventListener("change", () => { addFiles([...input.files]); input.value = ""; });
  ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
  document.getElementById("clearPhotos").addEventListener("click", () => {
    revokeAllPhotoUrls(); photos.length = 0; renderPhotos();
  });
  document.getElementById("saveAll").addEventListener("click", saveAll);
  renderPhotos();
}
