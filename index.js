require('dotenv').config();
const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials, MessageFlags, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const ms = require('ms');
const db = require('./db');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
});

// --- Pre-load Official Assets for Performance ---
let cachedCatPaw, cachedDogPaw;
const loadAssets = async () => {
    try {
        const catPath = path.join(__dirname, 'Meow! stash', 'Cat Paw.png');
        const dogPath = path.join(__dirname, 'Meow! stash', 'Dog Paw.png');
        if (fs.existsSync(catPath)) cachedCatPaw = await loadImage(catPath);
        if (fs.existsSync(dogPath)) cachedDogPaw = await loadImage(dogPath);
        console.log('🐾 Official assets cached for high-performance rendering.');
    } catch (e) {
        console.error('⚠️ Failed to pre-load paws:', e);
    }
};
loadAssets();

client.commands = new Collection();
client.musicQueues = new Map();
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath);
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                if (Array.isArray(command.data)) {
                    for (const data of command.data) {
                        client.commands.set(data.name, { ...command, data });
                    }
                } else if (command.data && 'name' in command.data && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // --- Startup Announcement ---
    const guildConfigs = db.get('guild_configs.json') || {};
    for (const [guildId, config] of Object.entries(guildConfigs)) {
        if (config.announcementsChannel) {
            try {
                const guild = await client.guilds.fetch(guildId).catch(() => null);
                if (!guild) continue;
                const channel = await guild.channels.fetch(config.announcementsChannel).catch(() => null);
                if (!channel) continue;

                const embed = new EmbedBuilder()
                    .setTitle('📶 System Online')
                    .setDescription(`**Meow!** is now back online and ready to purr! 🐾`)
                    .setColor('#00FF00')
                    .setTimestamp();

                await channel.send({ embeds: [embed] }).catch(() => {});
            } catch (e) { console.error(`Failed to send startup announcement to guild ${guildId}:`, e); }
        }
    }

    // --- Background Unban Task ---
    setInterval(async () => {
        const bans = db.get('bans.json') || {};
        const now = Date.now();
        let changed = false;

        for (const [userId, banInfo] of Object.entries(bans)) {
            if (now >= banInfo.unbanAt) {
                try {
                    const guild = await client.guilds.fetch(banInfo.guildId);
                    if (guild) {
                        await guild.members.unban(userId, 'Temporary ban expired.');
                        console.log(`[UNBAN] Unbanned user ${userId} in guild ${guild.name}`);
                    }
                } catch (e) {
                    console.error(`[UNBAN ERROR] Could not unban user ${userId} in guild ${banInfo.guildId}:`, e.message);
                }
                delete bans[userId];
                changed = true;
            }
        }

        if (changed) {
            db.save('bans.json');
        }
    }, 60000); // Check every minute
});

// Interaction listener for Slash Commands
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'confession_modal') {
            const text = interaction.fields.getTextInputValue('confession_text');
            const guildConfigs = db.get('guild_configs.json') || {};
            const config = guildConfigs[interaction.guildId];
            
            if (!config || !config.confessionsChannel) {
                return await interaction.reply({ content: '❌ Confessions are not set up in this server! 😿', flags: [MessageFlags.Ephemeral] });
            }

            const channel = await interaction.guild.channels.fetch(config.confessionsChannel).catch(() => null);
            if (!channel) return await interaction.reply({ content: '❌ Confessions channel not found! 😿', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('🤐 Anonymous Confession')
                .setDescription(text)
                .setColor('#2F3136')
                .setTimestamp()
                .setFooter({ text: 'Use /confess to submit your own!' });

            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Your confession has been whispered to the void... 🐾', flags: [MessageFlags.Ephemeral] });
        }
    }

    if (!interaction.isCommand() && !interaction.isContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
        }
    }
});

// Keep message listener as fallback (optional)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    // AFK Logic
    let afkData = db.get('afk.json') || {};

    let afkUpdated = false;

    // Check if author was AFK and just spoke
    if (afkData[message.author.id]) {
        delete afkData[message.author.id];
        afkUpdated = true;
        message.reply('Welcome back! I have removed your AFK status.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Check if someone mentioned an AFK user
    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (afkData[user.id]) {
                const timeAgo = `<t:${Math.floor(afkData[user.id].timestamp / 1000)}:R>`;
                message.reply(`💤 **${user.username}** is currently AFK: ${afkData[user.id].reason} (since ${timeAgo})`);
            }
        });
    }

    if (afkUpdated) {
        db.save('afk.json');
    }


    // --- Banned Words & Activity Tracking ---
    const guildConfigs = db.get('guild_configs.json') || {};
    const config = guildConfigs[message.guild.id] || {};

    // Banned Words
    if (config.bannedWords && config.bannedWords.length > 0) {
        const lowerContent = message.content.toLowerCase();
        if (config.bannedWords.some(word => lowerContent.includes(word.toLowerCase()))) {
            await message.delete().catch(() => {});
            return; // Stop processing further for this message
        }
    }

    // Activity Tracking
    if (!config.activity) config.activity = {};
    const hour = new Date().getHours();
    config.activity[hour] = (config.activity[hour] || 0) + 1;
    
    if (!config.activeUsers) config.activeUsers = {};
    config.activeUsers[message.author.id] = (config.activeUsers[message.author.id] || 0) + 1;

    guildConfigs[message.guild.id] = config;
    db.save('guild_configs.json');
});

