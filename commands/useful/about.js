const { SlashCommandBuilder, EmbedBuilder, version, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Get detailed information and statistics about Meow!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const client = interaction.client;
        
        // System uptime and bot uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime) % 60;
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Memory Usage
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

        // System Info
        const osType = os.type();
        const osRelease = os.release();

        const embed = new EmbedBuilder()
            .setTitle('🐾 About Meow!')
            .setDescription('I am a high-performance, kawaii Discord bot built to bring fun, economy, and utility to your servers!')
            .addFields(
                { name: '🤖 Bot Stats', value: `Servers: **${client.guilds.cache.size}**\nUsers: **${client.users.cache.size}**\nCommands: **${client.commands.size + 16}**`, inline: true }, // +16 for hardcoded ones in deploy
                { name: '💻 System', value: `Memory: **${memoryUsedMB} MB / ${memoryTotalMB} MB**\nOS: **${osType} ${osRelease}**\nUptime: **${uptimeString}**`, inline: true },
                { name: '⚙️ Versions', value: `Node.js: **${process.version}**\nDiscord.js: **v${version}**`, inline: true }
            )
            .setColor('#FFB6C1')
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Developed with 💖 by NaeNaeTart' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/TxUmxAjrbv'),
                new ButtonBuilder()
                    .setLabel('Add Meow!')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1497845203153977454')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
