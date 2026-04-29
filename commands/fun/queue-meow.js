const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue-meow')
        .setDescription('See what\'s playing and what\'s next in the queue! 🐾')
        .setIntegrationTypes([0])
        .setContexts([0]),
    
    async execute(interaction) {
        const musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue || (!musicQueue.isPlaying && musicQueue.queue.length === 0)) {
            return await interaction.reply({ content: '❌ The queue is currently empty! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎶 Meow Music Queue 🐾')
            .setColor('#FFB6C1')
            .setTimestamp();

        if (musicQueue.currentSong) {
            embed.addFields({ 
                name: '▶️ Currently Playing', 
                value: `**${musicQueue.currentSong.name}** \n(Requested by: ${musicQueue.currentSong.requester})` 
            });
        }

        if (musicQueue.queue.length > 0) {
            const queueList = musicQueue.queue
                .slice(0, 10)
                .map((song, index) => `${index + 1}. **${song.name}** (by ${song.requester.username})`)
                .join('\n');
            
            const remaining = musicQueue.queue.length > 10 ? `\n*...and ${musicQueue.queue.length - 10} more songs*` : '';
            
            embed.addFields({ 
                name: '📋 Upcoming Songs', 
                value: queueList + remaining 
            });
        } else {
            embed.addFields({ name: '📋 Upcoming Songs', value: 'No songs in queue. Use `/play-meow` to add more!' });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
