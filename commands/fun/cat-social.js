const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('cat')
            .setDescription('Get a random cute kitty image!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('paw')
            .setDescription('Paw at another user! (1-hour cooldown)')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2])
            .addUserOption(option => option.setName('target').setDescription('The user to paw at').setRequired(true)),
        new SlashCommandBuilder()
            .setName('pawcount')
            .setDescription('Check how many paws a user has.')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2])
            .addUserOption(option => option.setName('target').setDescription('The user to check (defaults to you)').setRequired(false)),
        new SlashCommandBuilder()
            .setName('catfact')
            .setDescription('Get a random interesting cat fact!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('meow-translator')
            .setDescription('Translate human speech into meows!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2])
            .addStringOption(option => option.setName('text').setDescription('The text to translate').setRequired(true))
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'cat') {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            await interaction.reply(data[0].url);

        } else if (commandName === 'catfact') {
            const response = await fetch('https://catfact.ninja/fact');
            const data = await response.json();
            await interaction.reply(`🐾 **Did you know?**\n${data.fact}`);

        } else if (commandName === 'meow-translator') {
            const text = interaction.options.getString('text');
            const meowed = text.replace(/\w+/g, 'meow');
            await interaction.reply(`👤 **Human:** ${text}\n🐾 **Cat:** ${meowed}`);

        } else if (commandName === 'paw') {
            const target = interaction.options.getUser('target');
            if (target.id === interaction.user.id) return interaction.reply('❌ You cannot paw at yourself! 😿');
            
            const paws = db.get('paws.json') || {};
            const cooldowns = db.get('vclocks.json') || {}; // Reuse or new file
            
            const lastPaw = cooldowns[interaction.user.id] || 0;
            if (Date.now() - lastPaw < 3600000) {
                const remaining = Math.ceil((3600000 - (Date.now() - lastPaw)) / 60000);
                return interaction.reply(`❌ Chill! You can paw again in **${remaining}** minutes. 🐾`);
            }

            paws[target.id] = (paws[target.id] || 0) + 1;
            cooldowns[interaction.user.id] = Date.now();
            
            db.save('paws.json');
            db.save('vclocks.json');
            
            await interaction.reply(`🐾 **${interaction.user.username}** pawed at **${target.username}**! They now have **${paws[target.id]}** paws! 🐾`);

        } else if (commandName === 'pawcount') {
            const target = interaction.options.getUser('target') || interaction.user;
            const paws = db.get('paws.json') || {};
            const count = paws[target.id] || 0;
            await interaction.reply(`🐾 **${target.username}** has been pawed **${count}** times! 🐾`);
        }
    },
};
