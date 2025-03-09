require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VIRTUALFISHER_USER_ID = process.env.VIRTUALFISHER_USER_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const SESSION_ID = process.env.SESSION_ID;
const DISCORD_AUTH_TOKEN = process.env.DISCORD_AUTH_TOKEN;
const TIMEOUT = process.env.TIMEOUT;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildMessageTyping]
});

const log = (message) => {
    console.log(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] ${message}`);
};

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.id != VIRTUALFISHER_USER_ID || message.channel.id != CHANNEL_ID) return;
    if (message.components.length == 0 || message.components[0].components.length == 0) return;

    const customId = message.components[0].components[0].customId;
    const messageId = message.id;

    const nonce = Math.floor(Math.random() * 9999999999).toString();

    let verifyCode = null;
    if(message.embeds[0].data.description.includes('Code: **')) {
        verifyCode = message.embeds[0].data.description.split('**\n')[0].split('**')[1];

        log('Verification code: ' + verifyCode);
    }

    setTimeout(async () => {
        try {

            if(verifyCode) {
                const res = await fetch('https://discord.com/api/v9/interactions', {
                    headers: {
                        accept: '*/*',
                        authorization: DISCORD_AUTH_TOKEN,
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryo1G6Eu3McoXK3Ref',
                        Referer: `https://discord.com/channels/${GUILD_ID}/${CHANNEL_ID}`,
                        'Referrer-Policy': 'strict-origin-when-cross-origin'
                    },
                    method: 'POST',
                    body: `------WebKitFormBoundaryo1G6Eu3McoXK3Ref\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"${VIRTUALFISHER_USER_ID}\",\"guild_id\":\"${GUILD_ID}\",\"channel_id\":\"${CHANNEL_ID}\",\"session_id\":\"${SESSION_ID}\",\"data\":{\"version\":\"1207457860523663380\",\"id\":\"912432961222238220\",\"name\":\"verify\",\"type\":1,\"options\":[{\"type\":3,\"name\":\"answer\",\"value\":\"${verifyCode}\"}],\"application_command\":{\"id\":\"912432961222238220\",\"type\":1,\"application_id\":\"574652751745777665\",\"version\":\"1207457860523663380\",\"name\":\"verify\",\"description\":\"Used to verify you are a human when a captcha comes up.\",\"options\":[{\"type\":3,\"name\":\"answer\",\"description\":\"Enter the answer to the verification question.\",\"required\":true,\"description_localized\":\"Enter the answer to the verification question.\",\"name_localized\":\"answer\"}],\"dm_permission\":true,\"contexts\":[0,1,2],\"integration_types\":[0,1],\"global_popularity_rank\":5,\"description_localized\":\"Used to verify you are a human when a captcha comes up.\",\"name_localized\":\"verify\"},\"attachments\":[]},\"nonce\":\"${nonce}\",\"analytics_location\":\"slash_ui\"}\r\n------WebKitFormBoundaryo1G6Eu3McoXK3Ref--\r\n`
                });
    
                if (!res.body) {
                    log('Request sent successfully.');
                } else {
                    log('Request sent wrongly.');
                }

            } else {    
                const res = await fetch('https://discord.com/api/v9/interactions', {
                    method: 'POST',
                    headers: {
                        authorization: DISCORD_AUTH_TOKEN,
                        'content-type': 'application/json',
                        Referer: `https://discord.com/channels/${GUILD_ID}/${CHANNEL_ID}`,
                        'Referrer-Policy': 'strict-origin-when-cross-origin'
                    },
                    body: JSON.stringify({
                        type: 3,
                        nonce: nonce,
                        guild_id: GUILD_ID,
                        channel_id: CHANNEL_ID,
                        message_flags: 0,
                        message_id: messageId,
                        application_id: VIRTUALFISHER_USER_ID,
                        session_id: SESSION_ID,
                        data: {
                            component_type: 2,
                            custom_id: customId
                        }
                    })
                });
    
                if (!res.body) {
                    log('Request sent successfully.');
                } else {
                    log('Request sent wrongly.');
                }
            }
        } catch (error) {
            console.error('Error sending request:', error);
        }
    }, TIMEOUT);
});

client.login(BOT_TOKEN);
