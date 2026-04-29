const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop-meow')
        .setDescription('Stop the music and clear the queue! 🐾')
        .setIntegrationTypes([0])
        .setContexts([0]),
    
    async execute(interaction) {
        const musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue) {
            return await interaction.reply({ content: '❌ There is no active music session! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== musicQueue.connection.joinConfig.channelId) {
            return await interaction.reply({ content: '❌ You need to be in the same voice channel to stop the music! 😿', flags: [MessageFlags.Ephemeral] });
        }

        musicQueue.queue = [];
        musicQueue.isPlaying = false;
        musicQueue.player.stop(true);
        
        if (musicQueue.connection) {
            musicQueue.connection.destroy();
        }
        
        interaction.client.musicQueues.delete(interaction.guild.id);
        
        await interaction.reply('⏹️ Stopped the music and cleared the litterbox queue! 🐾');
    },
};
