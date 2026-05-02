const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    // Both Slash and Context Menu
    data: [
        new SlashCommandBuilder()
            .setName('report')
            .setDescription('Report a user for bad behavior! 🛡️')
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to report').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('The reason for the report').setRequired(true)),
        new ContextMenuCommandBuilder()
            .setName('Report Message')
            .setType(ApplicationCommandType.Message)
            .setIntegrationTypes([0])
            .setContexts([0])
    ],
    
    async execute(interaction) {
        const guildConfigs = db.get('guild_configs.json') || {};
        const config = guildConfigs[interaction.guild.id];

        if (!config || !config.reportChannel) {
            return await interaction.reply({ content: '❌ The reporting system is not set up! Ask an admin to set a report channel. 😿', flags: [MessageFlags.Ephemeral] });
        }

        const channel = await interaction.guild.channels.fetch(config.reportChannel).catch(() => null);
        if (!channel) {
            return await interaction.reply({ content: '❌ Report channel not found! 😿', flags: [MessageFlags.Ephemeral] });
        }

        let target, reason, content = null, messageUrl = null;

        if (interaction.isMessageContextMenuCommand()) {
            target = interaction.targetMessage.author;
            reason = "Reported via message context menu.";
            content = interaction.targetMessage.content;
            messageUrl = interaction.targetMessage.url;
        } else {
            target = interaction.options.getUser('target');
            reason = interaction.options.getString('reason');
        }

        const embed = new EmbedBuilder()
            .setTitle('🛡️ New User Report')
            .addFields(
                { name: '👤 Target', value: `${target.username} (\`${target.id}\`)`, inline: true },
                { name: '🛡️ Reporter', value: `${interaction.user.username} (\`${interaction.user.id}\`)`, inline: true },
                { name: '📝 Reason', value: reason }
            )
            .setColor('#FFFF00')
            .setTimestamp();

        if (content) embed.addFields({ name: '💬 Message Content', value: content.substring(0, 1024) });
        if (messageUrl) embed.addFields({ name: '🔗 Link', value: `[Jump to Message](${messageUrl})` });

        const ping = config.reportPingRole ? `<@&${config.reportPingRole}>` : '';

        try {
            await channel.send({ content: ping, embeds: [embed] });
            await interaction.reply({ content: '✅ Your report has been submitted for review. Thank you for keeping the litterbox clean! 🐾', flags: [MessageFlags.Ephemeral] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: '❌ Failed to submit report. 😿', flags: [MessageFlags.Ephemeral] });
        }
    },
};
