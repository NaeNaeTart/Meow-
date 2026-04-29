const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fm')
        .setDescription('Last.fm integration! 🎵')
        .addSubcommand(sub => 
            sub.setName('set')
                .setDescription('Set your Last.fm username')
                .addStringOption(opt => opt.setName('username').setDescription('Your Last.fm username').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('now')
                .setDescription('Show what you are currently listening to'))
        .addSubcommand(sub =>
            sub.setName('toptracks')
                .setDescription('Show your top tracks of all time')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const apiKey = process.env.LASTFM_API_KEY;

        if (!apiKey) {
            return await interaction.reply({ content: '❌ Last.fm API Key is not configured! 😿', flags: [MessageFlags.Ephemeral] });
        }

        const guildConfigs = db.get('guild_configs.json') || {};
        if (!guildConfigs[interaction.guild.id]) guildConfigs[interaction.guild.id] = {};
        const config = guildConfigs[interaction.guild.id];
        if (!config.lastfm) config.lastfm = {};

        if (subcommand === 'set') {
            const fmUser = interaction.options.getString('username');
            config.lastfm[userId] = fmUser;
            db.save('guild_configs.json');
            await interaction.reply(`✅ Successfully linked your Last.fm as **${fmUser}**! 🎵`);

        } else if (subcommand === 'now') {
            const fmUser = config.lastfm[userId];
            if (!fmUser) {
                return await interaction.reply({ content: '❌ You haven\'t set your Last.fm username! Use `/fm set <username>`. 😿', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply();

            try {
                const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${fmUser}&api_key=${apiKey}&format=json&limit=1`);
                const data = await response.json();

                if (!data.recenttracks || !data.recenttracks.track[0]) {
                    return await interaction.editReply(`❌ Could not find any recent tracks for **${fmUser}**. 😿`);
                }

                const track = data.recenttracks.track[0];
                const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

                const embed = new EmbedBuilder()
                    .setTitle(isPlaying ? `🎵 Now Playing - ${fmUser}` : `🎵 Last Played - ${fmUser}`)
                    .setDescription(`**${track.name}**\nby **${track.artist['#text']}**`)
                    .setThumbnail(track.image[2]['#text'] || null)
                    .setColor('#D01F28')
                    .setFooter({ text: 'Last.fm', iconURL: 'https://www.last.fm/static/images/footer_logo@2x.49ca51948b0a.png' })
                    .setTimestamp();

                if (track.album['#text']) embed.addFields({ name: '💿 Album', value: track.album['#text'], inline: true });

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.editReply('❌ Something went wrong while fetching Last.fm data. 😿');
            }
        } else if (subcommand === 'toptracks') {
            const fmUser = config.lastfm[userId];
            if (!fmUser) return await interaction.reply({ content: '❌ Set your username first! `/fm set`.', flags: [MessageFlags.Ephemeral] });

            await interaction.deferReply();
            try {
                const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${fmUser}&api_key=${apiKey}&format=json&limit=5`);
                const data = await response.json();
                const tracks = data.toptracks.track;
                const list = tracks.map((t, i) => `${i + 1}. **${t.name}** by **${t.artist.name}** (${t.playcount} plays)`).join('\n');
                
                const embed = new EmbedBuilder()
                    .setTitle(`🏆 Top Tracks - ${fmUser}`)
                    .setDescription(list || 'No tracks found.')
                    .setColor('#D01F28')
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            } catch (e) {
                await interaction.editReply('❌ Error fetching top tracks. 😿');
            }
        }
    },
};
