const { updateConfig, overrideConsole, restoreConsole, config } = require('./silencelog');
(async () => {
require("./settings")
const { default: makeWASocket, CONNECTING, PHONENUMBER_MCC, Browsers, makeInMemoryStore, useMultiFileAuthState, DisconnectReason, proto , jidNormalizedUser,WAMessageStubType, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, msgRetryCounterMap, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, getAggregateVotesInPollMessage } = require("@whiskeysockets/baileys")
const { state, saveCreds } = await useMultiFileAuthState('./sessions')
const chalk = require('chalk')
const figlet = require('figlet')
const moment = require('moment')
const fs = require('fs')
const yargs = require('yargs/yargs')
const { smsg, sleep, delay, getBuffer} = require('./libs/fuctions')
const _ = require('lodash')
const NodeCache = require('node-cache')
const os = require('os')
const { execSync } = require('child_process')
const util = require('util')
const pino = require('pino')
const Pino = require("pino")
const cfonts = require('cfonts') 
const { tmpdir } = require('os')
const { join } = require('path')
const PhoneNumber = require('awesome-phonenumber')
const readline = require("readline")
const { Boom } = require('@hapi/boom')
const { parsePhoneNumber } = require("libphonenumber-js")

const { readdirSync, statSync, unlinkSync } = require('fs')
const {say} = cfonts;
const color = (text, color) => {
return !color ? chalk.green(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text)
}
const path = require('path')
const tmpPath = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
}
//----------------[ BASE DE DATOS ]--------------------
var low
try {
low = require('lowdb')
} catch (e) {
low = require('./libs/database/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./libs/database/mongoDB')

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
/https?:\/\//.test(opts['db'] || '') ?
new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
new mongoDB(opts['db']) :
new JSONFile(`./database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
if (global.db.data !== null) return
global.db.READ = true
await global.db.read()
global.db.READ = false
global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
...(global.db.data || {})}
global.db.chain = _.chain(global.db.data)}
loadDatabase() //@aidenlogin

if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
}, 30 * 1000)

//--------------------[ ARCHIVO TMP ]-----------------------
function clearTmp() {
const tmp = [tmpdir(), join(__dirname, './tmp')];
const filename = [];
tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
return filename.map((file) => {
const stats = statSync(file);
if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) {
return unlinkSync(file); // 3 minutes
}
return false;
})}

if (!opts['test']) { 
if (global.db) { 
setInterval(async () => { 
if (global.db.data) await global.db.write(); 
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp'], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']))); 
}, 30 * 1000); 
}}
setInterval(async () => {
await clearTmp()
console.log(chalk.cyanBright(lenguaje['tmp']()))}, 180000)

//--------------------[ CONFIGURACIÓN ]-----------------------
const methodCodeQR = process.argv.includes("qr")
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const methodCode = !!phoneNumber || process.argv.includes("code")
const useMobile = process.argv.includes("--mobile")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetryCounterCache = new NodeCache() //para mensaje de reintento, "mensaje en espera"

//codigo adaptado por: https://github.com/GataNina-Li && https://github.com/elrebelde21
let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./sessions/creds.json`)) {
do {        
let lineM = '┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅'
opcion = await question(`┏${lineM}  
┋ ${chalk.blueBright('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┋ ${chalk.blueBright('┋')} ${chalk.blue.bgBlue.bold.cyan(lenguaje.console.text1)}
┋ ${chalk.blueBright('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}   
┋ ${chalk.blueBright('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┋ ${chalk.blueBright('┋')} ${chalk.green.bgMagenta.bold.yellow(lenguaje.console.text2)}
┋ ${chalk.blueBright('┋')} ${chalk.bold.redBright(lenguaje.console.text3)} ${chalk.greenBright(lenguaje.console.text4)}
┋ ${chalk.blueBright('┋')} ${chalk.bold.redBright(lenguaje.console.text5)} ${chalk.greenBright(lenguaje.console.text6)}
┋ ${chalk.blueBright('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┋ ${chalk.blueBright('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}     
┋ ${chalk.blueBright('┋')} ${chalk.italic.magenta(lenguaje.console.text7)}
┋ ${chalk.blueBright('┋')} ${chalk.italic.magenta(lenguaje.console.text8)}
┋ ${chalk.blueBright('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┗${lineM}\n${chalk.bold.magentaBright('---> ')}`)
if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`${lenguaje.console.text9(chalk)}`))
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./sessions/creds.json`))
}

//--------------------[ CONEXIÓNES ]-----------------------   
async function startBot() {
console.info = () => {}
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }), })
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
let { version, isLatest } = await fetchLatestBaileysVersion();   

const socketSettings = {
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
logger: pino({ level: 'silent' }),
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
mobile: MethodMobile, 
browser: opcion == '1' ? ['Support bot', 'Firefox', '112.0.0'] : methodCodeQR ? ['Support bot', 'Firefox', '112.0.0'] : ["Linux", "Firefox", "112.0.0"], 
//puede cambia el nombre "InfinityBot-MD" por el nombre del tu bot
//pd: no cambie la parte de ["Ubuntu", "Chrome", "20.0.04"] dejarlo asi como esta para evitar errores. 
msgRetry,
msgRetryCache,
version,
syncFullHistory: true,
getMessage: async (key) => {
if (store) { 
const msg = await store.loadMessage(key.remoteJid, key.id); 
return sock.chats[key.remoteJid] && sock.chats[key.remoteJid].messages[key.id] ? sock.chats[key.remoteJid].messages[key.id].message : undefined; 
} 
return proto.Message.fromObject({}); 
}}

const sock = makeWASocket(socketSettings)

if (!fs.existsSync(`./sessions/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!sock.authState.creds.registered) {  
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
if (!Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
console.log(chalk.bgBlack(chalk.bold.redBright(lenguaje.console.text10))) 
process.exit(0)
}} else {
while (true) {
addNumber = await question(chalk.bgBlack(chalk.bold.greenBright(lenguaje.console.text11)))
addNumber = addNumber.replace(/[^0-9]/g, '')

if (addNumber.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
break 
} else {
console.log(chalk.bold.redBright(lenguaje.console.text12))
}}
rl.close()  
}

