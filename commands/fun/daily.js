const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Kisses! 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};
        if (!ecoData.users[userId]) ecoData.users[userId] = { balance: 0, lastDaily: 0 };

        const now = Date.now();
        const lastDaily = ecoData.users[userId].lastDaily || 0;
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastDaily < oneDay) {
            const timeLeft = ms(oneDay - (now - lastDaily), { long: true });
            return await interaction.reply({ 
                content: `❌ You already got your kisses today! Wait another **${timeLeft}**, you silly boy. 💋`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const amount = 100; // Daily reward
        ecoData.users[userId].balance += amount;
        ecoData.users[userId].lastDaily = now;
        
        db.save('economy.json');

        const embed = new EmbedBuilder()
            .setTitle('💋 Daily Smooches!')
            .setDescription(`You received **${amount}** Kisses! Your new balance is **${ecoData.users[userId].balance}**.`)
            .setColor('#FFB6C1')
            .setFooter({ text: 'You\'re a lucky boykisser, aren\'t you?' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
