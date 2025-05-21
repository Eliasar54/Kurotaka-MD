const chalk = require('chalk')
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const UserAgent = require('user-agents');
const cheerio = require('cheerio');
const path = require('path');
const FormData = require('form-data');
const ytdown = {  
api: {  
base: "https://p.oceansaver.in/ajax/",  
progress: "https://p.oceansaver.in/ajax/progress.php"  
},  
formats: ['360', '480', '720', '1080', '1440', '2160', 'mp3', 'm4a', 'wav', 'aac', 'flac', 'opus', 'ogg'],  

generarIP: () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,  

headers: () => ({  
'authority': 'p.oceansaver.in',  
'origin': 'https://y2down.cc',  
'referer': 'https://y2down.cc/',  
'user-agent': new UserAgent().toString(),  
'x-forwarded-for': ytdown.generarIP()  
}),  

isUrl: (str) => {  
try {  
new URL(str);  
return true;  
} catch (_) {  
return false;  
}  
},  

youtube: (url) => {  
if (!url) return null;  
const patterns = [  
/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,  
/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,  
/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,  
/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,  
/youtu\.be\/([a-zA-Z0-9_-]{11})/  
];  
for (let pattern of patterns) {  
if (pattern.test(url)) return url.match(pattern)[1];  
}  
return null;  
},  

request: async (endpoint, params = {}) => {  
try {  
const { data } = await axios.get(`${ytdown.api.base}${endpoint}`, {  
params,  
headers: ytdown.headers(),  
withCredentials: true  
});  
return data;  
} catch (error) {  
return {  
status: true,  
creator: "EliasarYT",  
error: `❌ ${error.message}`,  
details: error.response?.data || "No hay detalles adicionales."  
};  
}  
},  

download: async (link, format) => {  
if (!link) return { status: true, creator: "EliasarYT", error: "📌 Falta el enlace. Ingresa un link de YouTube para descargar. 🎥" };  
if (!ytdown.isUrl(link)) return { status: true, creator: "EliasarYT", error: "⚠️ El enlace ingresado no es válido. Asegúrate de que sea un link de YouTube. 🔗" };  
if (!format || !ytdown.formats.includes(format)) {  
return {  
status: true,  
creator: "EliasarYT",  
error: "🎵 Formato no disponible. Escoge uno de los formatos soportados.",  
availableFormats: ytdown.formats  
};  
}  

const id = ytdown.youtube(link);  
if (!id) return { status: true, creator: "EliasarYT", error: "🤔 No se pudo extraer el ID del video. Verifica que el enlace sea correcto." };  

try {  
const response = await ytdown.request("download.php", { format, url: `https://www.youtube.com/watch?v=${id}` });  
return ytdown.handler(response, format, id);  
} catch (error) {  
return { status: true, creator: "EliasarYT", error: `❌ ${error.message}`, details: error.response?.data || "No hay detalles adicionales." };  
}  
},  

handler: async (data, format, id) => {  
if (!data.success) return { status: true, creator: "EliasarYT", error: `⚠️ ${data.message || "Ocurrió un error en la solicitud."}` };  
if (!data.id) return { status: true, creator: "EliasarYT", error: "🚫 No se obtuvo un ID de descarga válido. Inténtalo nuevamente." };  

try {  
const progress = await ytdown.checkProgress(data.id);  
return progress.success ? ytdown.final(data, progress, format, id) : progress;  
} catch (error) {  
return { status: true, creator: "EliasarYT", error: `❌ ${error.message}` };  
}  
},  

checkProgress: async (id) => {  
let attempts = 0;  

while (attempts < 100) {  
try {  
const { data } = await axios.get(ytdown.api.progress, {  
params: { id },  
headers: ytdown.headers(),  
withCredentials: true  
});  

if (data.download_url && data.success) {  
return { success: true, ...data };  
} else if (!data.download_url && data.success) {  
return { status: true, creator: "EliasarYT", error: `⚠️ ${data.text}` };  
}  

await new Promise(resolve => setTimeout(resolve, 1000));  
attempts++;  
} catch (error) {  
attempts++;  
await new Promise(resolve => setTimeout(resolve, 1000));  
}  
}  

return { status: true, creator: "EliasarYT", error: "⏳ Tiempo de espera agotado en la descarga. Inténtalo de nuevo más tarde." };  
},  

final: (init, progress, format, id) => ({  
status: true,  
creator: "EliasarYT",  
title: init.title || "Desconocido 🤷‍♂️",  
type: ['360', '480', '720', '1080', '1440', '2160'].includes(format) ? '📹 Video' : '🎵 Audio',  
format,  
thumbnail: init.info?.image || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,  
download: progress.download_url || "❌ No se pudo obtener el enlace de descarga.",  
id  
})  
};

