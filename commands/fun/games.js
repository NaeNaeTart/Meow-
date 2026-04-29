const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('fish')
            .setDescription('Go fishing for some Kisses! 💋🎣')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('confess')
            .setDescription('Submit an anonymous confession.')
            .setIntegrationTypes([0])
            .setContexts([0]),
        new SlashCommandBuilder()
            .setName('lyric-guesser')
            .setDescription('Guess the song from a snippet! 🎶')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2])
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'fish') {
            const fishTypes = [
                { name: '👟 Old Boot', value: 0, chance: 20 },
                { name: '🐟 Common Fish', value: 10, chance: 50 },
                { name: '🐠 Tropical Fish', value: 25, chance: 20 },
                { name: '🐡 Pufferfish', value: 50, chance: 8 },
                { name: '🦈 SHARK!', value: 200, chance: 2 }
            ];

            const roll = Math.random() * 100;
            let cumulative = 0;
            let caught = fishTypes[0];
            for (const f of fishTypes) {
                cumulative += f.chance;
                if (roll <= cumulative) {
                    caught = f;
                    break;
                }
            }

            if (caught.value > 0) {
                const balances = db.get('balances.json') || {};
                balances[interaction.user.id] = (balances[interaction.user.id] || 0) + caught.value;
                db.save('balances.json');
                await interaction.reply(`🎣 You caught a **${caught.name}**! You earned **${caught.value}** Kisses! 💋🐾`);
            } else {
                await interaction.reply(`🎣 You caught a **${caught.name}**... better luck next time! 😿`);
            }

        } else if (commandName === 'confess') {
            const modal = new ModalBuilder()
                .setCustomId('confession_modal')
                .setTitle('Submit a Confession');

            const input = new TextInputBuilder()
                .setCustomId('confession_text')
                .setLabel('What is your secret?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
    },
};
