const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Post an official announcement to the updates channel! 📣')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => opt.setName('title').setDescription('The title of the announcement').setRequired(true))
        .addStringOption(opt => opt.setName('content').setDescription('The main text of the announcement').setRequired(true))
        .addStringOption(opt => opt.setName('image').setDescription('Optional image URL').setRequired(false)),
    
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const image = interaction.options.getString('image');

        const guildConfigs = db.get('guild_configs.json') || {};
        const config = guildConfigs[interaction.guild.id];

        if (!config || !config.announcementsChannel) {
            return await interaction.reply({ content: '❌ You haven\'t set an announcements channel yet! Use `/set-channel announcements`. 😿', ephemeral: true });
        }

        const channel = await interaction.guild.channels.fetch(config.announcementsChannel).catch(() => null);
        if (!channel) {
            return await interaction.reply({ content: '❌ The set announcements channel no longer exists! 😿', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📣 ${title}`)
            .setDescription(content)
            .setColor('#FFD700')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (image) embed.setImage(image);

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Announcement posted in ${channel}! 🐾`, ephemeral: true });
    },
};
