const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors with Kisses on the line')
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

        const rpsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rps_rock').setLabel('Rock').setEmoji('🪨').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rps_paper').setLabel('Paper').setEmoji('📄').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('rps_scissors').setLabel('Scissors').setEmoji('✂️').setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.reply({
            content: `You bet **${bet}** Kisses. Choose your weapon!`,
            components: [rpsRow]
        });

        const collector = response.createMessageComponentCollector({ filter: i => i.user.id === userId, componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            const choices = ['rps_rock', 'rps_paper', 'rps_scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const userChoice = i.customId;

            const emojis = { rps_rock: '🪨', rps_paper: '📄', rps_scissors: '✂️' };

            let result = '';
            let winAmount = 0;

            if (userChoice === botChoice) {
                result = "It's a tie! You keep your Kisses.";
            } else if (
                (userChoice === 'rps_rock' && botChoice === 'rps_scissors') ||
                (userChoice === 'rps_paper' && botChoice === 'rps_rock') ||
                (userChoice === 'rps_scissors' && botChoice === 'rps_paper')
            ) {
                result = 'You win!';
                winAmount = bet;
            } else {
                result = 'You lose!';
                winAmount = -bet;
            }

            ecoData.users[userId].balance += winAmount;
            db.save('economy.json');

            const embed = new EmbedBuilder()
                .setTitle('Rock Paper Scissors')
                .setDescription(`You chose ${emojis[userChoice]} \nI chose ${emojis[botChoice]} \n\n**${result}**\n\nNew Balance: **${ecoData.users[userId].balance}** Kisses`)
                .setColor(winAmount > 0 ? '#00FF00' : winAmount < 0 ? '#FF0000' : '#FFFF00');

            await i.update({ content: null, embeds: [embed], components: [] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'You took too long to choose. Bet cancelled.', components: [] }).catch(() => {});
            }
        });
    },
};
