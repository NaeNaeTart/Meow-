const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Open a private support ticket')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addStringOption(option => option.setName('reason').setDescription('What do you need help with?').setRequired(true)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason');
        
        try {
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('🎫 Support Ticket')
                .setDescription(`Hello <@${interaction.user.id}>! A staff member will be with you shortly.\n\n**Reason:** ${reason}`)
                .setColor('#FFB6C1')
                .setTimestamp();

            await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
            
            await interaction.reply({ content: `✅ Your ticket has been created: <#${channel.id}>`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ I do not have permission to create channels!', ephemeral: true });
        }
    },
};
