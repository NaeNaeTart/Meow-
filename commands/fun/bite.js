const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bite')
        .setDescription('Bite someone!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to bite').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        
        const gifs = [
            'https://media.giphy.com/media/OqQvwj5szmIgw/giphy.gif',
            'https://media.giphy.com/media/RQSuZfuylVNAY/giphy.gif'
        ];

        const embed = new EmbedBuilder()
            .setDescription(`*<@${interaction.user.id}> bites <@${target.id}>! CHOMP!*`)
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setColor('#FF0000');

        await interaction.reply({ embeds: [embed] });
    },
};