setTimeout(async () => {
let codeBot = await sock.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.white(chalk.bgMagenta(lenguaje.console.text13)), chalk.bold.white(chalk.white(codeBot)))
}, 2000)
}}
}

async function getMessage(key) {
if (store) {
const msg = store.loadMessage(key.remoteJid, key.id)
return msg.message
} return {
conversation: 'SimpleBot',
}}

//--------------------[ FUNCIÓN  ]-----------------------
//NO TOCAR, Si no sabes los que esta haciendo :v
sock.ev.on('messages.upsert', async chatUpdate => {
sock.ev.on("messages.upsert", async (chatUpdate) => {
try {
const m = chatUpdate.messages[0];
if (!m.message) return;
const messageType = Object.keys(m.message)[0];
const buttonResponse = m.message[messageType]?.selectedButtonId;

if (buttonResponse === "copy_text") {
await conn.sendMessage(m.key.remoteJid, { text: "Este es el texto que puedes copiar manualmente." }, { quoted: m });
}
} catch (err) {
console.error(err);
}
});
//console.log(JSON.stringify(chatUpdate, undefined, 2))
try {
chatUpdate.messages.forEach(async (mek) => {
try {
mek = chatUpdate.messages[0]
if (!mek.message) return
sock.ev.on('messages.upsert', async chatUpdate => {
try {
const m = chatUpdate.messages[0];
if (!m.message || m.key.fromMe) return;

const sender = m.key.remoteJid; 
if (!sender.endsWith('@s.whatsapp.net')) return;

const senderNumber = sender.split('@')[0];

const arabicCountryCodes = [
'966', '971', '20', '212', '216', '213', '962', '964', '963', '961',
'970', '965', '974', '968', '973', '218', '249'
];

if (arabicCountryCodes.some(code => senderNumber.startsWith(code))) {
console.log(`Bloqueando número árabe detectado: ${senderNumber}`);
await sock.updateBlockStatus(sender, "block");
return;
}

} catch (err) {
console.error(err);
}
});
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
global.numBot = sock.user.id.split(":")[0] + "@s.whatsapp.net"
m = smsg(sock, mek)
global.numBot2 = sock.user.id
m = smsg(sock, mek)
let cmdjs;
try {
cmdjs = JSON.parse(fs.readFileSync("./json/commands.json", "utf-8"));
} catch (error) {
console.error("Error al cargar commands.json:", error);
cmdjs = {};
}

if (m.key.id.startsWith("BAE5")) return;

const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

const body = typeof m.text === 'string' ? m.text : '';
const allowedPrefixes = /^[./*#!]/;
const isCmd = allowedPrefixes.test(body) || true;

const rawCommand = isCmd
? body.replace(allowedPrefixes, '').trim().split(/ +/).shift()
: body.trim().split(/ +/).shift();

const command = normalize(rawCommand);
const args = body.trim().split(/ +/).slice(isCmd ? 1 : 0);

if (!Object.keys(cmdjs).some(cmd => normalize(cmd) === command)) return;

require("./main")(sock, m, chatUpdate, mek, store);
} catch (e) {
console.log(e)
}})
} catch (err) {
console.log(err)
}})

sock.ev.on('messages.update', async chatUpdate => {
for(const { key, update } of chatUpdate) {
if (update.pollUpdates && key.fromMe) {
const pollCreation = await getMessage(key)
if (pollCreation) {
const pollUpdate = await getAggregateVotesInPollMessage({message: pollCreation, pollUpdates: update.pollUpdates, })
var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
if (toCmd == undefined) return
var prefCmd = prefix+toCmd
sock.appenTextMessage(prefCmd, chatUpdate)
}}}})
const axios = require('axios');
sock.ev.on('group-participants.update', async (anu) => {
try {
if (!global.publicMode || !global.db.data.chats[anu.id]?.welcome) return;

let metadata = await sock.groupMetadata(anu.id);
let participants = anu.participants;

for (let num of participants) {
let ppuser = await sock.profilePictureUrl(num, 'image').catch(() => {
return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
});

let participantData = metadata.participants.find(p => p.id === num);
let username = participantData?.notify || participantData?.name || num.split('@')[0];

if (anu.action === "add") {
let groupDescription = metadata.desc || "Este grupo no tiene descripción.";
let groupName = metadata.subject || "Grupo sin nombre";
let memberCount = metadata.participants.length || 0;

let apiUrl = `https://eliasar-yt-api.vercel.app/api/v2/welcome?avatar=${encodeURIComponent(ppuser)}&username=${username}&bg=https://i.ibb.co/b3kycJP/9aaca021b696e6c31cda498ca489f114.jpg&groupname=${encodeURIComponent(groupName)}&member=${memberCount}`;

let response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

sock.sendMessage(anu.id, {
image: response.data,
caption: `Bienvenido @${username} al grupo *${groupName}*.\n\nPor favor, revisa la descripción del grupo para conocer las reglas y evitar inconvenientes.\n\n📌 *Descripción:* ${groupDescription}\n👥 *Miembros:* ${memberCount}\n\nEsperamos que tu estadía sea agradable.`,
mentions: [num]
});

} else if (anu.action === "remove") {
let imageBuffer = await axios.get(ppuser, { responseType: "arraybuffer" })
.then(response => Buffer.from(response.data, "binary"))
.catch(() => null);

if (imageBuffer) {
sock.sendMessage(anu.id, {
image: imageBuffer,
caption: `@${username} ha salido del grupo.\n\nLe deseamos lo mejor en su camino.`,
mentions: [num]
});
}

} else if (anu.action === 'promote') {
let usuario = anu.author;

sock.sendMessage(anu.id, {
text: `@${username} ha sido promovido a administrador del grupo.\n\n🔹 *Acción realizada por:* @${usuario.split("@")[0]}`,
mentions: [num, usuario]
});

} else if (anu.action === 'demote') {
let usuario = anu.author;

sock.sendMessage(anu.id, {
text: `@${username} ha sido removido como administrador.\n\n🔹 *Acción realizada por:* @${usuario.split("@")[0]}`,
mentions: [num, usuario]
});
}
}
} catch (err) {
console.log(err);
}
});
//--------------------[ ANTICALL ]-----------------------
sock.ev.on('call', async (fuckedcall) => { 
sock.user.jid = sock.user.id.split(":")[0] + "@s.whatsapp.net" // jid in user?
let anticall = global.db.data.settings[numBot].anticall
if (!anticall) return
console.log(fuckedcall)
for (let fucker of fuckedcall) {
if (fucker.isGroup == false) {
if (fucker.status == "offer") {
let call = await sock.sendTextWithMentions(fucker.from, `*[ ! ] @${fucker.from.split('@')[0]} ${lenguaje['smscall']()} ${fucker.isVideo ? `videollamadas` : `llamadas` }_\n\n${lenguaje['smscall2']()}\n\n• ${fb}`)
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Propietario 👑;;;\nFN:Propietario\nORG:Propietario 👑\nTITLE:\nitem1.TEL;waid=447700168473:+44 7700 168473\nitem1.X-ABLabel:Propietario 👑\nX-WA-BIZ-DESCRIPTION:ᴇsᴄʀɪʙɪ sᴏʟᴏ ᴘᴏʀ ᴄᴏsᴀs ᴅᴇʟ ʙᴏᴛ.\nX-WA-BIZ-NAME:Owner 👑\nEND:VCARD`//puede cambiar el numero "+44 7700 168473" por el tuyo ponlo como este ejemplo
sock.sendMessage(fucker.from, { contacts: { displayName: 'PROPIETARIO 👑', contacts: [{ vcard }] }}, {quoted: call, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
await sleep(8000)
await sock.updateBlockStatus(fucker.from, "block")
}}}})

function pickRandom(list) {
return list[Math.floor(list.length * Math.random())]
}  

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr, receivedPendingNotifications} = update;
console.log(receivedPendingNotifications)

if (connection == 'connecting') {
console.log(chalk.gray('iniciando | starting...'));
} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
console.log(color('[SYS]', '#009FFF'),
color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
color(`${lenguaje['smsConexioncerrar']()}`, '#f64f59'));
startBot()
} else if (opcion == '1' || methodCodeQR && qr !== undefined) {
if (opcion == '1' || methodCodeQR) {
console.log(color('[SYS]', '#009FFF'),
color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
color(`\n╭━─━─━─≪ ${vs} ≫─━─━─━╮\n│${lenguaje['smsEscaneaQR']()}\n╰━─━━─━─≪ 🟢 ≫─━─━━─━╯`, '#f12711'))
}
} else if (connection == 'open') {
console.log(color(` `,'magenta'))
console.log(color(`\n${lenguaje['smsConexion']()} ` + JSON.stringify(sock.user, null, 2), 'yellow'))
console.log(color('[SYS]', '#009FFF'),
color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
color(`\n╭━─━─━─≪ ${vs} ≫─━─━─━╮\n│${lenguaje['smsConectado']()}\n╰━─━━─━─≪ 🟢 ≫─━─━━─━╯` + receivedPendingNotifications, '#38ef7d')
);
}});

sock.public = true
store.bind(sock.ev)
sock.ev.on('creds.update', saveCreds)
setInterval(() => { 
if (global.listJadibot && global.listJadibot.length) { 
global.listJadibot.forEach(async (bot) => { 
if (!bot.ws || bot.ws.readyState !== 1) { 
await require("./jadibot").jadibot(bot, { 
sender: bot.user.id, 
fromMe: true, 
chat: bot.user.id 
}, "", "", "", bot.user.id); 
} 
}); 
} 
}, 30000);
process.on('uncaughtException', console.log)
process.on('unhandledRejection', console.log)
process.on('RefenceError', console.log)
}

startBot()

})()