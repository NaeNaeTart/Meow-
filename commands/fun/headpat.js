const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('headpat')
        .setDescription('Give someone a headpat')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to headpat').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const db = require('../../db');
        
        let headpats = db.get('headpats.json');
        if (!headpats) {
            headpats = {};
            db.set('headpats.json', headpats);
        }

        // Increment count
        headpats[target.id] = (headpats[target.id] || 0) + 1;
        db.save('headpats.json');

        const gifs = [
            'https://media.giphy.com/media/L2z7jvlwyvVUX2P4D4/giphy.gif',
            'https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif',
            'https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif'
        ];

        const embed = new EmbedBuilder()
            .setDescription(`*<@${interaction.user.id}> gently headpats <@${target.id}>*\n\nThey have now received **${headpats[target.id]}** headpats!`)
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setColor('#FFB6C1');

        await interaction.reply({ embeds: [embed] });
    },
};
