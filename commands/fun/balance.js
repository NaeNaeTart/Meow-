const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check how many Kisses you have! 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to check (defaults to you)').setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const ecoData = db.get('economy.json');
        const balance = ecoData.users[target.id]?.balance || 0;
        
        const embed = new EmbedBuilder()
            .setTitle('💋 Kisses Balance')
            .setDescription(`${target.username} has **${balance}** Kisses!`)
            .setColor('#FFB6C1')
            .setThumbnail('https://media.discordapp.net/attachments/1473061637396103342/1473061637928910908/boykisser.png')
            .setFooter({ text: 'You like having kisses, don\'t you?' })
            .setTimestamp();
            
        return await interaction.reply({ embeds: [embed] });
    },
};