const API_KEY = 'ac264bb12446e44e2106125f05b5d364';

async function uploadImage(imagePath, expiration = 0) {
try {
const image = fs.readFileSync(imagePath);
const base64Image = image.toString('base64');

const formData = new URLSearchParams();
formData.append('key', API_KEY);
formData.append('image', base64Image);
if (expiration) formData.append('expiration', expiration);

const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
headers: {
'Content-Type': 'application/x-www-form-urlencoded',
},
});

if (response.data.success) {
return response.data.data.url;
} else {
throw new Error('Error al subir la imagen: ' + response.data.error.message);
}
} catch (error) {
console.error('Error al subir la imagen:', error);
throw error;
}
}

const generarIP = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

const savetube = {
api: {
base: "https://media.savetube.me/api",
cdn: "/random-cdn",
info: "/v2/info",
download: "/download"
},
headers: {
'accept': '*/*',
'content-type': 'application/json',
'origin': 'https://yt.savetube.me',
'referer': 'https://yt.savetube.me/',
'user-agent': new UserAgent().toString(),
'x-forwarded-for': generarIP()
},
formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],

crypto: {
hexToBuffer: (hexString) => {
const matches = hexString.match(/.{1,2}/g);
return Buffer.from(matches.join(''), 'hex');
},

decrypt: async (enc) => {
try {
const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
const data = Buffer.from(enc, 'base64');
const iv = data.slice(0, 16);
const content = data.slice(16);
const key = savetube.crypto.hexToBuffer(secretKey);

const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
let decrypted = decipher.update(content);
decrypted = Buffer.concat([decrypted, decipher.final()]);

return JSON.parse(decrypted.toString());
} catch (error) {
throw new Error(`Error al desencriptar: ${error.message}`);
}
}
},

isUrl: (str) => { 
try { 
new URL(str); 
return true; 
} catch (_) { 
return false; 
} 
},

youtube: (url) => {
if (!url) return null;
const patterns = [
/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
/youtu\.be\/([a-zA-Z0-9_-]{11})/
];
for (let pattern of patterns) {
if (pattern.test(url)) return url.match(pattern)[1];
}
return null;
},

request: async (endpoint, data = {}, method = 'post') => {
try {
const { data: response } = await axios({
method,
url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
data: method === 'post' ? data : undefined,
params: method === 'get' ? data : undefined,
headers: savetube.headers
});
return {
status: true,
creador: "EliasarYT",
code: 200,
response: response
};
} catch (error) {
return {
status: false,
creador: "EliasarYT",
code: error.response?.status || 500,
error: `Error en la solicitud: ${error.message}`
};
}
},

getCDN: async () => {
const response = await savetube.request(savetube.api.cdn, {}, 'get');
if (!response.status) return response;
return {
status: true,
creador: "EliasarYT",
code: 200,
response: response.response.cdn
};
},

download: async (link, format) => {
if (!link) {
return {
status: false,
creador: "EliasarYT",
code: 400,
error: "Por favor, proporciona un enlace para descargar."
};
}

if (!savetube.isUrl(link)) {
return {
status: false,
creador: "EliasarYT",
code: 400,
error: "El enlace proporcionado no es válido. Asegúrate de que es un enlace de YouTube."
};
}

if (!format || !savetube.formats.includes(format)) {
return {
status: false,
creador: "EliasarYT",
code: 400,
error: "Formato no válido. Usa uno de los formatos disponibles.",
formatos_disponibles: savetube.formats
};
}

const id = savetube.youtube(link);
if (!id) {
return {
status: false,
creador: "EliasarYT",
code: 400,
error: "No se pudo extraer el ID del video. Verifica el enlace de YouTube."
};
}

try {
const cdnx = await savetube.getCDN();
if (!cdnx.status) return cdnx;
const cdn = cdnx.response;

const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
url: `https://www.youtube.com/watch?v=${id}`
});
if (!result.status) return result;

