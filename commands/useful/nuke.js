const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Deletes and recreates the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        const confirmRow1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('nuke_step1').setLabel('NUKE').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('nuke_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: '⚠️ **WARNING:** This will permanently delete this channel and ALL its messages, then recreate an empty clone. Are you SURE?',
            components: [confirmRow1],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 20000 });

        collector.on('collect', async i => {
            if (i.customId === 'nuke_step1') {
                const confirmRow2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('nuke_step2').setLabel('YES, I AM SURE!').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('nuke_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
                );
                await i.update({ content: '🚨 **FINAL WARNING:** Click below to confirm.', components: [confirmRow2] });
            } else if (i.customId === 'nuke_step2') {
                try {
                    const channel = interaction.channel;
                    await i.update({ content: 'Nuking...', components: [] });
                    const newChannel = await channel.clone();
                    await channel.delete('Nuked by moderator');
                    await newChannel.send('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif\n**Channel Nuked!**');
                } catch (error) {
                    console.error(error);
                    await interaction.followUp({ content: '❌ Failed to nuke channel.', ephemeral: true });
                }
            } else if (i.customId === 'nuke_cancel') {
                await i.update({ content: 'Nuke aborted. Phew.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0 || !collected.find(i => i.customId === 'nuke_step2' || i.customId === 'nuke_cancel')) {
                interaction.editReply({ content: 'Confirmation timed out.', components: [] }).catch(() => {});
            }
        });
    },
};
