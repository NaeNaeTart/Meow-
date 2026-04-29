const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banhistory')
        .setDescription('View the list of banned users in this server. 🚫')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setIntegrationTypes([0])
        .setContexts([0]),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const bans = await interaction.guild.bans.fetch();
            
            if (bans.size === 0) {
                return await interaction.editReply('The litterbox is currently empty! No active bans found. 😸');
            }

            const embed = new EmbedBuilder()
                .setTitle('🚫 Server Ban History')
                .setColor('#FF0000')
                .setTimestamp();

            const banList = bans.map(ban => `• **${ban.user.username}** (\`${ban.user.id}\`) - Reason: ${ban.reason || 'No reason'}`).join('\n');
            
            // Handle potentially long lists
            if (banList.length > 4000) {
                embed.setDescription('Too many bans to display here! Please check the server settings.');
            } else {
                embed.setDescription(banList);
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Meow... I couldn\'t fetch the ban list. 😿');
        }
    },
};
