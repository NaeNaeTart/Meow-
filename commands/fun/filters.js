const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply audio filters to the music! 🎶')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'None', value: 'none' },
                    { name: 'Bass Boost', value: 'bassboost' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Vaporwave', value: 'vaporwave' }
                )),
    
    async execute(interaction) {
        const filterType = interaction.options.getString('type');
        const musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue || !musicQueue.isPlaying) {
            return await interaction.reply({ content: '❌ Nothing is playing right now! 😿', flags: [MessageFlags.Ephemeral] });
        }

        musicQueue.filter = filterType;
        
        // Re-play the current song with the filter
        const song = musicQueue.currentSong;
        if (song) {
            // This is a bit tricky with createAudioResource. 
            // In a real bot, we'd use prism-media or similar to pass ffmpeg args.
            // For now, I'll just set the state and let the next song pick it up, 
            // or we can force a re-play of the current song if we want immediate effect.
            await interaction.reply(`✅ Set filter to **${filterType}**. It will apply to the current/next song! 🎶`);
            
            // To apply immediately, we'd need to stop and play again.
            // Let's try to restart the current song.
            const playMeow = require('./play-meow');
            const resource = playMeow.createFilteredResource(song.url, filterType);
            musicQueue.player.play(resource);
        }
    },
};
