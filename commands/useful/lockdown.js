const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Instantly lock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_lock').setLabel('LOCKDOWN').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_lock').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: '⚠️ Are you sure you want to lock this channel? Normal users will not be able to send messages.',
            components: [confirmRow],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_lock') {
                try {
                    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: false
                    });
                    await i.update({ content: '✅ Channel locked.', components: [] });
                    await interaction.channel.send('🔒 **This channel has been locked by a moderator.**');
                } catch (error) {
                    console.error(error);
                    await i.update({ content: '❌ Failed to lock channel. Check my permissions.', components: [] });
                }
            } else if (i.customId === 'cancel_lock') {
                await i.update({ content: 'Action cancelled.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Confirmation timed out.', components: [] }).catch(() => {});
            }
        });
    },
};
