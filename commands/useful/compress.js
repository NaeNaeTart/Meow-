const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compress')
        .setDescription('Compress or deep-fry an image')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addAttachmentOption(option => 
            option.setName('image')
                .setDescription('The image to compress')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quality')
                .setDescription('Quality (1-100, lower is smaller/crunchier, default 50)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('scale')
                .setDescription('Scale size percentage (1-100, default 100 = no resize)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('format')
                .setDescription('Format to convert to')
                .addChoices(
                    { name: 'JPEG', value: 'jpeg' },
                    { name: 'PNG', value: 'png' },
                    { name: 'WebP', value: 'webp' }
                )
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const attachment = interaction.options.getAttachment('image');
        const quality = interaction.options.getInteger('quality') || 50;
        const scale = interaction.options.getInteger('scale') || 100;
        const format = interaction.options.getString('format') || 'jpeg';

        if (!attachment.contentType?.startsWith('image/')) {
            return await interaction.editReply('❌ Please provide a valid image file!');
        }

        try {
            const response = await fetch(attachment.url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            let pipeline = sharp(buffer);

            if (scale !== 100) {
                const metadata = await pipeline.metadata();
                const width = Math.max(1, Math.round(metadata.width * (scale / 100)));
                pipeline = pipeline.resize(width);
            }

            if (format === 'jpeg') {
                pipeline = pipeline.jpeg({ quality: quality, mozjpeg: true, chromaSubsampling: '4:2:0' });
            } else if (format === 'png') {
                const colors = Math.max(2, Math.floor(256 * (quality / 100)));
                pipeline = pipeline.png({ palette: true, colors: colors, effort: 10 });
            } else if (format === 'webp') {
                pipeline = pipeline.webp({ quality: quality, effort: 6 });
            }

            const compressedBuffer = await pipeline.toBuffer();
            const newAttachment = new AttachmentBuilder(compressedBuffer, { name: `compressed.${format}` });

            const originalKb = (buffer.length / 1024).toFixed(2);
            const newKb = (compressedBuffer.length / 1024).toFixed(2);
            const emoji = compressedBuffer.length < buffer.length ? '✅' : '⚠️';

            await interaction.editReply({ 
                content: `${emoji} Compressed from **${originalKb} KB** to **${newKb} KB** (Quality: ${quality}, Scale: ${scale}%, Format: ${format.toUpperCase()})`,
                files: [newAttachment] 
            });
        } catch (error) {
            console.error('Compression error:', error);
            await interaction.editReply('❌ Failed to compress the image. It might be an unsupported format.');
        }
    },
};
