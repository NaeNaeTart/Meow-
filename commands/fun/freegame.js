const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('freegame')
        .setDescription('Get a random free-to-play game recommendation!'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const res = await fetch('https://www.freetogame.com/api/games');
            const games = await res.json();
            
            if (!Array.isArray(games)) throw new Error('Invalid API response');
            
            const game = games[Math.floor(Math.random() * games.length)];

            const embed = new EmbedBuilder()
                .setTitle(game.title)
                .setURL(game.game_url)
                .setDescription(game.short_description)
                .setImage(game.thumbnail)
                .addFields(
                    { name: 'Genre', value: game.genre, inline: true },
                    { name: 'Platform', value: game.platform, inline: true },
                    { name: 'Developer', value: game.developer, inline: true }
                )
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('FreeGame Error:', error);
            await interaction.editReply('❌ Failed to fetch a free game. Try again later!');
        }
    }
};
