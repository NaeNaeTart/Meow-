const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stealemoji')
        .setDescription('Steal an emoji via URL')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addStringOption(option => option.setName('url').setDescription('The URL of the image/gif').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('The name for the new emoji').setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const name = interaction.options.getString('name');

        try {
            await interaction.deferReply();
            const emoji = await interaction.guild.emojis.create({ attachment: url, name: name });
            await interaction.editReply(`✅ Successfully stole the emoji: ${emoji} (Name: \`${emoji.name}\`)`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Failed to steal emoji. Ensure the URL is a direct image/gif link and under 256KB, and the bot has permissions.');
        }
    },
};
