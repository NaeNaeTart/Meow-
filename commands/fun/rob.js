const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Attempt to steal Kisses from someone')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('Who to rob').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const senderId = interaction.user.id;
        
        if (target.bot || target.id === senderId) {
            return await interaction.reply({ content: '❌ You cannot rob bots or yourself.', ephemeral: true });
        }

        let ecoData = db.get('economy.json');
        if (!ecoData.users) ecoData.users = {};

        if (!ecoData.users[senderId]) ecoData.users[senderId] = { balance: 0, lastDaily: 0 };
        if (!ecoData.users[target.id]) ecoData.users[target.id] = { balance: 0, lastDaily: 0 };

        const targetBal = ecoData.users[target.id].balance;
        const senderBal = ecoData.users[senderId].balance;

        if (targetBal < 100) {
            return await interaction.reply({ content: `❌ **${target.tag}** doesn't have enough Kisses to be worth robbing.`, ephemeral: true });
        }
        if (senderBal < 100) {
            return await interaction.reply({ content: '❌ You need at least 100 Kisses to pay the fine if you get caught!', ephemeral: true });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirm_rob').setLabel('Attempt Robbery').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('cancel_rob').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );

        const response = await interaction.reply({
            content: `⚠️ Are you sure you want to rob **${target.tag}**? If you fail, you will pay a hefty fine!`,
            components: [confirmRow],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_rob') {
                const success = Math.random() > 0.6; // 40% success rate
                
                if (success) {
                    const stolenAmount = Math.floor(targetBal * (Math.random() * 0.3 + 0.1)); // Steal 10-40%
                    ecoData.users[target.id].balance -= stolenAmount;
                    ecoData.users[senderId].balance += stolenAmount;
                    db.save('economy.json');

                    await i.update({ content: 'Done.', components: [] });
                    await interaction.channel.send(`🥷 **${interaction.user.tag}** successfully robbed **${target.tag}** and got away with **${stolenAmount}** Kisses!`);
                } else {
                    const fine = Math.floor(senderBal * 0.25); // Lose 25% of own balance
                    ecoData.users[senderId].balance -= fine;
                    ecoData.users[target.id].balance += fine;
                    db.save('economy.json');

                    await i.update({ content: 'Done.', components: [] });
                    await interaction.channel.send(`🚓 **${interaction.user.tag}** was caught trying to rob **${target.tag}** and was forced to pay them a fine of **${fine}** Kisses!`);
                }
            } else {
                await i.update({ content: 'Robbery cancelled. Good choice.', components: [] });
            }
        });
    },
};
