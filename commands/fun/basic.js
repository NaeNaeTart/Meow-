const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Replies with Pong!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('meow')
            .setDescription('Replies with a meow!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('getmeowed')
            .setDescription('Send a "Get Meowed" image to someone!')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2])
            .addUserOption(option => option.setName('target').setDescription('The user to meow at').setRequired(false))
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'ping') {
            await interaction.reply('Pong!');
        } else if (commandName === 'meow') {
            await interaction.reply('Meow! 🐾');
        } else if (commandName === 'getmeowed') {
            const target = interaction.options.getUser('target');
            const gifUrl = 'https://media.discordapp.net/attachments/1473061637396103342/1473061637928910908/1467204479026987069.gif?ex=69ee7d0e&is=69ed2b8e&hm=9ed79dead3b5462536969f8fc846ea922396742666727d4746dd3fc21770359c&=';
            
            if (target) {
                await interaction.reply(`Get meowed, bitch ${target} \n${gifUrl}`);
            } else {
                await interaction.reply(`Get meowed, bitch! \n${gifUrl}`);
            }
        }
    },
};
