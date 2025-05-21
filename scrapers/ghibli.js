const axios = require('axios');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const UserAgent = require('user-agents');

const randomAcceptLanguage = () => {
  const langs = ["en-US,en;q=0.9", "es-ES,es;q=0.9", "fr-FR,fr;q=0.9", "de-DE,de;q=0.9", "it-IT,it;q=0.9"];
  return langs[Math.floor(Math.random() * langs.length)];
};

const ghibliGenerator = {
  api: {
    base: 'https://ghibli-image-generator.com',
    imageBase: 'https://imgs.ghibli-image-generator.com',
    endpoints: {
      fileExists: '/api/trpc/uploads.chatFileExists?batch=1',
      signed: '/api/trpc/uploads.signedUploadUrl?batch=1',
      create: '/api/trpc/ai.create4oImage?batch=1',
      task: '/api/trpc/ai.getTaskInfo?batch=1'
    }
  },
  defaults: {
    prompt: "restyle image in studio ghibli style, keep all details",
    mime: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    fmt: ['jpg', 'jpeg', 'png', 'webp'],
    size: {
      "1:1": "Square - 1:1",
      "3:2": "Landscape - 3:2",
      "2:3": "Portrait - 2:3"
    }
  },
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://ghibli-image-generator.com',
    'referer': 'https://ghibli-image-generator.com/'
  },
  axiosInstance: axios.create({
    timeout: 30000,
    validateStatus: status => status >= 200 && status < 300,
    withCredentials: false
  }),
  initInterceptors() {
    this.axiosInstance.interceptors.request.use(config => {
      config.headers = {
        ...this.headers,
        'User-Agent': new UserAgent().toString(),
        'X-Forwarded-For': `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        'Accept-Language': randomAcceptLanguage(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      if (config.headers.Cookie) delete config.headers.Cookie;
      return config;
    });
  },
  isImage: (input) => {
    if (!input || input.trim() === '') return { valid: false, error: "Input vacío" };
    try {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        new URL(input);
        const ext = input.split('.').pop().toLowerCase();
        if (!ghibliGenerator.defaults.fmt.includes(ext)) return { valid: false, error: "Formato no soportado", format: ext };
        return { valid: true, isUrl: true };
      }
      if (!fs.existsSync(input)) return { valid: false, error: "Archivo no encontrado", path: input };
      const ext = path.extname(input).toLowerCase().replace('.', '');
      if (!ghibliGenerator.defaults.fmt.includes(ext)) return { valid: false, error: "Formato no soportado", format: ext };
      const stats = fs.statSync(input);
      if (stats.size === 0) return { valid: false, error: "Archivo vacío", path: input };
      return { valid: true, isUrl: false };
    } catch {
      return { valid: false, error: "Input inválido", input };
    }
  },
  isSize: (size) => {
    if (!size) return true;
    if (!ghibliGenerator.defaults.size[size]) return { valid: false, error: "Tamaño inválido" };
    return true;
  },
  images: async (url) => {
    try {
      const response = await ghibliGenerator.axiosInstance.get(url, { responseType: 'arraybuffer', timeout: 30000 });
      const ext = url.split('.').pop().toLowerCase();
      const file = {
        buffer: response.data,
        type: `image/${ext}`,
        name: `image_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      };
      return file.buffer.length > 0 ? { status: true, file, mime: file.type } : { status: false, error: "Archivo vacío" };
    } catch (error) {
      return { status: false, error: error.message, details: error.response?.data || null };
    }
  },
  process: async (imageUrl, options = {}) => {
    try {
      const response = await ghibliGenerator.axiosInstance.post(
        `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.create}`,
        { "0": { "json": { imageUrl, prompt: options.prompt || ghibliGenerator.defaults.prompt, size: options.size || "1:1" } } }
      );
      const taskId = response.data[0]?.result?.data?.json?.data?.taskId;
      return taskId ? { status: true, result: { taskId } } : { status: false, result: { error: "Sin Task ID" } };
    } catch (error) {
      return { status: false, result: { error: error.message, details: error.response?.data || null } };
    }
  },
  wftc: async (taskId) => {
    let attempts = 0;
    while (attempts < 30) {
      try {
        const response = await ghibliGenerator.axiosInstance.get(
          `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.task}`,
          { params: { input: JSON.stringify({ "0": { "json": { "taskId": taskId } } }) } }
        );
        const data = response.data[0]?.result?.data?.json?.data;
        if (data.status === 'SUCCESS' && data.successFlag === 1) return { status: true, code: 200, result: { url: data.response.resultUrls[0], taskId } };
        if (['GENERATE_FAILED', 'FAILED'].includes(data.status)) return { status: false, code: 500, result: { error: "Error en la generación" } };
        if (data.status === 'GENERATING') { await new Promise(resolve => setTimeout(resolve, 5000)); attempts++; continue; }
      } catch (error) {
        if (attempts >= 29) return { status: false, code: 408, result: { error: error.message, details: error.response?.data || null } };
        await new Promise(resolve => setTimeout(resolve, 2000)); attempts++;
      }
    }
  },
  generate: async (input, options = {}) => {
    const inputx = ghibliGenerator.isImage(input);
    if (!inputx.valid) return { status: false, code: 400, result: inputx };
    if (options.size) {
      const sizex = ghibliGenerator.isSize(options.size);
      if (sizex !== true) return { status: false, code: 400, result: sizex };
    }
    try {
      let file;
      if (inputx.isUrl) {
        const dl = await ghibliGenerator.images(input);
        if (!dl.status) return { status: false, code: 400, result: dl };
        file = dl.file;
      } else {
        const fileData = fs.readFileSync(input);
        const ext = path.extname(input).toLowerCase().replace('.', '');
        file = { buffer: fileData, type: `image/${ext}`, name: `image_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}` };
      }
      const hashx = `original/${CryptoJS.SHA256(file.buffer.toString('base64')).toString()}_${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const uploadx = await ghibliGenerator.axiosInstance.post(
        `${ghibliGenerator.api.base}${ghibliGenerator.api.endpoints.signed}`,
        { "0": { "json": { "path": hashx, "bucket": "ghibli-image-generator" } } }
      ).then(res => res.data[0]?.result?.data?.json);
      if (!uploadx) throw new Error("Error en la subida");
      await ghibliGenerator.axiosInstance.put(uploadx, file.buffer, { headers: { 'Content-Type': file.type } });
      const imageUrl = `${ghibliGenerator.api.imageBase}/${hashx}`;
      const res = await ghibliGenerator.process(imageUrl, options);
      return res.status ? await ghibliGenerator.wftc(res.result.taskId) : { status: false, code: 500, result: { error: "Error al procesar imagen" } };
    } catch (error) {
      return { status: false, code: error.response?.status || 500, result: { error: error.message, details: error.response?.data || null } };
    }
  }
};

ghibliGenerator.initInterceptors();
module.exports = { ghibliGenerator };