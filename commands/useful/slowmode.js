const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode for the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addIntegerOption(option => 
            option.setName('seconds')
                .setDescription('Slowmode delay in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)), // Max 6 hours
    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        
        try {
            await interaction.channel.setRateLimitPerUser(seconds);
            if (seconds === 0) {
                await interaction.reply('🐇 Slowmode has been disabled for this channel.');
            } else {
                await interaction.reply(`🐢 Slowmode is now set to **${seconds} seconds**.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ I do not have permission to manage this channel!', ephemeral: true });
        }
    },
};
