const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay someone Kisses')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('Who to pay').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Amount to pay').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const senderId = interaction.user.id;
        
        if (target.bot || target.id === senderId) {
            return await interaction.reply({ content: '❌ You cannot pay bots or yourself.', ephemeral: true });
        }

        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};

        if (!ecoData.users[senderId]) ecoData.users[senderId] = { balance: 0, lastDaily: 0 };
        const balance = ecoData.users[senderId].balance;

        if (amount > balance) {
            return await interaction.reply({ content: `❌ You only have **${balance}** Kisses!`, ephemeral: true });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_pay').setLabel(`Pay ${amount}`).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cancel_pay').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: `Are you sure you want to send **${amount}** Kisses to **${target.tag}**?`,
            components: [confirmRow],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_pay') {
                if (!ecoData.users[target.id]) ecoData.users[target.id] = { balance: 0, lastDaily: 0 };
                
                ecoData.users[senderId].balance -= amount;
                ecoData.users[target.id].balance += amount;
                db.save('economy.json');

                await i.update({ content: '✅ Payment sent!', components: [] });
                await interaction.channel.send(`💸 **${interaction.user.tag}** sent **${amount}** Kisses to **${target.tag}**!`);
            } else {
                await i.update({ content: 'Payment cancelled.', components: [] });
            }
        });
    },
};
