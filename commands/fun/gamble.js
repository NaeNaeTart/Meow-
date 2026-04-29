const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('You like gambling, don\'t you? (Punishing Edition) 🎰')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addIntegerOption(option => option.setName('amount').setDescription('How many Kisses to risk (Min: 50)').setRequired(true).setMinValue(50)),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const userId = interaction.user.id;
        
        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};
        if (!ecoData.users[userId]) ecoData.users[userId] = { balance: 0, lastDaily: 0 };
        
        const balance = ecoData.users[userId].balance;

        if (amount > balance) {
            return await interaction.reply({ content: `❌ You only have **${balance}** Kisses! You're trying to bet more than you have, aren't you? 💋`, flags: [MessageFlags.Ephemeral] });
        }

        const win = Math.random() > 0.6; // 40% win rate
        let resultMessage = "";
        let color = "";
        let finalChange = 0;

        if (win) {
            finalChange = Math.max(amount, 100);
            ecoData.users[userId].balance += finalChange;
            resultMessage = `🎰 **YOU WON!** \nYou gained **${finalChange}** Kisses and now have **${ecoData.users[userId].balance}**! \n\n*You're a winner, aren't you?*`;
            color = "#00FF00";
        } else {
            finalChange = Math.max(amount, 50);
            ecoData.users[userId].balance -= finalChange;
            resultMessage = `🎰 **YOU LOST!** \nYou lost **${finalChange}** Kisses and now have **${ecoData.users[userId].balance}**. \n\n*You're a loser, aren't you?*`;
            color = "#FF0000";
        }

        db.save('economy.json');

        const embed = new EmbedBuilder()
            .setTitle('🎰 Gambling Time!')
            .setDescription(resultMessage)
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
