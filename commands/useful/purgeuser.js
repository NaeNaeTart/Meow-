const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgeuser')
        .setDescription('Purge messages from a specific user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to purge messages for').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to search through (max 100)').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_purgeuser').setLabel('Confirm Purge').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_purgeuser').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: `⚠️ Are you sure you want to delete messages by **${target.tag}** (searching the last ${amount} messages)?`,
            components: [confirmRow],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_purgeuser') {
                try {
                    const messages = await interaction.channel.messages.fetch({ limit: amount });
                    const userMessages = messages.filter(m => m.author.id === target.id);
                    
                    if (userMessages.size === 0) {
                        return await i.update({ content: `No messages found by ${target.tag} in the last ${amount} messages.`, components: [] });
                    }

                    await interaction.channel.bulkDelete(userMessages, true);
                    await i.update({ content: `✅ Successfully purged ${userMessages.size} messages from ${target.tag}.`, components: [] });
                } catch (error) {
                    console.error(error);
                    await i.update({ content: '❌ Failed to purge messages. They might be older than 14 days.', components: [] });
                }
            } else if (i.customId === 'cancel_purgeuser') {
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
