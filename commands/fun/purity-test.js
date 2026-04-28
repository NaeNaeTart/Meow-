const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purity-test')
        .setDescription('Check how innocent you (or someone else) are! 😇')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to check').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        
        // Deterministic but random-looking seed based on user ID and current day
        const day = new Date().toDateString();
        const seed = user.id + day;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        const percentage = Math.abs(hash % 101);

        let title = '';
        let color = '';
        let emoji = '';

        if (percentage > 90) {
            title = 'Pure Angel';
            color = '#FFFFFF';
            emoji = '😇';
        } else if (percentage > 70) {
            title = 'Good Kitten';
            color = '#FFB6C1';
            emoji = '🐱';
        } else if (percentage > 40) {
            title = 'A Little Mischievous';
            color = '#FFD700';
            emoji = '😼';
        } else if (percentage > 15) {
            title = 'Agent of Chaos';
            color = '#FF4500';
            emoji = '🔥';
        } else {
            title = 'Pure Evil / Ultimate Degenerate';
            color = '#000000';
            emoji = '💀';
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Purity Test Results`)
            .setDescription(`${user} is **${percentage}%** pure!`)
            .addFields({ name: 'Rank', value: `**${title}**` })
            .setColor(color)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'Results change every day! ✨' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
