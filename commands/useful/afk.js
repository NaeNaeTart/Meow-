const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your status to AFK')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addStringOption(option => option.setName('reason').setDescription('Why are you AFK?').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'AFK';
        
        let afkData = db.get('afk.json');

        afkData[interaction.user.id] = {
            reason: reason,
            timestamp: Date.now()
        };

        db.save('afk.json');

        await interaction.reply({ content: `💤 I set your AFK: **${reason}**`, ephemeral: false });
    },
};
