const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-channel')
        .setDescription('Configure special channels for the bot! ⚙️')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addSubcommand(sub => 
            sub.setName('mod-logs')
                .setDescription('Set the channel for moderation logs')
                .addChannelOption(opt => opt.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => 
            sub.setName('reports')
                .setDescription('Set the channel for user reports')
                .addChannelOption(opt => opt.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => 
            sub.setName('confessions')
                .setDescription('Set the channel for anonymous confessions')
                .addChannelOption(opt => opt.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => 
            sub.setName('report-pings')
                .setDescription('Set a role to ping when a report is made')
                .addRoleOption(opt => opt.setName('role').setDescription('The role to ping').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('github')
                .setDescription('Set the channel for GitHub webhooks')
                .addChannelOption(opt => opt.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(sub => 
            sub.setName('announcements')
                .setDescription('Set the channel for bot announcements and system updates')
                .addChannelOption(opt => opt.setName('channel').setDescription('The channel').setRequired(true).addChannelTypes(ChannelType.GuildText))),
    
    // Define which subcommands are restricted to which guilds
    guildRestrictions: {
        '1498472402420502638': ['github', 'announcements']
    },
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');
        
        const guildConfigs = db.get('guild_configs.json') || {};
        if (!guildConfigs[interaction.guild.id]) guildConfigs[interaction.guild.id] = {};
        
        const config = guildConfigs[interaction.guild.id];

        if (subcommand === 'mod-logs') {
            config.modLogChannel = channel.id;
            await interaction.reply(`✅ Mod logs will now be sent to ${channel}! 🧹`);
        } else if (subcommand === 'reports') {
            config.reportChannel = channel.id;
            await interaction.reply(`✅ User reports will now be sent to ${channel}! 🛡️`);
        } else if (subcommand === 'confessions') {
            config.confessionChannel = channel.id;
            await interaction.reply(`✅ Anonymous confessions will now be posted in ${channel}! 🤫`);
        } else if (subcommand === 'report-pings') {
            const role = interaction.options.getRole('role');
            config.reportPingRole = role.id;
            await interaction.reply(`✅ Successfully set ${role} to be pinged for new reports! 🛡️`);
        } else if (subcommand === 'github') {
            config.githubChannel = channel.id;
            await interaction.reply(`✅ GitHub webhooks will now be posted in ${channel}! 🐙`);
        } else if (subcommand === 'announcements') {
            config.announcementsChannel = channel.id;
            await interaction.reply(`✅ Bot announcements and system updates will now be posted in ${channel}! 📣`);
        }
        db.save('guild_configs.json');
    },
};
