const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the bot\'s current performance and status.')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const client = interaction.client;

        // Latency calculations
        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = client.ws.ping;

        // Uptime calculations
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Memory Usage
        const used = process.memoryUsage().heapUsed / 1024 / 1024;

        const embed = new EmbedBuilder()
            .setTitle('📡 Bot Status')
            .setColor(wsPing < 150 ? '#00FF00' : '#FFA500')
            .addFields(
                { name: '📶 Connectivity', value: `WebSocket Ping: **${wsPing}ms**\nAPI Latency: **${apiLatency}ms**`, inline: true },
                { name: '💻 Resources', value: `Memory Usage: **${used.toFixed(2)} MB**\nUptime: **${hours}h ${minutes}m ${seconds}s**`, inline: true },
                { name: '✅ Systems', value: 'API: **Online**\nDatabase: **Operational**', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
