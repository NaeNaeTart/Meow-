const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Play Russian Roulette. Loser gets timed out!')
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({ content: '❌ I do not have permission to timeout members! I cannot play roulette.', ephemeral: true });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_roulette').setLabel('Pull the Trigger').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_roulette').setLabel('Chicken Out').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: `🔫 **Russian Roulette**\nYou have a 1 in 6 chance of being timed out for 1 minute. Are you brave enough?`,
            components: [confirmRow]
        });

        const collector = response.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_roulette') {
                const isLoser = Math.random() < (1 / 6);
                
                if (isLoser) {
                    try {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        await member.timeout(60 * 1000, 'Lost at Russian Roulette');
                        await i.update({ content: `💥 **BANG!** <@${interaction.user.id}> lost and has been timed out for 1 minute. RIP.`, components: [] });
                    } catch (error) {
                        await i.update({ content: `💥 **BANG!** You lost, but I couldn't time you out. You got lucky this time.`, components: [] });
                    }
                } else {
                    await i.update({ content: `*Click.* Phew! <@${interaction.user.id}> survived.`, components: [] });
                }
            } else {
                await i.update({ content: `🐔 <@${interaction.user.id}> chickened out!`, components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'You took too long to decide. The gun jammed.', components: [] }).catch(() => {});
            }
        });
    },
};
