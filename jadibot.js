const { updateConfig, overrideConsole, restoreConsole, config } = require('./silencelog');
require("./settings");
const {
  default: makeWASocket,
  PHONENUMBER_MCC,
  Browsers,
  makeInMemoryStore,
  useMultiFileAuthState,
  proto,
  jidNormalizedUser,
  WAMessageStubType,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  msgRetryCounterMap,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage
} = require("@whiskeysockets/baileys");
const chalk = require('chalk');
const figlet = require('figlet');
const moment = require('moment');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { smsg, sleep, getBuffer } = require('./libs/fuctions');
const _ = require('lodash');
const NodeCache = require('node-cache');
const os = require('os');
const { execSync } = require('child_process');
const util = require('util');
const pino = require('pino');
const cfonts = require('cfonts');
const { tmpdir } = require('os');
const { join } = require('path');
const PhoneNumber = require('awesome-phonenumber');
const { parsePhoneNumber } = require("libphonenumber-js");
const { readdirSync, statSync, unlinkSync } = require('fs');
let low; 
try { low = require('lowdb'); } catch (e) { low = require('./libs/database/lowdb'); }
const { Low, JSONFile } = low;
const mongoDB = require('./libs/database/mongoDB');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ? new mongoDB(opts['db']) : new JSONFile(`./database.json`)
);
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1000));
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    chats: {},
    game: {},
    database: {},
    settings: {},
    setting: {},
    others: {},
    sticker: {},
    ...(global.db.data || {})
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();
if (global.db) setInterval(async () => { if (global.db.data) await global.db.write(); }, 30000);
function clearTmp() {
  const tmpDirs = [tmpdir(), join(__dirname, './tmp')];
  let filenames = [];
  tmpDirs.forEach((dirname) => { readdirSync(dirname).forEach((file) => filenames.push(join(dirname, file))); });
  return filenames.map((file) => { const stats = statSync(file); if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) { return unlinkSync(file); } return false; });
}
setInterval(async () => { await clearTmp(); console.log(chalk.cyanBright('Limpiando archivos temporales')); }, 180000);
module.exports = async function startBotWithPhone(phoneNumber) {
  await global.loadDatabase();
  const sessionDir = `./jadibots/${phoneNumber}`;
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  const opcion = '2';
  let connectionClosedSent = false;
  async function startBot() {
    console.info = () => {};
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
    const msgRetryCache = new NodeCache();
    let { version } = await fetchLatestBaileysVersion();
    const socketSettings = {
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      mobile: false,
      browser: ["Linux", "Firefox", "112.0.0"],
      msgRetry: () => {},
      msgRetryCache,
      version,
      syncFullHistory: true,
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return (sock.chats[key.remoteJid] && sock.chats[key.remoteJid].messages[key.id])
            ? sock.chats[key.remoteJid].messages[key.id].message
            : undefined;
        }
        return proto.Message.fromObject({});
      }
    };
    const sock = makeWASocket(socketSettings);
    if (!fs.existsSync(`${sessionDir}/creds.json`)) {
      if (!sock.authState.creds.registered) {
        let addNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
          console.log(chalk.bgBlack(chalk.bold.redBright('Número de teléfono inválido.')));
          process.exit(0);
        }
        await delay(2000);
        let codeBot = await sock.requestPairingCode(addNumber);
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
        console.log(chalk.bold.white(chalk.bgMagenta('Código de vinculación generado:'), codeBot));
        await new Promise(resolve => {
          sock.ev.on('connection.update', update => {
            if (update.connection === 'open') {
              console.log(chalk.green('La conexión se estableció.'));
              resolve();
            } else if (update.connection === "close" && update.lastDisconnect && update.lastDisconnect.error && update.lastDisconnect.error.output?.statusCode != 401) {
              if (!connectionClosedSent) { console.log(chalk.red('La conexión se cerró.')); connectionClosedSent = true; }
              startBot();
            }
          });
        });
        attachEventListeners(sock, store);
        require("./main")(sock, null, null, null, store);
        return codeBot;
      }
    }
    await new Promise(resolve => {
      sock.ev.on('connection.update', update => {
        if (update.connection === 'open') {
          console.log(chalk.green('La conexión se estableció (sesión existente).'));
          resolve();
        }
      });
    });
    attachEventListeners(sock, store);
    require("./main")(sock, null, null, null, store);
    return "Sesión ya existente";
  }
  function attachEventListeners(sock, store) {
    sock.ev.on('messages.upsert', async chatUpdate => {
      try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;
        const messageType = Object.keys(m.message)[0];
        const buttonResponse = m.message[messageType]?.selectedButtonId;
        if (buttonResponse === "copy_text") {
          await sock.sendMessage(m.key.remoteJid, { text: "Este es el texto que puedes copiar manualmente." }, { quoted: m });
        }
      } catch (err) { console.error(err); }
    });
    sock.ev.on('messages.update', async chatUpdate => {
      for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
          const pollCreation = await getMessage(key);
          if (pollCreation) {
            const pollUpdate = await getAggregateVotesInPollMessage({ message: pollCreation, pollUpdates: update.pollUpdates });
            var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
            if (toCmd == undefined) return;
            var prefCmd = toCmd;
            sock.appenTextMessage(prefCmd, chatUpdate);
          }
        }
      }
    });
    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect } = update;
      if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode != 401) {
        if (!connectionClosedSent) { console.log(chalk.red('La conexión se cerró.')); connectionClosedSent = true; }
        startBot();
      }
    });
    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    sock.ev.on('group-participants.update', async (anu) => {
      try {
        if (!global.publicMode || !global.db.data.chats[anu.id]?.welcome) return;
        let metadata = await sock.groupMetadata(anu.id);
        let participants = anu.participants;
        for (let num of participants) {
          let ppuser = await sock.profilePictureUrl(num, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
          let participantData = metadata.participants.find(p => p.id === num);
          let username = participantData?.notify || participantData?.name || num.split('@')[0];
          if (anu.action === "add") {
            let groupDescription = metadata.desc || "Este grupo no tiene descripción.";
            let groupName = metadata.subject || "Grupo sin nombre";
            let memberCount = metadata.participants.length || 0;
            let apiUrl = `https://eliasar-yt-api.vercel.app/api/v2/welcome?avatar=${encodeURIComponent(ppuser)}&username=${username}&bg=https://i.ibb.co/b3kycJP/9aaca021b696e6c31cda498ca489f114.jpg&groupname=${encodeURIComponent(groupName)}&member=${memberCount}`;
            const axios = require('axios');
            let response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            await sock.sendMessage(anu.id, {
              image: response.data,
              caption: `Bienvenido @${username} al grupo *${groupName}*.\n\nPor favor, revisa la descripción del grupo para conocer las reglas.\n\n📌 Descripción: ${groupDescription}\n👥 Miembros: ${memberCount}`,
              mentions: [num]
            });
          } else if (anu.action === "remove") {
            const axios = require('axios');
            let imageBuffer = await axios.get(ppuser, { responseType: "arraybuffer" })
              .then(response => Buffer.from(response.data, "binary"))
              .catch(() => null);
            if (imageBuffer) {
              await sock.sendMessage(anu.id, {
                image: imageBuffer,
                caption: `@${username} ha salido del grupo.`,
                mentions: [num]
              });
            }
          } else if (anu.action === 'promote') {
            let usuario = anu.author;
            await sock.sendMessage(anu.id, {
              text: `@${username} ha sido promovido a administrador.\nAcción realizada por: @${usuario.split("@")[0]}`,
              mentions: [num, usuario]
            });
          } else if (anu.action === 'demote') {
            let usuario = anu.author;
            await sock.sendMessage(anu.id, {
              text: `@${username} ha dejado de ser administrador.\nAcción realizada por: @${usuario.split("@")[0]}`,
              mentions: [num, usuario]
            });
          }
        }
      } catch (err) { console.log(err); }
    });
    sock.ev.on('call', async (fuckedcall) => { 
      sock.user.jid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      let anticall = global.db.data.settings[sock.user.jid]?.anticall;
      if (!anticall) return;
      console.log(fuckedcall);
      for (let callEvent of fuckedcall) {
        if (callEvent.isGroup == false) {
          if (callEvent.status == "offer") {
            let call = await sock.sendMessage(callEvent.from, { text: `*[ ! ] @${callEvent.from.split('@')[0]} no se aceptan llamadas en este bot.` }, { quoted: callEvent });
            let vcard = `BEGIN:VCARD
VERSION:3.0
N:;Propietario 👑;;;
FN:Propietario
ORG:Propietario 👑
TITLE:
item1.TEL;waid=447700168473:+44 7700 168473
item1.X-ABLabel:Propietario 👑
X-WA-BIZ-DESCRIPTION:Información del bot.
X-WA-BIZ-NAME:Owner 👑
END:VCARD`;
            await sock.sendMessage(callEvent.from, { contacts: { displayName: 'PROPIETARIO 👑', contacts: [{ vcard }] }}, { quoted: call, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 });
            await sleep(8000);
            await sock.updateBlockStatus(callEvent.from, "block");
          }
        }
      }
    });
  }
  async function getMessage(key) {
    if (makeInMemoryStore) {
      const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
      const msg = store.loadMessage(key.remoteJid, key.id);
      return msg.message;
    }
    return { conversation: 'SimpleBot' };
  }
  return await startBot();
};