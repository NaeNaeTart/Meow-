require('dotenv').config();
const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials, MessageFlags, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const nodeHtmlToImage = require('node-html-to-image');
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

client.commands = new Collection();
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
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Interaction listener for Slash Commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isMessageContextMenuCommand()) return;

    const { commandName } = interaction;

    // Check if it's a modular command
    const modularCommand = client.commands.get(commandName);
    if (modularCommand) {
        try {
            await modularCommand.execute(interaction);
            return; // Stop execution, don't fall through to legacy commands
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            return;
        }
    }

    // Fallback to legacy hardcoded commands
    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    if (commandName === 'meow') {
        await interaction.reply('Meow! 🐾');
    }

    if (commandName === 'getmeowed') {
        const gifUrl = 'https://media.discordapp.net/attachments/1473061637396103342/1473061637928910908/1467204479026987069.gif?ex=69ee7d0e&is=69ed2b8e&hm=9ed79dead3b5462536969f8fc846ea922396742666727d4746dd3fc21770359c&=';
        const target = interaction.options.getUser('target');
        
        const responseText = target 
            ? `Get meowed, bitch ${target} \n${gifUrl}` 
            : `Get meowed, bitch! \n${gifUrl}`;

        await interaction.reply(responseText);
    }

    if (commandName === 'gifroulette') {
        const query = interaction.options.getString('query');
        const source = interaction.options.getString('source') || 'giphy';
        const giphyKey = process.env.GIPHY_API_KEY;
        const klipyKey = process.env.KLIPY_API_KEY;

        await interaction.deferReply();

        try {
            let gifUrl;
            let displayTitle;

            if (source === 'giphy') {
                if (!giphyKey || giphyKey === 'your_giphy_key_here') {
                    return await interaction.editReply('❌ Giphy API Key is missing!');
                }

                if (query) {
                    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`);
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        const randomGif = data.data[Math.floor(Math.random() * data.data.length)];
                        gifUrl = randomGif.url;
                        displayTitle = `🎰 **Giphy Roulette: ${query}**`;
                    }
                } else {
                    const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${giphyKey}&rating=g`);
                    const data = await response.json();
                    if (data.data) {
                        gifUrl = data.data.url;
                        displayTitle = `🎰 **Pure Giphy Random!**`;
                    }
                }
            } else if (source === 'klipy') {
                if (!klipyKey || klipyKey === 'your_klipy_key_here') {
                    return await interaction.editReply('❌ Klipy API Key is missing!');
                }

                // Klipy Search
                const url = query 
                    ? `https://api.klipy.com/v1/${klipyKey}/gifs/search?q=${encodeURIComponent(query)}&limit=20`
                    : `https://api.klipy.com/v1/${klipyKey}/gifs/trending?limit=20`; // Klipy trending as random fallback

                const response = await fetch(url);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    const randomGif = data.data[Math.floor(Math.random() * data.data.length)];
                    gifUrl = randomGif.url || randomGif.embed_url;
                    displayTitle = query ? `🎰 **Klipy Roulette: ${query}**` : `🎰 **Pure Klipy Random!**`;
                }
            }

            if (gifUrl) {
                await interaction.editReply(`${displayTitle}\n${gifUrl}`);
            } else {
                await interaction.editReply(`No gifs found for "${query || 'random'}" on ${source}! 😿`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply(`Something went wrong while searching ${source}. 😿`);
        }
    }

    if (commandName === 'cattitude') {
        const target = interaction.options.getUser('target') || interaction.user;
        const level = Math.floor(Math.random() * 101);
        let emoji = '🐱';
        if (level > 80) emoji = '🔥😾';
        else if (level > 50) emoji = '😼';
        else if (level < 20) emoji = '😴😽';

        await interaction.reply(`${emoji} **${target.username}'s Cattitude Level:** ${level}%`);
    }

    if (commandName === 'scratch') {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const filePath = path.join(__dirname, 'scratches.json');
        
        let data = db.get('scratches.json') || { total: 0, users: {} };
        if (!data.users) data.users = {};

        data.total = (data.total || 0) + 1;
        data.users[userId] = (data.users[userId] || 0) + 1;
        
        db.save('scratches.json');
        
        await interaction.reply(`🐾 *Scritch scritch!* **${username}** has scratched the tree. \nGlobal count: **${data.total}** | Your total: **${data.users[userId]}**`);
    }

    if (commandName === 'scratchleaderboard') {
        const data = db.get('scratches.json');
        if (!data || !data.users || Object.keys(data.users).length === 0) {
            return await interaction.reply('The cat tree is brand new! No scratches yet. 😿');
        }
        const users = data.users;
        
        const sorted = Object.entries(users)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (sorted.length === 0) {
            return await interaction.reply('No scratches found! 😿');
        }

        let leaderboardText = '🏆 **Top Scratchers Leaderboard** 🏆\n\n';
        for (let i = 0; i < sorted.length; i++) {
            const [id, count] = sorted[i];
            leaderboardText += `${i + 1}. <@${id}> — **${count}** scratches\n`;
        }

        await interaction.reply(leaderboardText);
    }

    if (commandName === 'catfact') {
        await interaction.deferReply();
        try {
            const response = await fetch('https://catfact.ninja/fact');
            const data = await response.json();
            await interaction.editReply(`💡 **Did you know?**\n${data.fact}`);
        } catch (e) {
            await interaction.editReply('Meow... I forgot the fact. 😿');
        }
    }

    if (commandName === 'meow-translator') {
        const text = interaction.options.getString('text');
        const meows = ['Meow', 'Mrrp', 'Nya', 'Hiss', 'Purr', 'Meowww'];
        const translated = text.split(/\s+/).map(() => meows[Math.floor(Math.random() * meows.length)]).join(' ');
        await interaction.reply(`🗣️ **Translation:**\n${translated}`);
    }

    if (commandName === 'remind-meow') {
        const timeStr = interaction.options.getString('time');
        const reason = interaction.options.getString('reason');
        const timeMs = ms(timeStr);

        if (!timeMs) return await interaction.reply({ content: '❌ Invalid time format! Use 10s, 5m, 1h, etc.', flags: [MessageFlags.Ephemeral] });

        await interaction.reply(`⏰ Got it! I'll remind you about "**${reason}**" in ${timeStr}.`);

        setTimeout(async () => {
            try {
                await interaction.followUp(`🔔 **MEOW!** ${interaction.user}, here is your reminder: **${reason}**`);
            } catch (e) { console.error(e); }
        }, timeMs);
    }

    if (commandName === 'avatar-meow') {
        const target = interaction.options.getUser('target') || interaction.user;
        await interaction.reply(`🎨 Working on catifying **${target.username}**'s avatar... (Coming soon with full Canvas support!)`);
        // I'll implement full Canvas support if they like this idea.
    }

    if (commandName === 'play-meow') {
        const attachment = interaction.options.getAttachment('file');
        if (!attachment.contentType?.startsWith('audio/')) {
            return await interaction.reply({ content: '❌ Please upload a valid MP3 or audio file! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.reply({ content: '❌ You need to be in a voice channel first! 😿', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply();

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(attachment.url);

            player.play(resource);
            connection.subscribe(player);

            await interaction.editReply(`🎶 Now playing: **${attachment.name}** 🐾`);

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            player.on('error', error => {
                console.error(`Error: ${error.message}`);
                connection.destroy();
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('Meow... I couldn\'t join the voice channel. 😿');
        }
    }

    if (interaction.commandName === 'Meowify Message') {
        console.log(`Processing Meowify Message for ${interaction.user.tag}...`);
        await interaction.deferReply();

        const message = interaction.targetMessage;
        const author = message.author;
        const originalContent = message.content || "*No text content*";
        
        const meowifiedContent = originalContent.split(/\s+/).map(word => {
            if (word.length > 7) return 'Meowww~';
            if (word.length > 4) return 'Meow!';
            if (word.length > 2) return 'Meow';
            return 'meow';
        }).join(' ');

        try {
            const avatarUrl = author.displayAvatarURL({ extension: 'png', size: 128 });
            const htmlTemplate = `
            <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
                        body {
                            background: transparent;
                            font-family: 'Inter', sans-serif;
                            margin: 0;
                            padding: 0;
                        }
                        .message-card {
                            background: rgba(30, 31, 34, 0.9);
                            border-radius: 16px;
                            padding: 24px;
                            display: flex;
                            gap: 16px;
                            width: 500px;
                            max-width: 500px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,255,255,0.1);
                            backdrop-filter: blur(10px);
                            position: relative;
                            overflow: hidden;
                        }
                        .message-card::before {
                            content: '🐾';
                            position: absolute;
                            right: -10px;
                            bottom: -10px;
                            font-size: 80px;
                            opacity: 0.1;
                            transform: rotate(-15deg);
                        }
                        .avatar {
                            width: 56px;
                            height: 56px;
                            border-radius: 50%;
                            border: 2px solid #5865F2;
                        }
                        .content {
                            flex: 1;
                        }
                        .header {
                            display: flex;
                            align-items: baseline;
                            gap: 8px;
                            margin-bottom: 4px;
                        }
                        .username {
                            color: #ffffff;
                            font-weight: 600;
                            font-size: 16px;
                        }
                        .tag {
                            background: #5865F2;
                            color: white;
                            font-size: 10px;
                            padding: 2px 6px;
                            border-radius: 4px;
                            text-transform: uppercase;
                            font-weight: 800;
                        }
                        .text {
                            color: #dbdee1;
                            font-size: 15px;
                            line-height: 1.4;
                            word-break: break-word;
                        }
                        .meow-overlay {
                            color: #FFD700;
                            font-weight: 600;
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="message-card">
                        <img src="${avatarUrl}" class="avatar" />
                        <div class="content">
                            <div class="header">
                                <span class="username">${author.username}</span>
                                <span class="tag">Meowified</span>
                            </div>
                            <div class="text">
                                ${meowifiedContent}
                            </div>
                        </div>
                    </div>
                </body>
            </html>
            `;

            const image = await nodeHtmlToImage({
                html: htmlTemplate,
                transparent: true,
                selector: '.message-card',
                puppeteerArgs: { args: ['--no-sandbox'] }
            });

            const attachment = new AttachmentBuilder(image, { name: 'meowified.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('Meow... something went wrong while meowifying. 😿');
        }
    }

    if (commandName === 'purge') {
        const amount = interaction.options.getInteger('amount');
        
        if (!interaction.channel || !interaction.channel.bulkDelete) {
            return await interaction.reply({ content: '❌ This command can only be used in text channels! 😿', flags: [MessageFlags.Ephemeral] });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            const embed = new EmbedBuilder()
                .setTitle('🧹 Litterbox Cleaned!')
                .setDescription(`The cat tree is looking fresh! I've cleared **${deleted.size}** messages from this channel.`)
                .setColor('#FFD700')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Meow... I couldn\'t delete those messages. They might be too old (over 14 days). 😿', flags: [MessageFlags.Ephemeral] });
        }
    }

    if (commandName === 'kick') {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return await interaction.reply({ content: '❌ Target member not found! 😿', flags: [MessageFlags.Ephemeral] });
        if (!target.kickable) return await interaction.reply({ content: '❌ I don\'t have permission to kick this user! 😿', flags: [MessageFlags.Ephemeral] });

        try {
            await target.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('👢 Booted Out!')
                .setDescription(`**${target.user.tag}** has been hissed out of the server.`)
                .addFields(
                    { name: '👤 User', value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
                    { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: '📝 Reason', value: reason }
                )
                .setThumbnail(target.user.displayAvatarURL())
                .setColor('#FFA500')
                .setFooter({ text: 'Don\'t let the tail hit you on the way out!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Something went wrong while kicking. 😿', flags: [MessageFlags.Ephemeral] });
        }
    }

    if (commandName === 'ban') {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return await interaction.reply({ content: '❌ Target member not found! 😿', flags: [MessageFlags.Ephemeral] });
        
        if (!target.bannable) {
            return await interaction.reply({ content: '❌ I don\'t have permission to ban this user! (Role hierarchy or missing permission) 😿', flags: [MessageFlags.Ephemeral] });
        }

        try {
            await target.ban({ reason });
            const embed = new EmbedBuilder()
                .setTitle('🚫 Permanently Banned!')
                .setDescription(`**${target.user.tag}** is no longer welcome in this litterbox.`)
                .addFields(
                    { name: '👤 User', value: `${target.user.tag} (\`${target.id}\`)`, inline: true },
                    { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: '📝 Reason', value: reason }
                )
                .setThumbnail(target.user.displayAvatarURL())
                .setColor('#FF0000')
                .setFooter({ text: 'The claws have spoken.' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ban Error:', error);
            await interaction.reply({ content: `❌ API Error: ${error.message} 😿`, flags: [MessageFlags.Ephemeral] });
        }
    }

    if (commandName === 'cat') {
        try {
            await interaction.deferReply();
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🐾 Random Kitty!')
                .setImage(data[0].url)
                .setColor('#FFB6C1')
                .setFooter({ text: 'Powered by The Cat API' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Meow... I couldn\'t find any cats right now. They might be taking a nap! 😿');
        }
    }

    if (commandName === 'paw' || commandName === 'pawcount') {
        let pawData = db.get('paws.json') || { counts: {}, cooldowns: {} };
        if (!pawData.counts) pawData.counts = {};
        if (!pawData.cooldowns) pawData.cooldowns = {};

        if (commandName === 'pawcount') {
            const target = interaction.options.getUser('target') || interaction.user;
            const count = pawData.counts[target.id] || 0;
            
            const embed = new EmbedBuilder()
                .setTitle('🐾 Paw Count')
                .setDescription(`${target} has been pawed **${count}** times!`)
                .setColor('#FFB6C1')
                .setTimestamp();
                
            return await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'paw') {
            const target = interaction.options.getUser('target');
            const senderId = interaction.user.id;
            
            if (target.id === client.user.id) return await interaction.reply('Meow! You can\'t paw at me, I\'m the one doing the pawing! 😸');
            if (target.id === senderId) return await interaction.reply('You can\'t paw at yourself! That\'s just grooming. 😹');

            const now = Date.now();
            const lastPaw = pawData.cooldowns[senderId] || 0;
            const oneHour = 60 * 60 * 1000;

            if (now - lastPaw < oneHour) {
                const timeLeft = ms(oneHour - (now - lastPaw), { long: true });
                return await interaction.reply({ 
                    content: `🐾 You're too tired to paw again! Wait another **${timeLeft}**. 💤`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            // Update data
            pawData.counts[target.id] = (pawData.counts[target.id] || 0) + 1;
            pawData.cooldowns[senderId] = now;
            
            db.save('paws.json');

            const embed = new EmbedBuilder()
                .setTitle('🐾 *PAW!*')
                .setDescription(`${interaction.user} just pawed at ${target}!`)
                .addFields({ name: 'Total Paws', value: `${target} now has **${pawData.counts[target.id]}** paws!` })
                .setColor('#FFB6C1')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }

    if (commandName === 'daily' || commandName === 'balance' || commandName === 'gamble') {
        let ecoData = db.get('economy.json') || { users: {} };
        if (!ecoData.users) ecoData.users = {};

        const userId = interaction.user.id;
        if (!ecoData.users[userId]) {
            ecoData.users[userId] = { balance: 0, lastDaily: 0 };
        }

        if (commandName === 'balance') {
            const target = interaction.options.getUser('target') || interaction.user;
            const balance = ecoData.users[target.id]?.balance || 0;
            
            const embed = new EmbedBuilder()
                .setTitle('💋 Kisses Balance')
                .setDescription(`${target} has **${balance}** Kisses!`)
                .setColor('#FFB6C1')
                .setThumbnail('https://media.discordapp.net/attachments/1473061637396103342/1473061637928910908/boykisser.png') // Fallback thumbnail
                .setFooter({ text: 'You like having kisses, don\'t you?' })
                .setTimestamp();
                
            return await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'daily') {
            const now = Date.now();
            const lastDaily = ecoData.users[userId].lastDaily || 0;
            const oneDay = 24 * 60 * 60 * 1000;

            if (now - lastDaily < oneDay) {
                const timeLeft = ms(oneDay - (now - lastDaily), { long: true });
                return await interaction.reply({ 
                    content: `❌ You already got your kisses today! Wait another **${timeLeft}**, you silly boy. 💋`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const amount = 100; // Daily reward
            ecoData.users[userId].balance += amount;
            ecoData.users[userId].lastDaily = now;
            
            db.save('economy.json');

            const embed = new EmbedBuilder()
                .setTitle('💋 Daily Smooches!')
                .setDescription(`You received **${amount}** Kisses! Your new balance is **${ecoData.users[userId].balance}**.`)
                .setColor('#FFB6C1')
                .setFooter({ text: 'You\'re a lucky boykisser, aren\'t you?' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'gamble') {
            const amount = interaction.options.getInteger('amount');
            const balance = ecoData.users[userId].balance;

            if (amount > balance) {
                return await interaction.reply({ content: `❌ You only have **${balance}** Kisses! You're trying to bet more than you have, aren't you? 💋`, flags: [MessageFlags.Ephemeral] });
            }

            const win = Math.random() > 0.55; // 45% win rate for the house advantage
            let resultMessage = "";
            let color = "";

            if (win) {
                ecoData.users[userId].balance += amount;
                resultMessage = `🎰 **YOU WON!** \nYou doubled your bet and now have **${ecoData.users[userId].balance}** Kisses! \n\n*You're a winner, aren't you?*`;
                color = "#00FF00";
            } else {
                ecoData.users[userId].balance -= amount;
                resultMessage = `🎰 **YOU LOST!** \nYou lost **${amount}** Kisses and now have **${ecoData.users[userId].balance}**. \n\n*You're a loser, aren't you?*`;
                color = "#FF0000";
            }

            db.save('economy.json');

            const embed = new EmbedBuilder()
                .setTitle('🎰 Gambling Time!')
                .setDescription(resultMessage)
                .setColor(color)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }

    if (commandName === 'vcmute' || commandName === 'vcunmute' || commandName === 'vcdeafen' || commandName === 'vcundeafen') {
        let locks = db.get('vclocks.json') || { muted: [], deafened: [] };
        if (!locks.muted) locks.muted = [];
        if (!locks.deafened) locks.deafened = [];

        const target = interaction.options.getMember('target');
        if (!target) return await interaction.reply({ content: '❌ Target member not found in this server!', flags: [MessageFlags.Ephemeral] });

        if (commandName === 'vcmute') {
            if (!locks.muted.includes(target.id)) locks.muted.push(target.id);
            try {
                if (target.voice.channel) await target.voice.setMute(true, 'Locked by Meow!');
                db.save('vclocks.json');
                await interaction.reply(`🔇 **${target.user.tag}** has been locked in silence. They cannot unmute until released.`);
            } catch (error) {
                await interaction.reply({ content: `❌ Error: ${error.message}`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (commandName === 'vcunmute') {
            locks.muted = locks.muted.filter(id => id !== target.id);
            try {
                if (target.voice.channel) await target.voice.setMute(false);
                db.save('vclocks.json');
                await interaction.reply(`🔊 **${target.user.tag}** has been released from their silence.`);
            } catch (error) {
                await interaction.reply({ content: `❌ Error: ${error.message}`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (commandName === 'vcdeafen') {
            if (!locks.deafened.includes(target.id)) locks.deafened.push(target.id);
            try {
                if (target.voice.channel) await target.voice.setDeaf(true, 'Locked by Meow!');
                db.save('vclocks.json');
                await interaction.reply(`🔇 **${target.user.tag}** has been locked in deafness. They cannot undeafen until released.`);
            } catch (error) {
                await interaction.reply({ content: `❌ Error: ${error.message}`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (commandName === 'vcundeafen') {
            locks.deafened = locks.deafened.filter(id => id !== target.id);
            try {
                if (target.voice.channel) await target.voice.setDeaf(false);
                db.save('vclocks.json');
                await interaction.reply(`🔊 **${target.user.tag}** can now hear again.`);
            } catch (error) {
                await interaction.reply({ content: `❌ Error: ${error.message}`, flags: [MessageFlags.Ephemeral] });
            }
        }
    }

    if (commandName === 'who') {
        const targetUser = interaction.options.getUser('target');
        const targetMember = interaction.options.getMember('target');
        
        try {
            await interaction.deferReply();
            
            // Fetch full user for banner info
            const fullUser = await targetUser.fetch(true);
            
            const badges = fullUser.flags.toArray()
                .map(f => f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                .join(', ') || 'None';

            const createdDate = `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F> (<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>)`;
            
            const embed = new EmbedBuilder()
                .setTitle(`🔍 Investigation: ${targetUser.tag}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setColor(fullUser.accentColor || '#0099ff')
                .addFields(
                    { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
                    { name: '📅 Created', value: createdDate },
                );

            if (targetMember) {
                const joinedDate = `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:F> (<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>)`;
                embed.addFields({ name: '📥 Joined Server', value: joinedDate });
                
                const roles = targetMember.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => r.toString())
                    .join(' ') || 'None';
                embed.addFields({ name: `🎭 Roles [${targetMember.roles.cache.size - 1}]`, value: roles });

                const keyPerms = targetMember.permissions.toArray().filter(p => 
                    ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers', 'ManageMessages'].includes(p)
                ).join(', ') || 'None';
                embed.addFields({ name: '🛡️ Key Permissions', value: keyPerms });
            }

            embed.addFields({ name: '📛 Public Badges', value: badges });

            if (fullUser.bannerURL()) {
                embed.setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }));
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Meow... I couldn\'t complete the investigation. 😿');
        }
    }

    if (commandName === 'banhistory') {
        try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            
            // Fetch all bans
            const bans = await interaction.guild.bans.fetch();

            if (bans.size === 0) {
                return await interaction.editReply('🐾 The litterbox is clean! No banned users found in this server.');
            }

            // Try to fetch audit logs, but don't crash if it fails
            let auditLogs = { entries: [] };
            try {
                auditLogs = await interaction.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 100 });
            } catch (e) {
                console.warn('Could not fetch audit logs for ban history (Missing "View Audit Log" permission).');
            }

            // Convert bans to a usable array with moderator info
            const allBans = bans.map(ban => ({
                tag: ban.user.tag,
                id: ban.user.id,
                reason: ban.reason || 'No reason provided',
                moderator: auditLogs.entries.find(entry => entry.targetId === ban.user.id)?.executor.tag || 'Unknown Moderator'
            }));

            const itemsPerPage = 7;
            const totalPages = Math.ceil(allBans.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageBans = allBans.slice(start, end);
                
                const banDescription = pageBans.map((ban, index) => 
                    `**${index + 1}. ${ban.tag}** (\`${ban.id}\`)\n  └ 🛡️ By: **${ban.moderator}**\n  └ 📝 Reason: *${ban.reason}*`
                ).join('\n\n');

                return new EmbedBuilder()
                    .setTitle('📜 Detailed Ban History')
                    .setDescription(`Page ${page + 1} of ${totalPages}\n\n${banDescription}`)
                    .setColor('#0099ff')
                    .setFooter({ text: `Total Bans: ${allBans.length} | Click a number below to unban` })
                    .setTimestamp();
            };

            const generateComponents = (page) => {
                const start = page * itemsPerPage;
                const end = Math.min(start + itemsPerPage, allBans.length);
                const pageBansCount = end - start;

                const navRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1)
                );

                const components = [navRow];

                if (pageBansCount > 0) {
                    const unbanRow1 = new ActionRowBuilder();
                    const unbanRow2 = new ActionRowBuilder();
                    
                    for (let i = 0; i < pageBansCount; i++) {
                        const button = new ButtonBuilder()
                            .setCustomId(`unban_index_${i}`)
                            .setLabel(`Unban ${i + 1}`)
                            .setStyle(ButtonStyle.Danger);
                        
                        if (i < 5) {
                            unbanRow1.addComponents(button);
                        } else {
                            unbanRow2.addComponents(button);
                        }
                    }
                    
                    components.push(unbanRow1);
                    if (unbanRow2.components.length > 0) {
                        components.push(unbanRow2);
                    }
                }

                return components;
            };

            const initialMessage = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: generateComponents(currentPage),
                flags: [MessageFlags.Ephemeral]
            });

            const collector = initialMessage.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 300000 // 5 minute timeout
            });

            collector.on('collect', async i => {
                if (i.customId === 'prev_page') {
                    currentPage--;
                    await i.update({ embeds: [generateEmbed(currentPage)], components: generateComponents(currentPage) });
                } else if (i.customId === 'next_page') {
                    currentPage++;
                    await i.update({ embeds: [generateEmbed(currentPage)], components: generateComponents(currentPage) });
                } else if (i.customId.startsWith('unban_index_')) {
                    const indexOnPage = parseInt(i.customId.split('_')[2]);
                    const globalIndex = (currentPage * itemsPerPage) + indexOnPage;
                    const targetBan = allBans[globalIndex];

                    if (!targetBan) return;

                    const confirmEmbed = new EmbedBuilder()
                        .setTitle('⚠️ Confirm Unban')
                        .setDescription(`Are you sure you want to let **${targetBan.tag}** back into the litterbox?`)
                        .setColor('#FFFF00')
                        .setTimestamp();

                    const confirmRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_unban_${targetBan.id}`)
                            .setLabel('Yes, Unban')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancel_unban')
                            .setLabel('No, Keep Banned')
                            .setStyle(ButtonStyle.Secondary)
                    );

                    await i.update({
                        embeds: [confirmEmbed],
                        components: [confirmRow]
                    });

                    const confirmCollector = initialMessage.createMessageComponentCollector({
                        filter: ci => ci.user.id === interaction.user.id,
                        time: 30000,
                        max: 1
                    });

                    confirmCollector.on('collect', async ci => {
                        if (ci.customId === `confirm_unban_${targetBan.id}`) {
                            try {
                                await interaction.guild.members.unban(targetBan.id);
                                await ci.update({
                                    content: `✅ Successfully unbanned **${targetBan.tag}**!`,
                                    embeds: [],
                                    components: []
                                });
                                collector.stop('unbanned');
                            } catch (error) {
                                await ci.update({ content: `❌ Error unbanning: ${error.message}`, embeds: [], components: [] });
                            }
                        } else {
                            await ci.update({
                                embeds: [generateEmbed(currentPage)],
                                components: generateComponents(currentPage)
                            });
                        }
                    });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Meow... I couldn\'t fetch the detailed ban list. Do I have the "View Audit Log" permission? 😿');
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

    if (message.content.toLowerCase() === 'ping') {
        message.reply('Pong!');
    }

    if (message.content.toLowerCase() === 'meow') {
        message.reply('Meow! 🐾');
    }

    if (message.content.toLowerCase().startsWith('!getmeowed')) {
        const gifUrl = 'https://media.discordapp.net/attachments/1473061637396103342/1473061637928910908/1467204479026987069.gif?ex=69ee7d0e&is=69ed2b8e&hm=9ed79dead3b5462536969f8fc846ea922396742666727d4746dd3fc21770359c&=';
        const target = message.mentions.users.first();
        
        const responseText = target 
            ? `Get meowed, bitch ${target} \n${gifUrl}` 
            : `Get meowed, bitch! \n${gifUrl}`;

        message.channel.send(responseText);
    }

    if (message.content.toLowerCase().startsWith('!gifroulette')) {
        const args = message.content.split(' ').slice(1);
        const query = args.join(' ');
        const apiKey = process.env.GIPHY_API_KEY;

        if (!apiKey || apiKey === 'your_giphy_key_here') return;

        (async () => {
            try {
                let gifUrl;
                if (query) {
                    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`);
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        gifUrl = data.data[Math.floor(Math.random() * data.data.length)].url;
                    }
                } else {
                    const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&rating=g`);
                    const data = await response.json();
                    if (data.data) gifUrl = data.data.url;
                }
                if (gifUrl) message.reply(gifUrl);
            } catch (e) { console.error(e); }
        })();
    }
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
        const tunnel = await localtunnel({ port: PORT });
        console.log(`🌐 Public API URL: ${tunnel.url}`);
        
        tunnel.on('close', () => {
            console.log('🌐 Public API tunnel closed.');
        });
    } catch (err) {
        console.warn('Could not start localtunnel. The API will only be available locally.');
    }
});
