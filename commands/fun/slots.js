const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the Boykisser slot machine! (Punishing Edition) 🎰')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addIntegerOption(option => option.setName('bet').setDescription('How many Kisses to bet (Min: 50)').setRequired(false).setMinValue(50)),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};
        if (!ecoData.users[userId]) ecoData.users[userId] = { balance: 0, lastDaily: 0, freeSpins: 0 };
        
        let bet = interaction.options.getInteger('bet') || 50;
        let isFreeSpin = false;

        if (ecoData.users[userId].freeSpins > 0) {
            isFreeSpin = true;
            ecoData.users[userId].freeSpins--;
            bet = 0; // Free
        } else {
            if (ecoData.users[userId].balance < bet) {
                return await interaction.reply({ content: `❌ You only have **${ecoData.users[userId].balance}** Kisses! You need at least 50 for this machine. 😿`, flags: [MessageFlags.Ephemeral] });
            }
        }

        await runSlots(interaction, bet, ecoData, userId, isFreeSpin);
    },
};

async function runSlots(interaction, bet, ecoData, userId, isFreeSpin) {
    const emojis = ['🍒', '🍋', '🍉', '⭐', '💋'];
    const r1 = emojis[Math.floor(Math.random() * emojis.length)];
    const r2 = emojis[Math.floor(Math.random() * emojis.length)];
    const r3 = emojis[Math.floor(Math.random() * emojis.length)];

    let win = false;
    let winAmount = 0;
    let message = '';
    let bonusSpins = 0;

    if (r1 === r2 && r2 === r3) {
        win = true;
        winAmount = Math.max(bet * 5, 100);
        bonusSpins = 2;
        message = `🎰 **JACKPOT!** You won **${winAmount}** Kisses and **2 Free Spins**! 🐾`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        win = true;
        winAmount = Math.max(bet * 2, 100);
        bonusSpins = 1;
        message = `🎰 **Small Win!** You won **${winAmount}** Kisses and **1 Free Spin**! 🐾`;
    } else {
        win = false;
        winAmount = -Math.max(bet, 50);
        message = `🎰 **You Lost!** You lost **${Math.abs(winAmount)}** Kisses. 😿`;
    }

    if (isFreeSpin && !win) {
        winAmount = 0; // Didn't lose anything extra on a free spin
        message = `🎰 **Free Spin Lost!** No Kisses lost, but no win either. 😿`;
    }

    ecoData.users[userId].balance += winAmount;
    if (bonusSpins > 0) ecoData.users[userId].freeSpins = (ecoData.users[userId].freeSpins || 0) + bonusSpins;
    db.save('economy.json');

    const embed = new EmbedBuilder()
        .setTitle(isFreeSpin ? '🎰 Slot Machine (FREE SPIN!)' : '🎰 Slot Machine')
        .setDescription(`**[ ${r1} | ${r2} | ${r3} ]**\n\n${message}\n\n*Balance: **${ecoData.users[userId].balance}** | Free Spins: **${ecoData.users[userId].freeSpins || 0}***`)
        .setColor(win ? '#00FF00' : (isFreeSpin ? '#FFFF00' : '#FF0000'))
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
