/* CODE by EliasarYT  
Channel: https://whatsapp.com/channel/0029VadxAUkKLaHjPfS1vP36
*/
const axios = require('axios');
const UserAgent = require('user-agents');

const _0x4e9d62 = Buffer.from('RWxpYXNhcllU', 'base64').toString('utf-8');

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
'User-Agent': new UserAgent().toString(),
'X-Forwarded-For': () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
},
formats: {
video: ['2026', '1350', '1012', '676', '450', '338', '224', '136'],
audio: ['160', '128', '96', '64', '48']
},

async dl(url, type, resolution) {
try {
const response = await axios.get(this.api.base + this.api.endpoints.signature, {
headers: {
...this.headers,
'X-Forwarded-For': this.headers['X-Forwarded-For']()
}
});

const { signature, timestamp } = response.data;
const encodedUrl = encodeURIComponent(url);
let downloadUrl;

if (type === 'mp4' || type === 'video') {
if (!this.formats.video.includes(resolution)) {
return JSON.stringify({
status: false,
creator: _0x4e9d62,
message: 'Invalid resolution'
}, null, 2);
}
downloadUrl = `${this.api.base}${this.api.endpoints.video}?url=${encodedUrl}&resolution=${resolution}&signature=${signature}&timestamp=${timestamp}`;
} else if (type === 'mp3' || type === 'audio') {
if (!this.formats.audio.includes(resolution)) {
return JSON.stringify({
status: false,
creator: _0x4e9d62,
message: 'Invalid bitrate'
}, null, 2);
}
downloadUrl = `${this.api.base}${this.api.endpoints.audio}?url=${encodedUrl}&bitrate=${resolution}&signature=${signature}&timestamp=${timestamp}`;
} else {
return JSON.stringify({
status: false,
creator: _0x4e9d62,
message: 'Invalid type'
}, null, 2);
}

return JSON.stringify({
status: true,
creator: _0x4e9d62,
result: {
expires: timestamp + 3600,
dl: downloadUrl
}
}, null, 2);
} catch (error) {
return JSON.stringify({
status: false,
creator: _0x4e9d62,
message: error.message
}, null, 2);
}
}
};

module.exports = nvlgroupdl;