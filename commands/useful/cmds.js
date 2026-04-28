const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmds')
        .setDescription('List all available commands for Meow!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📚 Command List')
            .setDescription('Here are all the things I can do!')
            .setColor('#FFB6C1');

        let funCmds = [];
        let usefulCmds = [];

        // Read dynamically loaded commands
        const commandsPath = path.join(__dirname, '..', '..', 'commands');
        if (fs.existsSync(commandsPath)) {
            const funPath = path.join(commandsPath, 'fun');
            if (fs.existsSync(funPath)) {
                const files = fs.readdirSync(funPath).filter(f => f.endsWith('.js'));
                files.forEach(f => {
                    const cmdName = f.replace('.js', '');
                    funCmds.push(`\`/${cmdName}\``);
                });
            }

            const usefulPath = path.join(commandsPath, 'useful');
            if (fs.existsSync(usefulPath)) {
                const files = fs.readdirSync(usefulPath).filter(f => f.endsWith('.js'));
                files.forEach(f => {
                    const cmdName = f.replace('.js', '');
                    usefulCmds.push(`\`/${cmdName}\``);
                });
            }
        }

        // Hardcoded/Legacy Commands (from index.js and deploy-commands.js)
        const legacySocial = ['`/meow`', '`/getmeowed`', '`/cattitude`', '`/paw`', '`/pawcount`', '`/avatar-meow`', '`/meow-translator`', '`/cat`', '`/catfact`'];
        const legacyEconomy = ['`/scratch`', '`/scratchleaderboard`', '`/daily`', '`/balance`', '`/gamble`'];
        const legacyUtility = ['`/ping`', '`/gifroulette`', '`/remind-meow`', '`/play-meow`'];
        const legacyMod = ['`/purge`', '`/kick`', '`/ban`', '`/banhistory`', '`/vcmute`', '`/vcunmute`', '`/vcdeafen`', '`/vcundeafen`'];

        embed.addFields(
            { name: '🎈 Fun & Social', value: [...legacySocial, ...funCmds].join(', ').substring(0, 1024) },
            { name: '💰 Economy & Games', value: legacyEconomy.join(', ').substring(0, 1024) },
            { name: '🛠️ Utility', value: [...legacyUtility, ...usefulCmds].join(', ').substring(0, 1024) },
            { name: '🛡️ Moderation', value: legacyMod.join(', ').substring(0, 1024) },
            { name: '🐾 Context Menus', value: 'Right click a message -> Apps -> `Meowify Message` / `Dogify Message`' }
        );

        await interaction.reply({ embeds: [embed] });
    },
};
