const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnhistory')
        .setDescription("View a user's warnings")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to check').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        
        let warnData = db.get('warns.json') || {};

        const userWarns = warnData[target.id] || [];
        
        if (userWarns.length === 0) {
            return await interaction.reply({ content: `✅ **${target.tag}** has a clean record! No warnings found.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚠️ Warning History for ${target.tag}`)
            .setColor('#FFA500')
            .setFooter({ text: `Total Warnings: ${userWarns.length}` });

        let description = '';
        userWarns.forEach((warn, index) => {
            const time = `<t:${Math.floor(warn.timestamp / 1000)}:R>`;
            description += `**${index + 1}.** ${time} by <@${warn.moderator}>\nReason: ${warn.reason}\n\n`;
        });

        // Split into chunks if too long, simple approach just cap at 4096 chars
        if (description.length > 4096) description = description.substring(0, 4093) + '...';
        embed.setDescription(description);

        await interaction.reply({ embeds: [embed] });
    },
};
