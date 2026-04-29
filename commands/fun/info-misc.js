const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('wikipedia')
            .setDescription('Search Wikipedia for a summary!')
            .addStringOption(opt => opt.setName('query').setDescription('What to search for').setRequired(true)),
        new SlashCommandBuilder()
            .setName('duck')
            .setDescription('Get a random duck pic! 🦆')
            .setIntegrationTypes([0, 1])
            .setContexts([0, 1, 2]),
        new SlashCommandBuilder()
            .setName('color')
            .setDescription('View a specific hex color!')
            .addStringOption(opt => opt.setName('hex').setDescription('Hex code (e.g. #ff0000)').setRequired(true)),
        new SlashCommandBuilder()
            .setName('achievement')
            .setDescription('Generate a Minecraft achievement!')
            .addStringOption(opt => opt.setName('text').setDescription('Achievement text').setRequired(true))
            .addStringOption(opt => opt.setName('title').setDescription('Achievement title (default: Achievement Get!)').setRequired(false))
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'wikipedia') {
            await interaction.deferReply();
            const query = interaction.options.getString('query');
            try {
                const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                const data = await response.json();
                
                if (data.type === 'disambiguation' || data.title === 'Not found.') {
                    return await interaction.editReply(`❌ No summary found for "**${query}**". 😿`);
                }

                const embed = new EmbedBuilder()
                    .setTitle(data.title)
                    .setURL(data.content_urls.desktop.page)
                    .setDescription(data.extract)
                    .setThumbnail(data.thumbnail ? data.thumbnail.source : null)
                    .setColor('#FFFFFF')
                    .setFooter({ text: 'Wikipedia Summary' });

                await interaction.editReply({ embeds: [embed] });
            } catch (e) {
                await interaction.editReply('❌ Error fetching Wikipedia data. 😿');
            }

        } else if (commandName === 'duck') {
            await interaction.deferReply();
            try {
                const response = await fetch('https://random-d.uk/api/v2/random');
                const data = await response.json();
                await interaction.editReply(data.url);
            } catch (e) {
                await interaction.editReply('❌ No ducks found! 🦆😿');
            }

        } else if (commandName === 'color') {
            const hex = interaction.options.getString('hex').replace('#', '');
            if (!/^[0-9A-F]{6}$/i.test(hex)) return interaction.reply({ content: '❌ Invalid hex code! Use format #RRGGBB', ephemeral: true });

            const canvas = createCanvas(200, 200);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = `#${hex}`;
            ctx.fillRect(0, 0, 200, 200);
            
            const buffer = canvas.toBuffer();
            const attachment = new AttachmentBuilder(buffer, { name: 'color.png' });
            
            const embed = new EmbedBuilder()
                .setTitle(`Color: #${hex.toUpperCase()}`)
                .setImage('attachment://color.png')
                .setColor(`#${hex}`);

            await interaction.reply({ embeds: [embed], files: [attachment] });

        } else if (commandName === 'achievement') {
            const text = interaction.options.getString('text');
            const title = interaction.options.getString('title') || 'Achievement Get!';
            
            // Note: In a real bot we'd use a canvas template. For now, a simplified version.
            const canvas = createCanvas(320, 64);
            const ctx = canvas.getContext('2d');
            
            // BG (Simplified Minecraft UI look)
            ctx.fillStyle = '#212121';
            ctx.fillRect(0, 0, 320, 64);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, 316, 60);

            ctx.fillStyle = '#FFFF00';
            ctx.font = 'bold 16px "Segoe UI"';
            ctx.fillText(title, 60, 25);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px "Segoe UI"';
            ctx.fillText(text, 60, 45);

            // Icon (Simplified yellow square for "item")
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(15, 12, 40, 40);

            const buffer = canvas.toBuffer();
            const attachment = new AttachmentBuilder(buffer, { name: 'achievement.png' });
            await interaction.reply({ files: [attachment] });
        }
    },
};
