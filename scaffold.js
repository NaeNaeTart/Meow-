const fs = require('fs');
const path = require('path');

const commands = {
    useful: ['serverinfo', 'roleinfo', 'afk', 'remindme', 'poll', 'slowmode', 'ticket', 'avatar', 'warnhistory', 'warn', 'stealemoji', 'purgeuser', 'lockdown', 'unlock', 'nuke'],
    fun: ['ship', '8ball', 'headpat', 'bite', 'hug', 'boop', 'coinflip', 'trivia', 'confession', 'leaderboard', 'slots', 'pay', 'rob', 'rps', 'roulette']
};

const baseTemplate = (name) => `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${name}')
        .setDescription('Description for ${name}')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        await interaction.reply({ content: '${name} is under construction!', ephemeral: true });
    },
};
`;

const basePath = path.join(__dirname, 'commands');
if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

for (const [category, cmds] of Object.entries(commands)) {
    const catPath = path.join(basePath, category);
    if (!fs.existsSync(catPath)) fs.mkdirSync(catPath);

    for (const cmd of cmds) {
        const filePath = path.join(catPath, cmd + '.js');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, baseTemplate(cmd));
        }
    }
}
console.log('Scaffolding complete!');
