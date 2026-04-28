const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme-maker')
        .setDescription('Create a quick cat or boykisser meme! 🎨')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option => 
            option.setName('template')
                .setDescription('Choose your meme template')
                .setRequired(true)
                .addChoices(
                    { name: 'Boykisser (You like... don\'t you?)', value: 'boykisser' },
                    { name: 'Grumpy Cat', value: 'grumpy' },
                    { name: 'Shocked Cat', value: 'shocked' },
                    { name: 'Stare Cat', value: 'stare' }
                ))
        .addStringOption(option => option.setName('text').setDescription('The text for your meme').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const template = interaction.options.getString('template');
            const text = interaction.options.getString('text');

            const templates = {
                boykisser: 'https://i.imgur.com/v9wGvH0.png',
                grumpy: 'https://i.imgur.com/Kue4tH3.jpeg',
                shocked: 'https://i.imgur.com/Ym6E6zH.jpeg',
                stare: 'https://i.imgur.com/Fm6y77A.jpeg'
            };

            const image = await loadImage(templates[template]);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            // Configure text style
            ctx.font = `bold ${Math.floor(canvas.width / 12)}px "Impact", "Arial", sans-serif`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.floor(canvas.width / 150);
            ctx.textAlign = 'center';

            // Wrap text logic
            const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
                const words = text.split(' ');
                let line = '';
                let testY = y;

                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    let metrics = context.measureText(testLine);
                    let testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, testY);
                        context.strokeText(line, x, testY);
                        line = words[n] + ' ';
                        testY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                context.fillText(line, x, testY);
                context.strokeText(line, x, testY);
            };

            // Position text (usually at the top or bottom depending on template)
            // For boykisser, we'll put it at the bottom.
            const textY = canvas.height * 0.85;
            wrapText(ctx, text.toUpperCase(), canvas.width / 2, textY, canvas.width * 0.9, canvas.width / 10);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'meme.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error('Meme Maker Error:', error);
            await interaction.editReply('❌ Failed to create meme. The cat ate my canvas! 😿');
        }
    },
};
