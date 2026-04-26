require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('meow')
        .setDescription('Replies with a meow!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('getmeowed')
        .setDescription('Send a "Get Meowed" image to someone!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to meow at')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('gifroulette')
        .setDescription('Search for a random gif!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addStringOption(option => option.setName('query').setDescription('What to search for').setRequired(false))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Where to search from')
                .setRequired(false)
                .addChoices(
                    { name: 'Giphy', value: 'giphy' },
                    { name: 'Klipy', value: 'klipy' }
                )),
    new SlashCommandBuilder()
        .setName('cattitude')
        .setDescription('Check a user\'s cattitude level!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addUserOption(option => option.setName('target').setDescription('The user to check').setRequired(false)),
    new SlashCommandBuilder()
        .setName('scratch')
        .setDescription('Scratch the global cat tree!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('scratchleaderboard')
        .setDescription('See who is scratching the most!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('catfact')
        .setDescription('Get a random interesting cat fact!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true),

    new SlashCommandBuilder()
        .setName('meow-translator')
        .setDescription('Translate human speech into meows!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true)),
    new SlashCommandBuilder()
        .setName('remind-meow')
        .setDescription('Set a catty reminder!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .setDMPermission(true)
        .addStringOption(option => option.setName('time').setDescription('When (e.g. 10s, 5m, 1h)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('What to remind you about').setRequired(true)),
    new SlashCommandBuilder()
        .setName('play-meow')
        .setDescription('Play an MP3 file in your voice channel!')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addAttachmentOption(option => option.setName('file').setDescription('The MP3 file to play').setRequired(true)),
    
    // --- Moderation Commands (Restricted by default) ---
    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a specified number of messages.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for kicking').setRequired(false)),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for banning').setRequired(false)),
    new SlashCommandBuilder()
        .setName('banhistory')
        .setDescription('View the list of banned users in this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setIntegrationTypes([0])
        .setContexts([0]),
    new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Get a random cute kitty image!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    new SlashCommandBuilder()
        .setName('paw')
        .setDescription('Paw at another user! (1-hour cooldown)')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to paw at').setRequired(true)),
    new SlashCommandBuilder()
        .setName('pawcount')
        .setDescription('Check how many paws a user has.')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to check (defaults to you)').setRequired(false)),
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Kisses! 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check how many Kisses you have. 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to check (defaults to you)').setRequired(false)),
    new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('You like gambling, don\'t you? 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addIntegerOption(option => option.setName('amount').setDescription('How many Kisses to risk').setRequired(true).setMinValue(1)),
    new SlashCommandBuilder()
        .setName('vcmute')
        .setDescription('Permanently mute a user in VC until unmuted.')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to mute').setRequired(true)),
    new SlashCommandBuilder()
        .setName('vcunmute')
        .setDescription('Unmute a user previously muted by vcmute.')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to unmute').setRequired(true)),
    new SlashCommandBuilder()
        .setName('vcdeafen')
        .setDescription('Permanently deafen a user in VC until undeafened.')
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to deafen').setRequired(true)),
    new SlashCommandBuilder()
        .setName('vcundeafen')
        .setDescription('Undeafen a user previously deafened by vcdeafen.')
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to undeafen').setRequired(true)),
    new SlashCommandBuilder()
        .setName('who')
        .setDescription('Investigate a user and gather hidden details. 🔍')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to investigate').setRequired(true)),

    {
        name: 'Meowify Message',
        type: ApplicationCommandType.Message,
        integration_types: [0, 1],
        contexts: [0, 1, 2],
    },
].map(command => {
    if (command instanceof SlashCommandBuilder) return command.toJSON();
    return command;
});

const fs = require('fs');
const path = require('path');

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
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // 1. Register GLOBALLY (Standard for any guild)
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log(`Successfully reloaded ${globalData.length} GLOBAL application (/) commands.`);

        // 2. Register to GUILD (Optional, for instant dev updates)
        if (process.env.GUILD_ID && process.env.GUILD_ID !== 'your_guild_id_here') {
            try {
                const guildData = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${guildData.length} GUILD application (/) commands.`);
            } catch (guildError) {
                console.warn(`Could not update Guild commands for ${process.env.GUILD_ID}: ${guildError.message}. Skipping...`);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
})();
