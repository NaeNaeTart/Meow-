const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Give someone a smooch and transfer some Kisses to them! 💋')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to kiss').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('How many Kisses to give').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const sender = interaction.user;

        if (target.id === sender.id) {
            return await interaction.reply({ content: '❌ You cannot kiss yourself! (Well, you can, but it doesn\'t cost anything)', flags: [MessageFlags.Ephemeral] });
        }

        let ecoData = db.get('economy.json');
        if (!ecoData) ecoData = { users: {} };
        if (!ecoData.users) ecoData.users = {};

        // Initialize users if they don't exist
        if (!ecoData.users[sender.id]) ecoData.users[sender.id] = { balance: 0, lastDaily: 0 };
        if (!ecoData.users[target.id]) ecoData.users[target.id] = { balance: 0, lastDaily: 0 };

        if (ecoData.users[sender.id].balance < amount) {
            return await interaction.reply({ content: `❌ You don't have enough Kisses to give that many! You only have **${ecoData.users[sender.id].balance}**.`, flags: [MessageFlags.Ephemeral] });
        }

        // Transfer funds
        ecoData.users[sender.id].balance -= amount;
        ecoData.users[target.id].balance += amount;
        db.save('economy.json');

        const embed = new EmbedBuilder()
            .setDescription(`💋 <@${sender.id}> gave <@${target.id}> a big smooch!`)
            .addFields(
                { name: 'Transfer', value: `**${amount}** Kisses were given.`, inline: false },
                { name: `${sender.username}'s Balance`, value: `${ecoData.users[sender.id].balance}`, inline: true },
                { name: `${target.username}'s Balance`, value: `${ecoData.users[target.id].balance}`, inline: true }
            )
            .setColor('#FFB6C1')
            .setImage('https://media.giphy.com/media/G3va31oGiePzQNhv3m/giphy.gif'); // Cute kiss gif

        await interaction.reply({ content: `<@${target.id}>`, embeds: [embed] });
    },
};
