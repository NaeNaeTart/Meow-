const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Get details about a specific role')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addRoleOption(option => option.setName('role').setDescription('The role to inspect').setRequired(true)),
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        
        const embed = new EmbedBuilder()
            .setTitle(`Role Info: ${role.name}`)
            .setColor(role.hexColor || '#99aab5')
            .addFields(
                { name: '🆔 ID', value: `\`${role.id}\``, inline: true },
                { name: '🎨 Color', value: `\`${role.hexColor}\``, inline: true },
                { name: '👥 Members', value: `${role.members.size}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📌 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: '🔗 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
