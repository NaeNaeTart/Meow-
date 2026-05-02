const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Give someone a virtual hug')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to hug').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const stashPath = path.join(__dirname, '../../Meow! stash');

        const getAttachmentAndEmbed = async () => {
            const sharp = require('sharp');
            // Flawlessly scan for any files starting with "Hug"
            const files = fs.readdirSync(stashPath).filter(f => f.toLowerCase().startsWith('hug'));
            if (files.length === 0) return null;

            const selectedFile = files[Math.floor(Math.random() * files.length)];
            const filePath = path.join(stashPath, selectedFile);
            let buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();
            
            // Normalize image size using Sharp
            try {
                let pipeline = sharp(buffer);
                const metadata = await pipeline.metadata();
                
                // If it's a GIF, we need to be careful. Sharp handles animated GIFs if we use { animated: true }
                if (extension.toLowerCase() === 'gif') {
                    pipeline = sharp(buffer, { animated: true });
                }

                // Ensure minimum width of 600px for good embed display
                if (metadata.width < 600) {
                    pipeline = pipeline.resize({ width: 600 });
                } else if (metadata.width > 1200) {
                    // Downscale huge images to save bandwidth
                    pipeline = pipeline.resize({ width: 1200 });
                }

                buffer = await pipeline.toBuffer();
            } catch (e) {
                console.error('Sharp processing error:', e);
                // Fallback to original buffer if processing fails
            }

            const fileName = `${selectedFile.split('.')[0]}-${Date.now()}.png`.replace(/\s+/g, '_');
            const attachment = new AttachmentBuilder(buffer, { name: fileName });

            let desc = `*<@${interaction.user.id}> hugs <@${target.id}> tightly!*`;
            if (selectedFile.includes('NOOT')) {
                desc += `\n\n🎨 *Image credit: <@846490523509194822>*`;
            }

            const embed = new EmbedBuilder()
                .setDescription(desc)
                .setImage(`attachment://${fileName}`)
                .setColor('#FFB6C1');

            return { attachment, embed };
        };

        try {
            await interaction.deferReply();
            const initial = await getAttachmentAndEmbed();
            if (!initial) return await interaction.editReply({ content: '❌ No hug images found!' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('reroll_hug')
                    .setLabel('Reroll 🐾')
                    .setStyle(ButtonStyle.Secondary)
            );

            const response = await interaction.editReply({ 
                embeds: [initial.embed], 
                files: [initial.attachment],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                time: 60000 
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: "Only the hugger can reroll!", ephemeral: true });
                
                const next = await getAttachmentAndEmbed();
                await i.update({ embeds: [next.embed], files: [next.attachment], components: [row] });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error('Hug Error:', error);
            await interaction.reply({ content: '❌ Failed to load the hug image.', ephemeral: true });
        }
    },
};