const decrypted = await savetube.crypto.decrypt(result.response.data);

const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
id: id,
downloadType: format === 'mp3' ? 'audio' : 'video',
quality: format,
key: decrypted.key
});

return {
status: true,
creador: "EliasarYT",
code: 200,
response: {
titulo: decrypted.title || "Desconocido",
tipo: format === 'mp3' ? 'audio' : 'video',
formato: format,
miniatura: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
descarga: dl.response.data.downloadUrl,
id: id,
clave: decrypted.key,
duracion: decrypted.duration,
calidad: format,
descargado: dl.response.data.downloaded || false
}
};

} catch (error) {
return {
status: false,
creador: "EliasarYT",
code: 500,
error: `Error durante la descarga: ${error.message}`
};
}
}
};
const pinterest = {
api: {
base: "https://www.pinterest.com",
endpoints: {
search: "/resource/BaseSearchResource/get/",
pin: "/resource/PinResource/get/",
user: "/resource/UserResource/get/"
}
},
headers: {
accept: "application/json, text/javascript, */*, q=0.01",
referer: "https://www.pinterest.com/",
"user-agent": "Postify/1.0.0",
"x-app-version": "a9522f",
"x-pinterest-appstate": "active",
"x-pinterest-pws-handler": "www/[username]/[slug].js",
"x-pinterest-source-url": "/search/pins/?rs=typed&q=kucing%20anggora/",
"x-requested-with": "XMLHttpRequest"
},
isUrl: (str) => {
try {
new URL(str);
return true;
} catch (_) {
return false;
}
},
isPin: (url) => {
if (!url) return false;
const patterns = [
/^https?:\/\/(?:www\.)?pinterest\.com\/pin\/[\w.-]+/,
/^https?:\/\/(?:www\.)?pinterest\.[\w.]+\/pin\/[\w.-]+/,
/^https?:\/\/(?:www\.)?pinterest\.(?:ca|co\.uk|com\.au|de|fr|id|es|mx|br|pt|jp|kr|nz|ru|at|be|ch|cl|dk|fi|gr|ie|nl|no|pl|pt|se|th|tr)\/pin\/[\w.-]+/,
/^https?:\/\/pin\.it\/[\w.-]+/,
/^https?:\/\/(?:www\.)?pinterest\.com\/amp\/pin\/[\w.-]+/,
/^https?:\/\/(?:[a-z]{2}|www)\.pinterest\.com\/pin\/[\w.-]+/,
/^https?:\/\/(?:www\.)?pinterest\.com\/pin\/[\d]+(?:\/)?$/,
/^https?:\/\/(?:www\.)?pinterest\.[\w.]+\/pin\/[\d]+(?:\/)?$/,
/^https?:\/\/(?:www\.)?pinterestcn\.com\/pin\/[\w.-]+/,
/^https?:\/\/(?:www\.)?pinterest\.com\.[\w.]+\/pin\/[\w.-]+/
];
const clean = url.trim().toLowerCase();
return patterns.some(pattern => pattern.test(clean));
},
getCookies: async () => {
try {
const response = await axios.get(pinterest.api.base);
const setHeaders = response.headers['set-cookie'];
if (setHeaders) {
const cookies = setHeaders.map(cookieString => {
const cp = cookieString.split(';');
const cv = cp[0].trim();
return cv;
});
return cookies.join('; ');
}
return null;
} catch (error) {
console.error(error);
return null;
}
},
search: async (query, limit = 10) => {
if (!query) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "No query provided. Please enter a valid query."
}
};
}
try {
const cookies = await pinterest.getCookies();
if (!cookies) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "Failed to retrieve cookies. Please try again later."
}
};
}
const params = {
source_url: `/search/pins/?q=${query}`,
data: JSON.stringify({
options: {
isPrefetch: false,
query: query,
scope: "pins",
bookmarks: [""],
no_fetch_context_on_resource: false,
page_size: limit
},
context: {}
}),
_: Date.now()
};
const { data } = await axios.get(`${pinterest.api.base}${pinterest.api.endpoints.search}`, {
headers: { ...pinterest.headers, cookie: cookies },
params: params
});
const container = [];
const results = data.resource_response.data.results.filter((v) => v.images?.orig);
results.forEach((result) => {
container.push({
id: result.id,
title: result.title || "",
description: result.description,
pin_url: `https://pinterest.com/pin/${result.id}`,
media: {
images: {
orig: result.images.orig,
small: result.images['236x'],
medium: result.images['474x'],
large: result.images['736x']
},
video: result.videos ? {
video_list: result.videos.video_list,
duration: result.videos.duration,
video_url: result.videos.video_url
} : null
},
uploader: {
username: result.pinner.username,
full_name: result.pinner.full_name,
profile_url: `https://pinterest.com/${result.pinner.username}`
}
});
});
if (container.length === 0) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: `No results found for "${query}". Please try a different search term.`
}
};
}
return {
status: true,
code: 200,
creador: "EliasarYT",
response: {
query: query,
total: container.length,
pins: container
}
};
} catch (error) {
return {
status: true,
code: error.response?.status || 500,
creador: "EliasarYT",
response: {
message: "The server is currently unavailable. Please try again later."
}
};
}
},
download: async (pinUrl) => {
if (!pinUrl) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "No URL provided. Please provide a valid Pinterest link."
}
};
}
if (!pinterest.isUrl(pinUrl)) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "Invalid URL. Please provide a proper URL."
}
};
}
if (!pinterest.isPin(pinUrl)) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "The provided URL is not a valid Pinterest pin link."
}
};
}
try {
const pinId = pinUrl.split('/pin/')[1].replace('/', '');
const cookies = await pinterest.getCookies();
if (!cookies) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "Failed to retrieve cookies. Please try again later."
}
};
}
const params = {
source_url: `/pin/${pinId}/`,
data: JSON.stringify({
options: {
field_set_key: "detailed",
id: pinId
},
context: {}
}),
_: Date.now()
};
const { data } = await axios.get(`${pinterest.api.base}${pinterest.api.endpoints.pin}`, {
headers: { ...pinterest.headers, cookie: cookies },
params: params
});
if (!data.resource_response.data) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: "The requested pin does not exist or has been removed."
}
};
}
const pd = data.resource_response.data;
const mediaUrls = [];
if (pd.videos) {
const videoFormats = Object.values(pd.videos.video_list).sort((a, b) => b.width - a.width);
videoFormats.forEach(video => {
mediaUrls.push({
type: 'video',
quality: `${video.width}x${video.height}`,
width: video.width,
height: video.height,
duration: pd.videos.duration || null,
url: video.url,
file_size: video.file_size || null,
thumbnail: pd.images.orig.url
});
});
}
if (pd.images) {
const imge = {
original: pd.images.orig,
large: pd.images['736x'],
medium: pd.images['474x'],
small: pd.images['236x'],
thumbnail: pd.images['170x']
};
Object.entries(imge).forEach(([quality, image]) => {
if (image) {
mediaUrls.push({
type: 'image',
quality: quality,
width: image.width,
height: image.height,
url: image.url,
size: `${image.width}x${image.height}`
});
}
});
}
if (mediaUrls.length === 0) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: "No media found for this pin. Please try a different pin."
}
};
}
return {
status: true,
code: 200,
creador: "EliasarYT",
response: {
id: pd.id,
title: pd.title || pd.grid_title || "",
description: pd.description || "",
created_at: pd.created_at,
dominant_color: pd.dominant_color || null,
link: pd.link || null,
category: pd.category || null,
media_urls: mediaUrls,
statistics: {
saves: pd.repin_count || 0,
comments: pd.comment_count || 0,
reactions: pd.reaction_counts || {},
total_reactions: pd.total_reaction_count || 0,
views: pd.view_count || 0,
saves_by_category: pd.aggregated_pin_data?.aggregated_stats || {}
},
source: {
name: pd.domain || null,
url: pd.link || null,
favicon: pd.favicon_url || null,
provider: pd.provider_name || null,
rating: pd.embed?.src_rating || null
},
board: {
id: pd.board?.id || null,
name: pd.board?.name || null,
url: pd.board?.url ? `https://pinterest.com${pd.board.url}` : null,
owner: {
id: pd.board?.owner?.id || null,
username: pd.board?.owner?.username || null
}
},
uploader: {
id: pd.pinner?.id || null,
username: pd.pinner?.username || null,
full_name: pd.pinner?.full_name || null,
profile_url: pd.pinner?.username ? `https://pinterest.com/${pd.pinner.username}` : null,
image: {
small: pd.pinner?.image_small_url || null,
medium: pd.pinner?.image_medium_url || null,
large: pd.pinner?.image_large_url || null,
original: pd.pinner?.image_xlarge_url || null
},
type: pd.pinner?.type || "user",
is_verified: pd.pinner?.verified_identity || false
},
metadata: {
article: pd.article || null,
product: {
price: pd.price_value || null,
currency: pd.price_currency || null,
availability: pd.shopping_flags || null,
ratings: pd.rating || null,
reviews_count: pd.review_count || null
},
recipe: pd.recipe || null,
video: pd.videos ? {
duration: pd.videos.duration || null,
views: pd.videos.video_view_count || null,
cover: pd.videos.cover_image_url || null
} : null
},
is_promoted: pd.is_promoted || false,
is_downloadable: pd.is_downloadable || true,
is_playable: pd.is_playable || false,
is_repin: pd.is_repin || false,
is_video: pd.is_video || false,
has_required_attribution: pd.attribution || null,
privacy_level: pd.privacy || "public",
tags: pd.pin_join?.annotations || [],
hashtags: pd.hashtags || [],
did_it_data: pd.did_it_data || null,
native_creator: pd.native_creator || null,
sponsor: pd.sponsor || null,
visual_search_objects: pd.visual_search_objects || []
}
};
} catch (error) {
if (error.response?.status === 404) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: "The requested pin does not exist or has been removed."
}
};
}
return {
status: true,
code: error.response?.status || 500,
creador: "EliasarYT",
response: {
message: "The server encountered an error. Please try again later."
}
};
}
},
profile: async (username) => {
if (!username) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "No username provided. Please enter a valid username."
}
};
}
try {
const cookies = await pinterest.getCookies();
if (!cookies) {
return {
status: true,
code: 400,
creador: "EliasarYT",
response: {
message: "Failed to retrieve cookies. Please try again later."
}
};
}
const params = {
source_url: `/${username}/`,
data: JSON.stringify({
options: {
username: username,
field_set_key: "profile",
isPrefetch: false
},
context: {}
}),
_: Date.now()
};
const { data } = await axios.get(`${pinterest.api.base}${pinterest.api.endpoints.user}`, {
headers: { ...pinterest.headers, cookie: cookies },
params: params
});
if (!data.resource_response.data) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: "User not found. Please check the username and try again."
}
};
}
const userx = data.resource_response.data;
return {
status: true,
code: 200,
creador: "EliasarYT",
response: {
id: userx.id,
username: userx.username,
full_name: userx.full_name || "",
bio: userx.about || "",
email: userx.email || null,
type: userx.type || "user",
profile_url: `https://pinterest.com/${userx.username}`,
image: {
small: userx.image_small_url || null,
medium: userx.image_medium_url || null,
large: userx.image_large_url || null,
original: userx.image_xlarge_url || null
},
stats: {
pins: userx.pin_count || 0,
followers: userx.follower_count || 0,
following: userx.following_count || 0,
boards: userx.board_count || 0,
likes: userx.like_count || 0,
saves: userx.save_count || 0
},
website: userx.website_url || null,
domain_url: userx.domain_url || null,
domain_verified: userx.domain_verified || false,
explicitly_followed_by_me: userx.explicitly_followed_by_me || false,
implicitly_followed_by_me: userx.implicitly_followed_by_me || false,
location: userx.location || null,
country: userx.country || null,
is_verified: userx.verified_identity || false,
is_partner: userx.is_partner || false,
is_indexed: userx.indexed || false,
is_tastemaker: userx.is_tastemaker || false,
is_employee: userx.is_employee || false,
is_blocked: userx.blocked_by_me || false,
meta: {
first_name: userx.first_name || null,
last_name: userx.last_name || null,
full_name: userx.full_name || "",
locale: userx.locale || null,
gender: userx.gender || null,
partner: {
is_partner: userx.is_partner || false,
partner_type: userx.partner_type || null
}
},
account_type: userx.account_type || null,
personalize_pins: userx.personalize || false,
connected_to_etsy: userx.connected_to_etsy || false,
has_password: userx.has_password || true,
has_mfa: userx.has_mfa || false,
created_at: userx.created_at || null,
last_login: userx.last_login || null,
social_links: {
twitter: userx.twitter_url || null,
facebook: userx.facebook_url || null,
instagram: userx.instagram_url || null,
youtube: userx.youtube_url || null,
etsy: userx.etsy_url || null
},
custom_gender: userx.custom_gender || null,
pronouns: userx.pronouns || null,
board_classifications: userx.board_classifications || {},
interests: userx.interests || []
}
};
} catch (error) {
if (error.response?.status === 404) {
return {
status: true,
code: 404,
creador: "EliasarYT",
response: {
message: "Invalid username. Please enter a valid username."
}
};
}
return {
status: true,
code: error.response?.status || 500,
creador: "EliasarYT",
response: {
message: "The server encountered an error. Please try again later."
}
};
}
}
};
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
crypto.getRandomValues(array);
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
const b = [/^(.+\.)?youtube\.com$/, /^(.+\.)?youtube-nocookie\.com$/, /^youtu\.be$/];
return b.some(a => a.test(hostname)) && !url.searchParams.has("playlist");
} catch (_) {
return false;
}
},

