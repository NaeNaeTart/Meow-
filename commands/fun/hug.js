const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Give someone a virtual hug')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to hug').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        
        const gifs = [
            'https://media.giphy.com/media/xjlC6nomocZhVXuZgM/giphy.gif',
            'https://media.giphy.com/media/Vz58J8shFW6BvqnYTm/giphy.gif'
        ];

        const embed = new EmbedBuilder()
            .setDescription(`*<@${interaction.user.id}> hugs <@${target.id}> tightly!*`)
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};
