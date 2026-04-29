const { SlashCommandBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('Convert text into large ASCII characters! ⌨️')
        .addStringOption(option => option.setName('text').setDescription('The text to convert').setRequired(true)),
    
    async execute(interaction) {
        const text = interaction.options.getString('text');

        if (text.length > 20) {
            return await interaction.reply({ content: '❌ Please keep the text under 20 characters for the best result! 😿', ephemeral: true });
        }

        figlet(text, (err, data) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: '❌ Something went wrong while generating ASCII art. 😿', ephemeral: true });
            }

            if (data.length > 2000) {
                return interaction.reply({ content: '❌ The generated ASCII art is too big for Discord! 😿', ephemeral: true });
            }

            interaction.reply(`\`\`\`\n${data}\n\`\`\``);
        });
    },
};
