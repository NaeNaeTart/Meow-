const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confession')
        .setDescription('Send an anonymous confession to the current channel')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addStringOption(option => option.setName('message').setDescription('Your secret confession').setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        
        const embed = new EmbedBuilder()
            .setTitle('🤫 Anonymous Confession')
            .setDescription(`"${message}"`)
            .setColor('#000000')
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Your confession has been sent anonymously!', ephemeral: true });
    },
};
