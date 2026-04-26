const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        
        if (target.bot) return await interaction.reply({ content: 'You cannot warn a bot!', ephemeral: true });
        if (target.id === interaction.user.id) return await interaction.reply({ content: 'You cannot warn yourself!', ephemeral: true });

        let warnData = db.get('warns.json');

        if (!warnData[target.id]) warnData[target.id] = [];
        
        const warnEntry = {
            moderator: interaction.user.id,
            reason: reason,
            timestamp: Date.now()
        };
        
        warnData[target.id].push(warnEntry);
        db.save('warns.json');

        const embed = new EmbedBuilder()
            .setTitle('⚠️ User Warned')
            .setDescription(`**User:** ${target.tag}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`)
            .setColor('#FFA500')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        try {
            await target.send(`⚠️ You have been warned in **${interaction.guild.name}** for: **${reason}**`);
        } catch (e) {
            // Can't send DM
        }
    },
};