youtube: url => {
if (!url) return null;
const b = [
/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
/youtu\.be\/([a-zA-Z0-9_-]{11})/
];
for (let a of b) {
if (a.test(url)) return url.match(a)[1];
}
return null;
},

request: async (endpoint, data = {}, method = 'post') => {
try {
const ae = Object.values(ogmp3.api.endpoints);
const be = ae[Math.floor(Math.random() * ae.length)];

const fe = endpoint.startsWith('http') ? endpoint : `${be}${endpoint}`;

const randomIP = ogmp3.utils.generateRandomIP();
const headers = {
...ogmp3.headers,
'X-Forwarded-For': randomIP
};

const { data: response } = await axios({
method,
url: fe,
data: method === 'post' ? data : undefined,
headers: headers
});

return {
status: true,
creador: "EliasarYT",
response: response
};
} catch (error) {
return {
status: false,
creador: "EliasarYT",
response: error.message
};
}
},

async checkStatus(id) {
try {
const c = this.utils.hash();
const d = this.utils.hash();
const endpoint = `/${c}/status/${this.utils.encoded(id)}/${d}/`;

const response = await this.request(endpoint, {
data: id
});

return response;
} catch (error) {
return {
status: false,
creador: "EliasarYT",
response: error.message
};
}
},

async checkProgress(data) {
try {
let attempts = 0;
let maxAttempts = 300;

while (attempts < maxAttempts) {
attempts++;

const res = await this.checkStatus(data.i);
if (!res.status) {
await new Promise(resolve => setTimeout(resolve, 2000));
continue;
}

const stat = res.response;
if (stat.s === "C") {
return stat;
}

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
if (!link) {
return {
status: false,
creador: "EliasarYT",
response: "¿Qué quieres descargar? No has ingresado el enlace 🗿"
};
}

if (!ogmp3.isUrl(link)) {
return {
status: false,
creador: "EliasarYT",
response: "El enlace que ingresaste no es válido. ¡Corrige eso! 🗿"
};
}

if (type !== 'video' && type !== 'audio') {
return {
status: false,
creador: "EliasarYT",
response: "Solo hay dos tipos disponibles: 'video' y 'audio'. ¡Elige uno! "
};
}

if (!format) {
format = type === 'audio' ? ogmp3.default_fmt.audio : ogmp3.default_fmt.video;
}

const valid_fmt = type === 'audio' ? ogmp3.formats.audio : ogmp3.formats.video;
if (!valid_fmt.includes(format)) {
return {
status: false,
creador: "EliasarYT",
response: `El formato ${format} no es válido para ${type}. Puedes elegir uno de estos: ${valid_fmt.join(', ')}`
};
}

const id = ogmp3.youtube(link);
if (!id) {
return {
status: false,
creador: "EliasarYT",
response: "No se pudo extraer el ID. El enlace no es válido."
};
}

try {
let retries = 0;
const maxRetries = 20;

while (retries < maxRetries) {
retries++;
const c = ogmp3.utils.hash();
const d = ogmp3.utils.hash();
const req = {
data: ogmp3.utils.encoded(link),
format: type === 'audio' ? "0" : "1",
referer: "https://ogmp3.cc",
mp3Quality: type === 'audio' ? format : null,
mp4Quality: type === 'video' ? format : null,
userTimeZone: new Date().getTimezoneOffset().toString()
};

const resx = await ogmp3.request(
`/${c}/init/${ogmp3.utils.enc_url(link)}/${d}/`,
req
);

if (!resx.status) {
if (retries === maxRetries) return resx;
continue;
}

const data = resx.response;
if (data.le) {
return {
status: false,
creador: "EliasarYT",
response: "La duración del video es demasiado larga. El máximo es 3 horas. ¡No puedes exceder eso!"
};
}

if (data.i === "blacklisted") {
const limit = ogmp3.restrictedTimezones.has(new Date().getTimezoneOffset().toString()) ? 5 : 100;
return {
status: false,
creador: "EliasarYT",
response: `Se agotó el límite de descargas diarias (${limit}). Intenta más tarde.`
};
}

if (data.e || data.i === "invalid") {
return {
status: false,
creador: "EliasarYT",
response: "El video no está disponible. Puede haber sido eliminado o restringido por YouTube."
};
}

if (data.s === "C") {
return {
status: true,
creador: "EliasarYT",
response: {
title: data.t || "Desconocido",
type: type,
format: format,
thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
download: `${ogmp3.api.base}/${ogmp3.utils.hash()}/download/${ogmp3.utils.encoded(data.i)}/${ogmp3.utils.hash()}/`,
id: id,
quality: format
}
};
}

const prod = await ogmp3.checkProgress(data);
if (prod && prod.s === "C") {
return {
status: true,
creador: "EliasarYT",
response: {
title: prod.t || "Desconocido",
type: type,
format: format,
thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
download: `${ogmp3.api.base}/${ogmp3.utils.hash()}/download/${ogmp3.utils.encoded(prod.i)}/${ogmp3.utils.hash()}/`,
id: id,
quality: format
}
};
}
}

return {
status: false,
creador: "EliasarYT",
response: "He intentado varias veces, pero sigue fallando. ¡Intenta de nuevo más tarde!"
};

} catch (error) {
return {
status: false,
creador: "EliasarYT",
response: error.message
};
}
}
};
async function quAx(filePath) {
try {
const file = fs.createReadStream(filePath);
const formData = new FormData();
formData.append('files[]', file, path.basename(filePath));

const response = await axios.post('https://qu.ax/upload.php', formData, {
headers: {
...formData.getHeaders()
}
});

if (response.data.success) {
const fileData = response.data.files[0];
return {
status: true,
creator: 'EliasarYT',
result: {
hash: fileData.hash,
name: fileData.name,
url: fileData.url,
size: fileData.size,
expiry: fileData.expiry
}
};
} else {
return { status: false, message: 'Error al subir el archivo' };
}
} catch (error) {
return { status: false, message: error.message };
}
}
const apiKey = 'AIzaSyAkX5OAdMBP8kBRSpo_LofyEQSZW5grRwU';
const apiUrl = 'https://www.googleapis.com/youtube/v3/';

function extractVideoId(url) {
const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/|.*\/vi\/|.*\/e\/|.*live\/|.*shorts\/|.*embed\/|.*watch\?v=))([^?&]+)/);
return match ? match[1] : null;
}

