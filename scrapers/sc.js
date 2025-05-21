const axios = require('axios');
const crypto = require('crypto');
const UserAgent = require('user-agents');
const ytdl = {};
ytdl.url = async (u, f) => {
const iu = s => { try { new URL(s); return true; } catch { return false; } };
if (!u) return { status: false, creador: "EliasarYT", dl: "No se proporcionó enlace." };
if (!iu(u)) return { status: false, creador: "EliasarYT", dl: "Enlace no válido." };
const ext = url => {
const p = [/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/];
for (let r of p) if (r.test(url)) return url.match(r)[1];
return null;
};
const id = ext(u);
if (!id) return { status: false, creador: "EliasarYT", dl: "No se pudo extraer ID." };
async function a() {
const b = "https://p.oceansaver.in/ajax/", pUrl = "https://p.oceansaver.in/ajax/progress.php";
const h = { authority: "p.oceansaver.in", origin: "https://y2down.cc", referer: "https://y2down.cc/", "user-agent": "Postify/1.0.0" };
const sf = ["360", "480", "720", "1080", "1440", "2160", "mp3", "m4a", "wav", "aac", "flac", "opus", "ogg"];
if (!sf.includes(f)) return { status: false, dl: "Formato no soportado." };
const req = async (ep, p = {}) => {
try {
const { data } = await axios.get(`${b}${ep}`, { params: p, headers: h, withCredentials: true });
return data;
} catch (e) { return { success: false, error: e.message, details: e.response?.data || "" }; }
};
const r = await req("download.php", { format: f, url: `https://www.youtube.com/watch?v=${id}` });
if (!r.success || !r.id) return { status: false, dl: r.message || "Error en ytdown." };
let t = 0, prog;
while (t < 100) {
try {
const { data } = await axios.get(pUrl, { params: { id: r.id }, headers: h, withCredentials: true });
if (data.download_url && data.success) { prog = data; break; }
else if (!data.download_url && data.success) return { status: false, dl: data.text };
} catch (e) {}
await new Promise(res => setTimeout(res, 1000));
t++;
}
if (!prog || !prog.download_url) return { status: false, dl: "Tiempo agotado en ytdown." };
return { status: true, dl: prog.download_url };
}
async function b() {
const base = "https://ytdown.siputzx.my.id", h = { "User-Agent": "Postify/1.0.0" };
try {
const r1 = await axios.post(`${base}/api/get-info`, new URLSearchParams({ url: u }), { headers: h });
const vi = r1.data;
if (vi.error) return { status: false, dl: vi.error };
const r2 = await axios.post(`${base}/api/download`, new URLSearchParams({ id: vi.id, format: f, info: JSON.stringify(vi) }), { headers: h });
return { status: true, dl: `${base}${r2.data.download_url}` };
} catch (e) { return { status: false, dl: e.message }; }
}
async function c() {
const base = "https://media.savetube.me/api", cdnEp = "/random-cdn", infoEp = "/v2/info", downEp = "/download";
const sf = ["144", "240", "360", "480", "720", "1080", "mp3"];
function gen() { return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`; }
const h = { accept: "*/*", "content-type": "application/json", origin: "https://yt.savetube.me", referer: "https://yt.savetube.me/", "user-agent": new UserAgent().toString(), "x-forwarded-for": gen() };
if (!sf.includes(f)) return { status: false, dl: "Formato no soportado." };
async function req(ep, d = {}, m = "post") {
try {
const r = await axios({ method: m, url: `${ep.startsWith("http") ? "" : base}${ep}`, data: m === "post" ? d : undefined, params: m === "get" ? d : undefined, headers: h });
return { status: true, res: r.data };
} catch (e) { return { status: false, dl: `Error en solicitud: ${e.message}` }; }
}
const cdnR = await req(cdnEp, {}, "get");
if (!cdnR.status) return cdnR;
const cdn = cdnR.res.cdn;
const infoR = await req(`https://${cdn}${infoEp}`, { url: `https://www.youtube.com/watch?v=${id}` });
if (!infoR.status) return infoR;
async function dec(enc) {
try {
const sk = "C5D58EF67A7584E4A29F6C35BBC4EB12";
const dB = Buffer.from(enc, "base64"), iv = dB.slice(0, 16), ct = dB.slice(16), key = Buffer.from(sk, "hex"), deciph = crypto.createDecipheriv("aes-128-cbc", key, iv);
let d = deciph.update(ct);
d = Buffer.concat([d, deciph.final()]);
return JSON.parse(d.toString());
} catch (e) { throw new Error(`Error al desencriptar: ${e.message}`); }
}
const decR = await dec(infoR.res.data);
const downR = await req(`https://${cdn}${downEp}`, { id: id, downloadType: f === "mp3" ? "audio" : "video", quality: f, key: decR.key });
if (!downR.status) return downR;
return { status: true, dl: downR.res.data.downloadUrl };
}
let r = await a();
if (r.status) return { status: true, creador: "EliasarYT", dl: r.dl };
r = await b();
if (r.status) return { status: true, creador: "EliasarYT", dl: r.dl };
r = await c();
if (r.status) return { status: true, creador: "EliasarYT", dl: r.dl };
return { status: false, creador: "EliasarYT", dl: "Todos fallaron." };
};
module.exports = ytdl;