const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendrules')
        .setDescription('Post the server rules to a specific channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send the rules to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    
    guildRestrictions: {
        '1498472402420502638': [] // Empty array means entire command is restricted
    },

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
            .setTitle('🐾 Meow! Support Server Rules')
            .setDescription('Welcome to the official support server! To ensure a paws-itive experience for everyone, please follow these rules:')
            .addFields(
                { 
                    name: '1️⃣ Be Purr-fectly Respectful', 
                    value: 'Treat everyone with kindness. Harassment, hate speech, toxicity, or bullying of any kind will not be tolerated.' 
                },
                { 
                    name: '2️⃣ Follow the Cat Law', 
                    value: 'All members must strictly adhere to [Discord\'s Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).' 
                },
                { 
                    name: '3️⃣ No Excessive Meowing', 
                    value: 'Avoid spamming, wall of texts, excessive tagging, or unsolicited self-promotion/advertisements.' 
                },
                { 
                    name: '4️⃣ Stay in your Litterbox', 
                    value: 'Use the correct channels for their intended purpose. Bot support requests belong in the support channels, not in general chat!' 
                },
                { 
                    name: '5️⃣ Keep the Fur Clean', 
                    value: 'No NSFW, suggestive, or illegal content. This is a SFW and inclusive community for everyone.' 
                },
                { 
                    name: '6️⃣ Obey the Alpha Cats', 
                    value: 'Follow the instructions provided by staff and moderators. If a moderator asks you to stop something, stop it. Their word is final.' 
                }
            )
            .setColor('#FFB6C1')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Thank you for following the rules and being part of our community! 💖' })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Rules have been successfully sent to ${channel}!` });
        } catch (error) {
            console.error('Error sending rules:', error);
            await interaction.editReply({ content: '❌ I couldn\'t send the rules. Make sure I have permission to speak in that channel!' });
        }
    },
};
