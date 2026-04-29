const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip-meow')
        .setDescription('Skip the currently playing song! 🐾')
        .setIntegrationTypes([0])
        .setContexts([0]),
    
    async execute(interaction) {
        const musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue || !musicQueue.isPlaying) {
            return await interaction.reply({ content: '❌ There is nothing playing right now! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== musicQueue.connection.joinConfig.channelId) {
            return await interaction.reply({ content: '❌ You need to be in the same voice channel to skip! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const skippedSong = musicQueue.currentSong;
        musicQueue.player.stop(); // This will trigger the Idle status and playNext
        
        await interaction.reply(`⏭️ Skipped: **${skippedSong.name}** 🐾`);
    },
};
