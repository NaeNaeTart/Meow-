const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boop')
        .setDescription('Boop someone on the nose')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to boop').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        
        const gifs = [
            'https://media.giphy.com/media/10gx1EEi0XwDQI/giphy.gif',
            'https://media.giphy.com/media/xUOxf8nWeFdzu737YQ/giphy.gif'
        ];

        const embed = new EmbedBuilder()
            .setDescription(`*<@${interaction.user.id}> boops <@${target.id}> on the nose! Boop!*`)
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};
