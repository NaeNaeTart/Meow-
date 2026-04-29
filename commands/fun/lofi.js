const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lofi-radio')
        .setDescription('Stream 24/7 lo-fi beats! 🎧'),
    
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.reply({ content: '❌ You need to be in a voice channel first! 😿', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply();

        // A reliable 24/7 lo-fi stream URL (MP3 stream)
        // Note: Using a public MP3 stream is more stable than YT for this implementation
        const lofiStreamUrl = 'http://lofi.stream.laut.fm/lofi'; 

        let musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue) {
            musicQueue = {
                player: createAudioPlayer(),
                connection: null,
                queue: [],
                isPlaying: true,
                currentSong: { name: '24/7 Lo-Fi Radio', url: lofiStreamUrl },
                guildId: interaction.guild.id,
            };
            interaction.client.musicQueues.set(interaction.guild.id, musicQueue);
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            musicQueue.connection = connection;
            connection.subscribe(musicQueue.player);

            const resource = createAudioResource(lofiStreamUrl);
            musicQueue.player.play(resource);
            
            await interaction.editReply('🎶 **Lo-Fi Radio** is now purring in your ear... 🎧🐾');
        } catch (error) {
            console.error(error);
            await interaction.editReply('Meow... I couldn\'t start the radio. 😿');
        }
    },
};
