const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play-meow')
        .setDescription('Play an MP3 file or add it to the queue! 🐾')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addAttachmentOption(option => option.setName('file').setDescription('The MP3 file to play').setRequired(true)),
    
    async execute(interaction) {
        const attachment = interaction.options.getAttachment('file');
        if (!attachment.contentType?.startsWith('audio/')) {
            return await interaction.reply({ content: '❌ Please upload a valid MP3 or audio file! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.reply({ content: '❌ You need to be in a voice channel first! 😿', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply();

        let musicQueue = interaction.client.musicQueues.get(interaction.guild.id);

        if (!musicQueue) {
            musicQueue = {
                player: createAudioPlayer(),
                connection: null,
                queue: [],
                isPlaying: false,
                currentSong: null,
                guildId: interaction.guild.id,
            };
            interaction.client.musicQueues.set(interaction.guild.id, musicQueue);

            // Set up player listeners only once
            musicQueue.player.on(AudioPlayerStatus.Idle, () => {
                module.exports.playNext(interaction.guild.id, interaction.client);
            });

            musicQueue.player.on('error', error => {
                console.error(`[Audio Player Error] Guild ${interaction.guild.id}: ${error.message}`);
                module.exports.playNext(interaction.guild.id, interaction.client);
            });
        }

        const song = {
            name: attachment.name,
            url: attachment.url,
            requester: interaction.user,
        };

        if (musicQueue.isPlaying) {
            musicQueue.queue.push(song);
            await interaction.editReply(`📝 Added to queue: **${song.name}** (Position: ${musicQueue.queue.length}) 🐾`);
        } else {
            musicQueue.currentSong = song;
            musicQueue.isPlaying = true;
            
            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                musicQueue.connection = connection;
                connection.subscribe(musicQueue.player);

                const resource = module.exports.createFilteredResource(song.url, musicQueue.filter);
                musicQueue.player.play(resource);
                
                await interaction.editReply(`🎶 Now playing: **${song.name}** 🐾`);
            } catch (error) {
                console.error(error);
                interaction.client.musicQueues.delete(interaction.guild.id);
                await interaction.editReply('Meow... I couldn\'t join the voice channel. 😿');
            }
        }
    },

    playNext(guildId, client) {
        const musicQueue = client.musicQueues.get(guildId);
        if (!musicQueue) return;

        if (musicQueue.queue.length === 0) {
            musicQueue.isPlaying = false;
            musicQueue.currentSong = null;
            
            // Optional: Leave after some time or immediately
            setTimeout(() => {
                const currentQueue = client.musicQueues.get(guildId);
                if (currentQueue && !currentQueue.isPlaying && currentQueue.queue.length === 0) {
                    if (currentQueue.connection) {
                        currentQueue.connection.destroy();
                    }
                    client.musicQueues.delete(guildId);
                }
            }, 30000); // 30 seconds of inactivity
            return;
        }

        const song = musicQueue.queue.shift();
        musicQueue.currentSong = song;
        musicQueue.isPlaying = true;

        const resource = module.exports.createFilteredResource(song.url, musicQueue.filter);
        musicQueue.player.play(resource);
    },

    createFilteredResource(url, filterType) {
        if (!filterType || filterType === 'none') {
            return createAudioResource(url);
        }

        let ffmpegArgs = [
            '-i', url,
            '-analyzeduration', '0',
            '-loglevel', '0',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
        ];

        if (filterType === 'bassboost') {
            ffmpegArgs.push('-af', 'equalizer=f=40:width_type=h:width=50:g=10');
        } else if (filterType === 'nightcore') {
            ffmpegArgs.push('-af', 'aresample=48000,asetrate=48000*1.25');
        } else if (filterType === 'vaporwave') {
            ffmpegArgs.push('-af', 'aresample=48000,asetrate=48000*0.8');
        }

        // We use spawn to run ffmpeg
        const { spawn } = require('child_process');
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);

        return createAudioResource(ffmpeg.stdout, {
            inputType: require('@discordjs/voice').StreamType.Raw,
        });
    }
};
