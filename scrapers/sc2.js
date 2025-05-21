const axios = require('axios');
const crypto = require('crypto');
const UserAgent = require('user-agents');

const ytdl = {};

ytdl.url = async (u, f, type = 'video') => {
  const iu = s => { try { new URL(s); return true; } catch { return false; } };
  if (!u) return { status: false, creador: "EliasarYT", dl: "No se proporcionó enlace." };
  if (!iu(u)) return { status: false, creador: "EliasarYT", dl: "Enlace no válido." };

  const ext = url => {
    const p = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let r of p) if (r.test(url)) return url.match(r)[1];
    return null;
  };
  const id = ext(u);
  if (!id) return { status: false, creador: "EliasarYT", dl: "No se pudo extraer ID." };

  async function a() {
    const baseUrl = "https://p.oceansaver.in/ajax/";
    const progressUrl = "https://p.oceansaver.in/ajax/progress.php";
    const headers = { authority: "p.oceansaver.in", origin: "https://y2down.cc", referer: "https://y2down.cc/", "user-agent": "Postify/1.0.0" };
    const supportedFormats = ["360", "480", "720", "1080", "1440", "2160", "mp3", "m4a", "wav", "aac", "flac", "opus", "ogg"];
    if (!supportedFormats.includes(f)) return { status: false, dl: "Formato no soportado." };
    const req = async (ep, params = {}) => {
      try {
        const { data } = await axios.get(`${baseUrl}${ep}`, { params, headers, withCredentials: true });
        return data;
      } catch (e) {
        return { success: false, error: e.message, details: e.response?.data || "" };
      }
    };
    const r = await req("download.php", { format: f, url: `https://www.youtube.com/watch?v=${id}` });
    if (!r.success || !r.id) return { status: false, dl: r.message || "Error en ytdown." };
    let t = 0, prog;
    while (t < 100) {
      try {
        const { data } = await axios.get(progressUrl, { params: { id: r.id }, headers, withCredentials: true });
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
    const base = "https://ytdown.siputzx.my.id", headers = { "User-Agent": "Postify/1.0.0" };
    try {
      const r1 = await axios.post(`${base}/api/get-info`, new URLSearchParams({ url: u }), { headers });
      const vi = r1.data;
      if (vi.error) return { status: false, dl: vi.error };
      const r2 = await axios.post(`${base}/api/download`, new URLSearchParams({ id: vi.id, format: f, info: JSON.stringify(vi) }), { headers });
      return { status: true, dl: `${base}${r2.data.download_url}` };
    } catch (e) { return { status: false, dl: e.message }; }
  }

  async function c() {
    const base = "https://media.savetube.me/api";
    const cdnEndpoint = "/random-cdn", infoEndpoint = "/v2/info", downEndpoint = "/download";
    const supportedFormats = ["144", "240", "360", "480", "720", "1080", "mp3"];
    function genIP() { return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`; }
    const headers = { accept: "*/*", "content-type": "application/json", origin: "https://yt.savetube.me", referer: "https://yt.savetube.me/", "user-agent": new UserAgent().toString(), "x-forwarded-for": genIP() };
    if (!supportedFormats.includes(f)) return { status: false, dl: "Formato no soportado." };
    async function req(ep, data = {}, method = "post") {
      try {
        const r = await axios({
          method,
          url: `${ep.startsWith("http") ? "" : base}${ep}`,
          data: method === "post" ? data : undefined,
          params: method === "get" ? data : undefined,
          headers
        });
        return { status: true, res: r.data };
      } catch (e) {
        return { status: false, dl: `Error en solicitud: ${e.message}` };
      }
    }
    const cdnR = await req(cdnEndpoint, {}, "get");
    if (!cdnR.status) return cdnR;
    const cdn = cdnR.res.cdn;
    const infoR = await req(`https://${cdn}${infoEndpoint}`, { url: `https://www.youtube.com/watch?v=${id}` });
    if (!infoR.status) return infoR;
    async function dec(enc) {
      try {
        const sk = "C5D58EF67A7584E4A29F6C35BBC4EB12";
        const dB = Buffer.from(enc, "base64"), iv = dB.slice(0, 16), ct = dB.slice(16),
              key = Buffer.from(sk, "hex"),
              deciph = crypto.createDecipheriv("aes-128-cbc", key, iv);
        let d = deciph.update(ct);
        d = Buffer.concat([d, deciph.final()]);
        return JSON.parse(d.toString());
      } catch (e) { throw new Error(`Error al desencriptar: ${e.message}`); }
    }
    const decR = await dec(infoR.res.data);
    const downR = await req(`https://${cdn}${downEndpoint}`, { id, downloadType: f === "mp3" ? "audio" : "video", quality: f, key: decR.key });
    if (!downR.status) return downR;
    return { status: true, dl: downR.res.data.downloadUrl };
  }

  async function d() {
    const ogmp3 = {
      api: {
        base: "https://api3.apiapi.lat",
        endpoints: {
          a: "https://api5.apiapi.lat",
          b: "https://api.apiapi.lat",
          c: "https://api3.apiapi.lat"
        }
      },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Postify/1.0.0',
      },
      formats: {
        video: ['240', '360', '480', '720', '1080'],
        audio: ['64', '96', '128', '192', '256', '320']
      },
      default_fmt: {
        video: '720',
        audio: '320'
      },
      restrictedTimezones: new Set(["-330", "-420", "-480", "-540"]),
      utils: {
        hash: () => {
          const array = new Uint8Array(16);
          crypto.randomFillSync(array);
          return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
        },
        encoded: (str) => {
          let result = "";
          for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ 1);
          }
          return result;
        },
        enc_url: (url, separator = ",") => {
          const codes = [];
          for (let i = 0; i < url.length; i++) {
            codes.push(url.charCodeAt(i));
          }
          return codes.join(separator).split(separator).reverse().join(separator);
        },
        generateRandomIP: () => {
          return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
        }
      },
      isUrl: str => {
        try {
          const url = new URL(str);
          const hostname = url.hostname.toLowerCase();
          const patterns = [/^(.+\.)?youtube\.com$/, /^(.+\.)?youtube-nocookie\.com$/, /^youtu\.be$/];
          return patterns.some(a => a.test(hostname)) && !url.searchParams.has("playlist");
        } catch (_) { return false; }
      },
      youtube: url => {
        if (!url) return null;
        const patterns = [
          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
          /youtu\.be\/([a-zA-Z0-9_-]{11})/
        ];
        for (let pat of patterns) {
          if (pat.test(url)) return url.match(pat)[1];
        }
        return null;
      },
      request: async (endpoint, data = {}, method = 'post') => {
        try {
          const endpointsArray = Object.values(ogmp3.api.endpoints);
          const selected = endpointsArray[Math.floor(Math.random() * endpointsArray.length)];
          const finalEndpoint = endpoint.startsWith('http') ? endpoint : `${selected}${endpoint}`;
          const randomIP = ogmp3.utils.generateRandomIP();
          const headers = { ...ogmp3.headers, 'X-Forwarded-For': randomIP };
          const { data: response } = await axios({
            method,
            url: finalEndpoint,
            data: method === 'post' ? data : undefined,
            headers: headers
          });
          return { status: true, dl: response };
        } catch (error) {
          return { status: false, dl: error.message };
        }
      },
      async checkStatus(id) {
        try {
          const c = this.utils.hash();
          const d = this.utils.hash();
          const endpoint = `/${c}/status/${this.utils.encoded(id)}/${d}/`;
          const response = await this.request(endpoint, { data: id });
          return response;
        } catch (error) {
          return { status: false, dl: error.message };
        }
      },
      async checkProgress(data) {
        try {
          let attempts = 0, maxAttempts = 300;
          while (attempts < maxAttempts) {
            attempts++;
            const res = await this.checkStatus(data.i);
            if (!res.status) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
            const stat = res.dl;
            if (stat.s === "C") return stat;
            if (stat.s === "P") {
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
            return null;
          }
          return null;
        } catch (error) {
          return null;
        }
      },
      download: async (link, format, type = 'video') => {
        if (!link) return { status: false, dl: "¿Qué quieres descargar? No has ingresado el enlace 🗿" };
        if (!ogmp3.isUrl(link)) return { status: false, dl: "El enlace que ingresaste no es válido. ¡Corrige eso! 🗿" };
        if (type !== 'video' && type !== 'audio') return { status: false, dl: "Solo hay dos tipos disponibles: 'video' y 'audio'. ¡Elige uno!" };
        if (!format) format = type === 'audio' ? ogmp3.default_fmt.audio : ogmp3.default_fmt.video;
        const validFormats = type === 'audio' ? ogmp3.formats.audio : ogmp3.formats.video;
        if (!validFormats.includes(format)) {
          return { status: false, dl: `El formato ${format} no es válido para ${type}. Puedes elegir uno de estos: ${validFormats.join(', ')}` };
        }
        const id = ogmp3.youtube(link);
        if (!id) return { status: false, dl: "No se pudo extraer el ID. El enlace no es válido." };
        try {
          let retries = 0, maxRetries = 20;
          while (retries < maxRetries) {
            retries++;
            const c = ogmp3.utils.hash();
            const d = ogmp3.utils.hash();
            const reqPayload = {
              data: ogmp3.utils.encoded(link),
              format: type === 'audio' ? "0" : "1",
              referer: "https://ogmp3.cc",
              mp3Quality: type === 'audio' ? format : null,
              mp4Quality: type === 'video' ? format : null,
              userTimeZone: new Date().getTimezoneOffset().toString()
            };
            const resx = await ogmp3.request(`/${c}/init/${ogmp3.utils.enc_url(link)}/${d}/`, reqPayload);
            if (!resx.status) { if (retries === maxRetries) return resx; continue; }
            const dataResp = resx.dl;
            if (dataResp.le) {
              return { status: false, dl: "La duración del video es demasiado larga. El máximo es 3 horas. ¡No puedes exceder eso!" };
            }
            if (dataResp.i === "blacklisted") {
              const limit = ogmp3.restrictedTimezones.has(new Date().getTimezoneOffset().toString()) ? 5 : 100;
              return { status: false, dl: `Se agotó el límite de descargas diarias (${limit}). Intenta más tarde.` };
            }
            if (dataResp.e || dataResp.i === "invalid") {
              return { status: false, dl: "El video no está disponible. Puede haber sido eliminado o restringido por YouTube." };
            }
            if (dataResp.s === "C") {
              return {
                status: true,
                dl: {
                  title: dataResp.t || "Desconocido",
                  type,
                  format,
                  thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
                  download: `${ogmp3.api.base}/${ogmp3.utils.hash()}/download/${ogmp3.utils.encoded(dataResp.i)}/${ogmp3.utils.hash()}/`,
                  id,
                  quality: format
                }
              };
            }
            const prod = await ogmp3.checkProgress(dataResp);
            if (prod && prod.s === "C") {
              return {
                status: true,
                dl: {
                  title: prod.t || "Desconocido",
                  type,
                  format,
                  thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
                  download: `${ogmp3.api.base}/${ogmp3.utils.hash()}/download/${ogmp3.utils.encoded(prod.i)}/${ogmp3.utils.hash()}/`,
                  id,
                  quality: format
                }
              };
            }
          }
          return { status: false, dl: "He intentado varias veces, pero sigue fallando. ¡Intenta de nuevo más tarde!" };
        } catch (error) {
          return { status: false, dl: error.message };
        }
      }
    };
    return await ogmp3.download(u, f, type);
  }

  let result = await a();
  if (result.status) return { status: true, creador: "EliasarYT", dl: result.dl };
  result = await b();
  if (result.status) return { status: true, creador: "EliasarYT", dl: result.dl };
  result = await c();
  if (result.status) return { status: true, creador: "EliasarYT", dl: result.dl };
  result = await d();
  if (result.status) return { status: true, creador: "EliasarYT", dl: result.dl };
  return { status: false, creador: "EliasarYT", dl: "Todos fallaron." };
};

module.exports = ytdl;