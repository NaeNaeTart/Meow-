const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the Boykisser slot machine!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addIntegerOption(option => option.setName('bet').setDescription('How many Kisses to bet').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const userId = interaction.user.id;
        
        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};

        if (!ecoData.users[userId]) ecoData.users[userId] = { balance: 0, lastDaily: 0 };
        const balance = ecoData.users[userId].balance;

        if (bet > balance) {
            return await interaction.reply({ content: `❌ You only have **${balance}** Kisses!`, ephemeral: true });
        }

        // Require confirmation if bet is over 500
        if (bet >= 500) {
            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirm_slots').setLabel(`Bet ${bet} Kisses`).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('cancel_slots').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );

            const response = await interaction.reply({
                content: `⚠️ High Roller Alert! Are you sure you want to bet **${bet}** Kisses on the slots?`,
                components: [confirmRow],
                ephemeral: true
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm_slots') {
                    await runSlots(i, bet, ecoData, userId);
                } else {
                    await i.update({ content: "Bet cancelled. Too scared, aren't you? 💋", components: [] });
                }
            });
            return;
        }

        await runSlots(interaction, bet, ecoData, userId);
    },
};

async function runSlots(interaction, bet, ecoData, userId) {
    const emojis = ['🍒', '🍋', '🍉', '⭐', '💋'];
    const r1 = emojis[Math.floor(Math.random() * emojis.length)];
    const r2 = emojis[Math.floor(Math.random() * emojis.length)];
    const r3 = emojis[Math.floor(Math.random() * emojis.length)];

    let winAmount = 0;
    let message = '';

    if (r1 === r2 && r2 === r3) {
        winAmount = bet * 5;
        if (r1 === '💋') winAmount = bet * 10;
        message = `🎰 **JACKPOT!** You won **${winAmount}** Kisses!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        winAmount = bet * 2;
        message = `🎰 **Small Win!** You won **${winAmount}** Kisses!`;
    } else {
        winAmount = -bet;
        message = `🎰 **You Lost!** You lost **${bet}** Kisses.`;
    }

    ecoData.users[userId].balance += winAmount;
    db.save('economy.json');

    const embed = new EmbedBuilder()
        .setTitle('🎰 Slot Machine')
        .setDescription(`**[ ${r1} | ${r2} | ${r3} ]**\n\n${message}\n\n*New Balance: **${ecoData.users[userId].balance}** Kisses*`)
        .setColor(winAmount > 0 ? '#00FF00' : '#FF0000');

    if (interaction.isButton()) {
        await interaction.update({ content: null, embeds: [embed], components: [] });
    } else {
        await interaction.reply({ embeds: [embed] });
    }
}
