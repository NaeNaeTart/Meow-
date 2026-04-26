const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Set a reminder')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option => option.setName('time').setDescription('When? (e.g. 10m, 1h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('What to remind you about').setRequired(true)),
    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        
        const duration = ms(timeInput);
        if (!duration || duration < 1000 || duration > ms('30d')) {
            return await interaction.reply({ content: '❌ Invalid time format! Use something like `10m`, `1h`, or `1d` (max 30d).', ephemeral: true });
        }

        const remindTime = Date.now() + duration;

        await interaction.reply(`⏰ Got it! I will remind you about **"${message}"** <t:${Math.floor(remindTime / 1000)}:R>.`);

        setTimeout(async () => {
            try {
                const embed = new EmbedBuilder()
                    .setTitle('⏰ Reminder!')
                    .setDescription(`You asked me to remind you:\n\n**${message}**`)
                    .setColor('#FFB6C1')
                    .setTimestamp();
                
                await interaction.user.send({ embeds: [embed] });
            } catch (err) {
                // Fallback to channel if DMs are closed
                await interaction.channel.send({ content: `<@${interaction.user.id}>, here is your reminder: **${message}**`, embeds: [] });
            }
        }, duration);
    },
};
