const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        
        const embed = new EmbedBuilder()
            .setTitle('🪙 Coin Flip')
            .setDescription(`You flipped **${result}**!`)
            .setColor('#FFD700');

        await interaction.reply({ embeds: [embed] });
    },
};
