const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the high-resolution avatar of a user')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to get the avatar of').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = interaction.options.getMember('target');
        
        const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
        
        const embed = new EmbedBuilder()
            .setTitle(`📸 ${user.username}'s Avatar`)
            .setImage(globalAvatar)
            .setColor('#FFB6C1')
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // If they have a server-specific avatar that is different
        if (member && member.avatar && member.avatar !== user.avatar) {
            const serverAvatar = member.displayAvatarURL({ dynamic: true, size: 4096 });
            embed.setDescription(`[View Server Avatar](${serverAvatar}) | [View Global Avatar](${globalAvatar})`);
            embed.setImage(serverAvatar);
        } else {
            embed.setDescription(`[View Full Resolution](${globalAvatar})`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