const ytinfo = {
async url(videoUrl) {
const videoId = extractVideoId(videoUrl);
if (!videoId) {
return { status: false, message: "Invalid URL or not a YouTube video." };
}

try {
const response = await axios.get(`${apiUrl}videos`, {
params: {
part: 'snippet,statistics,contentDetails',
id: videoId,
key: apiKey
}
});

if (!response.data.items.length) {
return { status: false, message: "Video not found." };
}

const video = response.data.items[0];
return {
status: true,
creator: "EliasarYT",
result: {
id: videoId,
title: video.snippet.title,
img: video.snippet.thumbnails.high.url,
description: video.snippet.description,
duration: video.contentDetails.duration,
published: video.snippet.publishedAt,
views: video.statistics.viewCount,
channel: video.snippet.channelTitle
}
};
} catch (error) {
return { status: false, message: "Error retrieving video data." };
}
}
};
const token = 'AIzaSyAkX5OAdMBP8kBRSpo_LofyEQSZW5grRwU';
const api = 'https://www.googleapis.com/youtube/v3/';

const ytsinfo = {
async search(query) {
try {
const response = await axios.get(`${api}search`, {
params: {
part: 'snippet',
q: query,
type: 'video',
key: token,
maxResults: 1
}
});

if (!response.data.items.length) {
return { status: false, message: "No se encontraron videos." };
}

const videoId = response.data.items[0].id.videoId;

const videoDetails = await axios.get(`${api}videos`, {
params: {
part: 'snippet,statistics,contentDetails',
id: videoId,
key: token
}
});

if (!videoDetails.data.items.length) {
return { status: false, message: "Video no encontrado." };
}

const video = videoDetails.data.items[0];

return {
status: true,
creator: "EliasarYT",
result: {
id: videoId,
title: video.snippet.title,
img: video.snippet.thumbnails.high.url,
description: video.snippet.description,
duration: video.contentDetails.duration,
published: video.snippet.publishedAt,
views: video.statistics.viewCount,
channel: video.snippet.channelTitle
}
};
} catch (error) {
return { status: false, message: "Error al buscar o recuperar el video." };
}
}
};
const nvlgroupdl = {
api: {
base: "https://ytdownloader.nvlgroup.my.id",
endpoints: {
signature: "/generate-signature",
audio: "/web/audio",
video: "/web/download"
}
},
headers: {
'Accept': 'application/json, text/plain, */*',
'User-Agent': 'Postify/1.0.0',
},
formats: {
video: ['2026', '1350', '1012', '676', '450', '338', '224', '136'],
audio: ['160', '128', '96', '64', '48']
},

async dl(url, type, resolution) {
const response = await axios.get(this.api.base + this.api.endpoints.signature, { headers: this.headers });
const { signature, timestamp } = response.data;
const encodedUrl = encodeURIComponent(url);
let downloadUrl;

if (type === 'mp4' || type === 'video') {
if (!this.formats.video.includes(resolution)) throw new Error('Resolución no válida');
downloadUrl = `${this.api.base}${this.api.endpoints.video}?url=${encodedUrl}&resolution=${resolution}&signature=${signature}&timestamp=${timestamp}`;
} else if (type === 'mp3' || type === 'audio') {
if (!this.formats.audio.includes(resolution)) throw new Error('Bitrate no válido');
downloadUrl = `${this.api.base}${this.api.endpoints.audio}?url=${encodedUrl}&bitrate=${resolution}&signature=${signature}&timestamp=${timestamp}`;
} else {
throw new Error('Tipo no válido');
}

return {
status: true,
creator: 'EliasarYT',
result: {
expires: timestamp + 3600,
dl: downloadUrl
}
};
}
};
async function infosp(url) {
if (!url) throw new Error("Ingresa una URL válida.");
const spotifyRegex = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
if (!spotifyRegex.test(url)) throw new Error("La URL debe ser de Spotify.");
let requestUrl = `https://fgsi1-restapi.hf.space/api/tools/bypasscf?url=${encodeURIComponent(url)}`;
try {
let response = await axios.get(requestUrl);
let apiResponse = JSON.parse(response.data.toString());

const result = {};
if (apiResponse.status && apiResponse.data.success) {
const markdown = apiResponse.data.data.markdown;

const titleMatch = markdown.match(/^# (.+)$/m);
if (titleMatch) result.title = titleMatch[1].trim();

const imageMatch = markdown.match(/!.*?(https?:\/\/[^\s)]+)/);
if (imageMatch) result.coverImage = imageMatch[1];

const albumMatch = markdown.match(/•(.+?).*?•(\d{4})•([\d:]+)•([\d,]+)/);
if (albumMatch) {
result.album = albumMatch[1].trim();
result.year = albumMatch[2].trim();
result.duration = albumMatch[3].trim();
result.playCount = albumMatch[4].trim();
}

const artistMatch = markdown.match(/Artist\s+([^]+)https?:\/\/open\.spotify\.com\/artist\/[^]+/i);
if (artistMatch) result.artist = artistMatch[1].trim();

} else {
result.error = "Error al obtener los datos desde la API.";
}

return { status: true, creador: "EliasarYT", result };
} catch (err) {
return { status: true, creador: "EliasarYT", result: { error: `Error en la solicitud: ${err.message}` } };
}
}
module.exports = { ytdown, ytinfo, ytsinfo, uploadImage, infosp, savetube, nvlgroupdl, quAx, pinterest, ogmp3 };

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
const fileName = path.basename(file)
console.log(chalk.greenBright.bold(`Update '${fileName}'.`))
delete require.cache[file]
require(file)
})