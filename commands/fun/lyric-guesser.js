const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const SONGS = [
    { snippet: "Never gonna give you up, never gonna let you down...", answer: "never gonna give you up", artist: "rick astley" },
    { snippet: "I'm a boykisser, you're a boykisser...", answer: "boykisser", artist: "unknown" },
    { snippet: "Is this the real life? Is this just fantasy?", answer: "bohemian rhapsody", artist: "queen" },
    { snippet: "I'm blue, da ba dee da ba daa...", answer: "blue", artist: "eiffel 65" },
    { snippet: "Somebody once told me the world is gonna roll me...", answer: "all star", artist: "smash mouth" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyric-game')
        .setDescription('Guess the song title from the snippet! 🎵'),
    
    async execute(interaction) {
        const song = SONGS[Math.floor(Math.random() * SONGS.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🎵 Guess the Song!')
            .setDescription(`\`\`\`\n"${song.snippet}"\n\`\`\``)
            .setFooter({ text: 'You have 15 seconds to answer with the title!' })
            .setColor('#FFB6C1')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async m => {
            if (m.content.toLowerCase().includes(song.answer)) {
                await m.reply('✨ **CORRECT!** You got it! 🐾');
            } else {
                await m.reply(`❌ Wrong! The answer was **${song.answer}** by **${song.artist}**. 😿`);
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                interaction.followUp(`⏰ Time's up! The answer was **${song.answer}**. 😿`);
            }
        });
    },
};
