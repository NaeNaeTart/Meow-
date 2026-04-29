const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('gifroulette')
            .setDescription('Search for a random gif!')
            .addStringOption(opt => opt.setName('query').setDescription('What to search for').setRequired(false))
            .addStringOption(opt => opt.setName('source').setDescription('Where to search from').setRequired(false).addChoices({name:'Giphy',value:'giphy'},{name:'Klipy',value:'klipy'})),
        new SlashCommandBuilder()
            .setName('cattitude')
            .setDescription('Check a user\'s cattitude level!')
            .addUserOption(opt => opt.setName('target').setDescription('The user to check').setRequired(false)),
        new SlashCommandBuilder()
            .setName('scratch')
            .setDescription('Scratch the global cat tree!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('scratchleaderboard')
            .setDescription('See who is scratching the most!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('remind-meow')
            .setDescription('Set a catty reminder!')
            .addStringOption(opt => opt.setName('time').setDescription('When (e.g. 10s, 5m, 1h)').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('What to remind you about').setRequired(true))
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'gifroulette') {
            const query = interaction.options.getString('query') || 'cat';
            const source = interaction.options.getString('source') || 'giphy';
            // Logic for Giphy/Klipy would go here (already in index.js usually)
            await interaction.reply(`🎲 Searching for **${query}** on **${source}**... (Logic pending migration)`);

        } else if (commandName === 'cattitude') {
            const target = interaction.options.getUser('target') || interaction.user;
            const level = Math.floor(Math.random() * 101);
            await interaction.reply(`🐾 **${target.username}**'s cattitude level is **${level}%**! 😼`);

        } else if (commandName === 'scratch') {
            const scratches = db.get('scratches.json') || {};
            scratches[interaction.user.id] = (scratches[interaction.user.id] || 0) + 1;
            db.save('scratches.json');
            await interaction.reply(`🐾 You scratched the cat tree! Total scratches: **${scratches[interaction.user.id]}** 🐾`);

        } else if (commandName === 'scratchleaderboard') {
            const scratches = db.get('scratches.json') || {};
            const sorted = Object.entries(scratches).sort((a, b) => b[1] - a[1]).slice(0, 10);
            let text = "🏆 **Global Scratch Leaderboard**\n";
            for (let i = 0; i < sorted.length; i++) {
                const user = await interaction.client.users.fetch(sorted[i][0]).catch(() => ({ username: 'Unknown' }));
                text += `${i + 1}. **${user.username}**: ${sorted[i][1]} scratches\n`;
            }
            await interaction.reply(text || "No scratches yet! 😿");

        } else if (commandName === 'remind-meow') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason');
            // Simplified reminder logic
            await interaction.reply(`⏰ I'll remind you about "**${reason}**" in **${timeStr}**! 🐾 (Logic pending migration)`);
        }
    },
};
