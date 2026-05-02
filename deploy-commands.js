require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const allCommands = [];

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
                        allCommands.push({ data, guildRestrictions: command.guildRestrictions, execute: command.execute });
                    }
                } else if ('data' in command && 'execute' in command) {
                    allCommands.push(command);
                }
            }
        }
    }
}

function getCommandsForGuild(guildId = null) {
    return allCommands.filter(cmd => {
        const restrictions = cmd.guildRestrictions || {};
        
        // If the command itself is restricted to a guild
        for (const [restrictedGuildId, restrictedSubcommands] of Object.entries(restrictions)) {
            // If it's a command-level restriction (empty array)
            if (restrictedSubcommands.length === 0) {
                if (guildId !== restrictedGuildId) return false;
            }
        }
        return true;
    }).map(cmd => {
        const data = JSON.parse(JSON.stringify(cmd.data)); // Deep clone
        
        // If the command has subcommands, filter them
        if (data.options && data.options.length > 0) {
            data.options = data.options.filter(opt => {
                // If it's not a subcommand, keep it
                if (opt.type !== 1 && opt.type !== 2) return true;

                const subcommandName = opt.name;
                const restrictions = cmd.guildRestrictions || {};
                
                // Find if this subcommand is restricted to any guild
                let restrictedTo = null;
                for (const [gid, subcommands] of Object.entries(restrictions)) {
                    if (subcommands.includes(subcommandName)) {
                        restrictedTo = gid;
                        break;
                    }
                }

                if (!restrictedTo) return true; // No restriction, keep globally
                if (guildId && restrictedTo === guildId) return true; // Restricted to this guild, keep
                return false; // Restricted to another guild or global deployment, remove
            });
        }
        return data;
    });
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        const globalCommands = getCommandsForGuild(null);
        console.log(`Started refreshing ${globalCommands.length} GLOBAL application (/) commands.`);

        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: globalCommands },
        );
        console.log(`Successfully reloaded ${globalData.length} GLOBAL application (/) commands.`);

        // Support Server Specific Commands (with restricted subcommands)
        const supportServerId = '1498472402420502638';
        const supportCommands = getCommandsForGuild(supportServerId);
        
        console.log(`Refreshing commands for Support Server: ${supportServerId}`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, supportServerId),
            { body: supportCommands },
        );
        console.log(`Successfully reloaded ${supportCommands.length} commands for Support Server.`);

        // 2. Register to GUILD from .env (Optional, for instant dev updates)
        if (process.env.GUILD_ID && process.env.GUILD_ID !== 'your_guild_id_here' && process.env.GUILD_ID !== supportServerId) {
            try {
                const envGuildCommands = getCommandsForGuild(process.env.GUILD_ID);
                const guildData = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: envGuildCommands },
                );
                console.log(`Successfully reloaded ${guildData.length} GUILD application (/) commands for ${process.env.GUILD_ID}.`);
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
