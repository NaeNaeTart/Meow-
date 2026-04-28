const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uwuify')
        .setDescription('Twanswate youw text intwo uwu speak! >w<')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option => option.setName('text').setDescription('The text to uwuify').setRequired(true)),
    async execute(interaction) {
        let text = interaction.options.getString('text');

        // UwUification rules
        const faces = ['(・`ω´・)', ';;w;;', 'owo', 'UwU', '>w<', '^w^'];
        
        text = text.replace(/(?:r|l)/g, 'w');
        text = text.replace(/(?:R|L)/g, 'W');
        text = text.replace(/n([aeiou])/g, 'ny$1');
        text = text.replace(/N([aeiou])/g, 'Ny$1');
        text = text.replace(/N([AEIOU])/g, 'Ny$1');
        text = text.replace(/ove/g, 'uv');
        text = text.replace(/!+/g, ' ' + faces[Math.floor(Math.random() * faces.length)] + ' ');

        // Stuttering (chance to repeat the first letter of a word)
        text = text.split(' ').map(word => {
            if (word.length > 2 && Math.random() > 0.8) {
                return `${word[0]}-${word}`;
            }
            return word;
        }).join(' ');

        await interaction.reply(text);
    },
};
