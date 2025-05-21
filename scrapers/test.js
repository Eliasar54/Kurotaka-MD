if (!text || !/^https?:\/\/.+/.test(text)) {
  return m.reply("⚠️ Ingresa una URL válida.");
}
try {
let result = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${text}`); 
m.reply(`
Resultados 👻
 Título ${result.data.data.title} 
 type ${result.data.data.type} 
 artis ${result.data.data.artis} 
 image ${result.data.data.image}
download ${result.data.data.download}`)
}
catch (error) {
  console.error(error);
  m.reply("⚠️ Ocurrió un error al procesar la solicitud.");
}



if (!text || !/^https?:\/\/.+/.test(text)) {
  return m.reply("⚠️ Ingresa una URL válida.");
}
try {
let result = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${text}`); 
let videoInfo = `
Resultados 👻
 Título ${result.data.data.title} 
 type ${result.data.data.type} 
 artis ${result.data.data.artis} 
 image ${result.data.data.image}
download ${result.data.data.download}`
await conn.sendMessage(m.chat, {
  image: { url: result.data.data.image },
  caption: videoInfo,
}, { quoted: m });
}
catch (error) {
  console.error(error);
  m.reply("⚠️ Ocurrió un error al procesar la solicitud.");
}