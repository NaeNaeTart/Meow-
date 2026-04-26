const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See the top 10 richest users')
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        let ecoData = db.get('economy.json');
        
        if (!ecoData || !ecoData.users) {
            return await interaction.reply({ content: 'No economy data found yet.', ephemeral: true });
        }

        const sortedUsers = Object.entries(ecoData.users)
            .sort(([, a], [, b]) => b.balance - a.balance)
            .slice(0, 10);

        if (sortedUsers.length === 0) {
            return await interaction.reply({ content: 'No one has any Kisses yet!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Richest Boykissers')
            .setColor('#FFD700')
            .setTimestamp();

        let desc = '';
        for (let i = 0; i < sortedUsers.length; i++) {
            const [userId, data] = sortedUsers[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
            desc += `${medal} <@${userId}> — **${data.balance}** Kisses\n`;
        }

        embed.setDescription(desc);

        await interaction.reply({ embeds: [embed] });
    },
};
