const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banned-words')
        .setDescription('Manage banned words for this server! 🚫')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('add')
                .setDescription('Add a word to the banned list')
                .addStringOption(opt => opt.setName('word').setDescription('The word to ban').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('remove')
                .setDescription('Remove a word from the banned list')
                .addStringOption(opt => opt.setName('word').setDescription('The word to remove').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('List all banned words')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildConfigs = db.get('guild_configs.json') || {};
        if (!guildConfigs[interaction.guild.id]) guildConfigs[interaction.guild.id] = {};
        const config = guildConfigs[interaction.guild.id];
        if (!config.bannedWords) config.bannedWords = [];

        if (subcommand === 'add') {
            const word = interaction.options.getString('word').toLowerCase();
            if (config.bannedWords.includes(word)) {
                return await interaction.reply('❌ That word is already banned! 😿');
            }
            config.bannedWords.push(word);
            await interaction.reply(`✅ Added "**${word}**" to the banned words list. 🐾`);

        } else if (subcommand === 'remove') {
            const word = interaction.options.getString('word').toLowerCase();
            if (!config.bannedWords.includes(word)) {
                return await interaction.reply('❌ That word is not in the banned list! 😿');
            }
            config.bannedWords = config.bannedWords.filter(w => w !== word);
            await interaction.reply(`✅ Removed "**${word}**" from the banned words list. 🐾`);

        } else if (subcommand === 'list') {
            if (config.bannedWords.length === 0) {
                return await interaction.reply('🚫 No words are currently banned in this server.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🚫 Banned Words')
                .setDescription(config.bannedWords.map(w => `• ${w}`).join('\n'))
                .setColor('#FF0000')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        db.save('guild_configs.json');
    },
};
