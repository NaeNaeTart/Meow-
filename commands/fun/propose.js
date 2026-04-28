const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('propose')
        .setDescription('Propose to another user! Costs 10,000 Kisses. 💍')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user you want to marry').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const sender = interaction.user;

        if (target.id === sender.id) {
            return await interaction.reply({ content: '❌ You cannot marry yourself!', flags: [MessageFlags.Ephemeral] });
        }
        if (target.bot) {
            return await interaction.reply({ content: '❌ You cannot marry a bot!', flags: [MessageFlags.Ephemeral] });
        }

        let ecoData = db.get('economy.json');
        if (!ecoData) ecoData = { users: {} };
        if (!ecoData.users[sender.id]) ecoData.users[sender.id] = { balance: 0 };

        const cost = 10000;
        if (ecoData.users[sender.id].balance < cost) {
            return await interaction.reply({ content: `❌ You need at least **${cost}** Kisses to buy a ring! You only have **${ecoData.users[sender.id].balance}**.`, flags: [MessageFlags.Ephemeral] });
        }

        let marriages = db.get('marriages.json');
        if (!marriages) marriages = {};

        // Check if either is already married
        if (marriages[sender.id]) {
            return await interaction.reply({ content: `❌ You are already married to <@${marriages[sender.id]}>!`, flags: [MessageFlags.Ephemeral] });
        }
        if (marriages[target.id]) {
            return await interaction.reply({ content: `❌ <@${target.id}> is already married!`, flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle('💍 Marriage Proposal!')
            .setDescription(`<@${target.id}>, the lovely <@${sender.id}> has proposed to you!\n\nDo you accept?`)
            .setColor('#FF69B4')
            .setImage('https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`propose_accept_${sender.id}_${target.id}`)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`propose_decline_${sender.id}_${target.id}`)
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        const response = await interaction.reply({ content: `<@${target.id}>`, embeds: [embed], components: [row] });

        // Setup button collector
        const filter = i => (i.customId.startsWith('propose_accept') || i.customId.startsWith('propose_decline')) && i.user.id === target.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter, time: 60000 });

            if (confirmation.customId.startsWith('propose_accept')) {
                // Deduct cost
                ecoData.users[sender.id].balance -= cost;
                db.save('economy.json');

                // Marry them
                marriages[sender.id] = target.id;
                marriages[target.id] = sender.id;
                
                // Initialize if undefined
                if (!marriages.timestamps) marriages.timestamps = {};
                marriages.timestamps[`${sender.id}_${target.id}`] = Date.now();
                
                db.save('marriages.json');

                const successEmbed = new EmbedBuilder()
                    .setTitle('💒 Just Married!')
                    .setDescription(`Congratulations! <@${sender.id}> and <@${target.id}> are now happily married! 💕`)
                    .setColor('#FF1493')
                    .setImage('https://media.giphy.com/media/xT0GqFjM8n29l03TdS/giphy.gif');

                await confirmation.update({ embeds: [successEmbed], components: [] });
            } else {
                const declineEmbed = new EmbedBuilder()
                    .setDescription(`💔 Ouch... <@${target.id}> declined the proposal. Better luck next time, <@${sender.id}>.`)
                    .setColor('#000000');
                await confirmation.update({ embeds: [declineEmbed], components: [] });
            }
        } catch (e) {
            const timeoutEmbed = new EmbedBuilder()
                .setDescription(`The proposal timed out... <@${target.id}> didn't respond in time.`)
                .setColor('#778899');
            await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
        }
    },
};
