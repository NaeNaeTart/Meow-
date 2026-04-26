const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calculate the love compatibility between two users')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
        .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(false)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2') || interaction.user;

        // Deterministic percentage based on IDs so it's always the same for the same two users
        const idSum = BigInt(user1.id) + BigInt(user2.id);
        const percentage = Number(idSum % 101n); // 0-100

        let heartCount = Math.floor(percentage / 10);
        let bar = '💖'.repeat(heartCount) + '🖤'.repeat(10 - heartCount);

        let comment = '';
        if (percentage > 90) comment = 'Match made in heaven! 😻';
        else if (percentage > 70) comment = 'Very compatible! 😽';
        else if (percentage > 40) comment = 'There is potential... 😺';
        else if (percentage > 20) comment = 'Might be a bit rough... 😿';
        else comment = 'Like cats and dogs! 🙀';

        const embed = new EmbedBuilder()
            .setTitle('💕 Compatibility Test')
            .setDescription(`**${user1.username}** x **${user2.username}**\n\n**${percentage}%** [${bar}]\n\n*${comment}*`)
            .setColor('#FF69B4');

        await interaction.reply({ embeds: [embed] });
    },
};
