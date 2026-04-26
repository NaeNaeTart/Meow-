const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });
            await interaction.reply('🔓 **This channel has been unlocked.** Normal members can speak again.');
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to unlock channel. Check my permissions.', ephemeral: true });
        }
    },
};