// --- Mod Logs Listeners ---
client.on(Events.MessageDelete, async message => {
    if (message.partial) return;
    if (message.author?.bot) return;

    const guildConfigs = db.get('guild_configs.json') || {};
    const config = guildConfigs[message.guild.id];
    if (!config || !config.modLogChannel) return;

    const channel = await message.guild.channels.fetch(config.modLogChannel).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle('🗑️ Message Deleted')
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setDescription(`**Channel:** ${message.channel}\n**Content:** ${message.content || '*No text content*'}`)
        .setColor('#FF4500')
        .setTimestamp();

    if (message.attachments.size > 0) {
        embed.addFields({ name: '📎 Attachments', value: message.attachments.map(a => `[${a.name}](${a.url})`).join('\n') });
    }

    channel.send({ embeds: [embed] }).catch(() => {});
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (oldMessage.partial) return;
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const guildConfigs = db.get('guild_configs.json') || {};
    const config = guildConfigs[oldMessage.guild.id];
    if (!config || !config.modLogChannel) return;

    const channel = await oldMessage.guild.channels.fetch(config.modLogChannel).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle('📝 Message Edited')
        .setAuthor({ name: oldMessage.author.tag, iconURL: oldMessage.author.displayAvatarURL() })
        .setDescription(`**Channel:** ${oldMessage.channel}\n[Jump to Message](${newMessage.url})`)
        .addFields(
            { name: 'Before', value: oldMessage.content || '*No text content*' },
            { name: 'After', value: newMessage.content || '*No text content*' }
        )
        .setColor('#FFA500')
        .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
});

if (!process.env.DISCORD_TOKEN) {
    console.error('Error: DISCORD_TOKEN is not defined in .env file.');
    process.exit(1);
}

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// --- Scratch API for Equicord Plugin ---
const http = require('http');
const PORT = 2444;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/scratches/')) {
        const userId = url.pathname.split('/')[2];
        const data = db.get('scratches.json');
        
        let count = 0;
        if (data && data.users) {
            count = data.users[userId] || 0;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ count }));
    } else if (url.pathname === '/github-webhook') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            res.writeHead(200);
            res.end('OK');
            try {
                if (!body) return;
                const data = JSON.parse(body);
                const guildConfigs = db.get('guild_configs.json') || {};
                
                // For each guild that has a github channel set
                for (const [guildId, config] of Object.entries(guildConfigs)) {
                    if (config.githubChannel) {
                        const guild = await client.guilds.fetch(guildId).catch(() => null);
                        if (!guild) continue;
                        const channel = await guild.channels.fetch(config.githubChannel).catch(() => null);
                        if (!channel) continue;

                        const embed = new EmbedBuilder().setColor('#24292F').setTimestamp();

                        if (data.commits) { // Push event
                            embed.setTitle(`🚀 New Commits in ${data.repository.full_name}`)
                                .setURL(data.repository.html_url)
                                .setDescription(data.commits.map(c => `• [\`${c.id.substring(0, 7)}\`](${c.url}) ${c.message} - *${c.author.name}*`).join('\n'));
                        } else if (data.pull_request) { // PR event
                            embed.setTitle(`🔀 Pull Request ${data.action}: ${data.pull_request.title}`)
                                .setURL(data.pull_request.html_url)
                                .setDescription(`By **${data.sender.login}**\n${data.pull_request.body || ''}`);
                        } else {
                            return; // Unhandled event
                        }

                        channel.send({ embeds: [embed] }).catch(() => {});
                    }
                }
            } catch (e) { console.error('Webhook Error:', e); }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.warn(`⚠️ Warning: Port ${PORT} is already in use. The Scratch API (Equicord) will be unavailable, but the Discord bot will still work!`);
    } else {
        console.error('Scratch API Error:', e);
    }
});

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🐾 Scratch API is purring on http://localhost:${PORT}`);
    
    try {
        const localtunnel = require('localtunnel');
        const tunnel = await localtunnel({ port: PORT, subdomain: 'meow-bot-webhook' });
        console.log(`🌐 Public API URL: ${tunnel.url}`);
        
        tunnel.on('close', () => {
            console.log('🌐 Public API tunnel closed.');
        });
    } catch (err) {
        console.warn('Could not start localtunnel. The API will only be available locally.');
    }
});
