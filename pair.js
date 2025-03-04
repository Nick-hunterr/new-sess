const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: Brasho_Kish,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

const router = express.Router();

// Helper function to remove files
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

// Route handler
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function LEGACY_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const Pair_Code_By_Brasho_Kish = Brasho_Kish({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!Pair_Code_By_Brasho_Kish.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Brasho_Kish.requestPairingCode(num);

                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Brasho_Kish.ev.on('creds.update', saveCreds);
            Pair_Code_By_Brasho_Kish.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    const b64data = Buffer.from(data).toString('base64');
                    await Pair_Code_By_Brasho_kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, { text: `Sending Session id now. . .`});
                    const session = await Pair_Code_By_Brasho_Kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, { text: '' + b64data });

                    // Send message after session
                    await Pair_Code_By_Brasho_Kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, {text: `Raven has been linked to your WhatsApp account! Do not share the session above with anyone. 

Copy and paste it on the SESSION part during deploy as it will be used for authentication\n\nGoodluck🎉. ` }, { quoted: session });
                    
                    await Pair_Code_By_Brasho_kish.sendMessage("254114660061@s.whatsapp.net", { text: `I am Connected to the Websocket Using Raven Bot !` });

                    await delay(100);
                    await Pair_Code_By_Brasho_Kish.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    LEGACY_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('service restarted', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }

    await LEGACY_MD_PAIR_CODE();
});

module.exports = router;
