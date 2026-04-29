require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

const commands = [];

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
                if (Array.isArray(command.data)) {
                    for (const data of command.data) {
                        commands.push(typeof data.toJSON === 'function' ? data.toJSON() : data);
                    }
                } else if ('data' in command && 'execute' in command) {
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
