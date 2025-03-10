require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VIRTUALFISHER_USER_ID = process.env.VIRTUALFISHER_USER_ID;
const MY_USER_ID = process.env.MY_USER_ID;
const MY_BOT_USER_ID = process.env.MY_BOT_USER_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const SESSION_ID = process.env.SESSION_ID;
const DISCORD_AUTH_TOKEN = process.env.DISCORD_AUTH_TOKEN;
const TIMEOUT = process.env.TIMEOUT;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildMessageTyping]
});

let lastMessage = null;

const log = (message) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}]`;
    console.log(`${timestamp} ${message}`);
};

client.once('ready', () => {
    console.log('Bot is online!');
});

let counter = 0;
let timesBeforeWait = 100;
let minutesToWait = 3;

client.on(Events.MessageUpdate, async (_, newMessage) => {
    const message = newMessage;

    if (message.author.id == MY_BOT_USER_ID) return;
    if (message.author.id != VIRTUALFISHER_USER_ID || message.channel.id != CHANNEL_ID) return;

    log('Possible verification asked!');
    
    const nonce = Math.floor(Math.random() * 9999999999).toString();

    let verifyCode = null;
    const messageDescription = message.embeds[0].description;
    if(!messageDescription || !messageDescription.startsWith('Code: **')) return;

    verifyCode = messageDescription.split('**\n')[0].split('**')[1];

    log('Verification code: ' + verifyCode);
    await client.channels.cache.get(CHANNEL_ID).send(`Verification code requested! <@${MY_USER_ID}>`);
    
    setTimeout(async () => {
        try {
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

                // console.log(JSON.stringify(lastMessage, null, 2));

                execFish(lastMessage);
            } else {
                log('Request sent wrongly.');

                execFish(lastMessage);
            }

        } catch (error) {
            console.error('Error sending request:', error);

            execFish(lastMessage);
        }
    }, 1000);

});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.id == MY_BOT_USER_ID) return;
    if (message.author.id != VIRTUALFISHER_USER_ID || message.channel.id != CHANNEL_ID) return;

    if (message.components.length == 0 || message.components[0].components.length == 0) return;

    if(counter % timesBeforeWait == 0 && counter != 0 || counter == 1) {
        lastMessage = message;
    }

    execFish(message);
});

const execFish = (message) => {
    if (message.components.length == 0 || message.components[0].components.length == 0) {
        log('No components found.');
        
        message = lastMessage;
    }

    const customId = message.components[0].components[0].customId;
    const messageId = message.id;

    const nonce = Math.floor(Math.random() * 9999999999).toString();

    log('-----------------------');

    setTimeout(async () => {
        try {

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
        } catch (error) {
            console.error('Error sending request:', error);
            execFish(lastMessage);
        }

        counter++;
        if(counter % timesBeforeWait == 0 && counter != 0) {
            log(`Waiting ${minutesToWait} minutes...`);
        }
    }, counter % timesBeforeWait == 0 && counter != 0 ? minutesToWait * 60 * 1000 : TIMEOUT);
}

client.login(BOT_TOKEN);
