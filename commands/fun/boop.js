const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boop')
        .setDescription('Boop someone on the nose')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to boop').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const stashPath = path.join(__dirname, '../../Meow! stash');

        const getAttachmentAndEmbed = async () => {
            const sharp = require('sharp');
            // Flawlessly scan for any files starting with "Boop"
            const files = fs.readdirSync(stashPath).filter(f => f.toLowerCase().startsWith('boop'));
            if (files.length === 0) return null;

            const selectedFile = files[Math.floor(Math.random() * files.length)];
            const filePath = path.join(stashPath, selectedFile);
            let buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();

            // Normalize image size using Sharp
            try {
                let pipeline = sharp(buffer);
                const metadata = await pipeline.metadata();
                
                if (extension.toLowerCase() === 'gif') {
                    pipeline = sharp(buffer, { animated: true });
                }

                if (metadata.width < 600) {
                    pipeline = pipeline.resize({ width: 600 });
                } else if (metadata.width > 1200) {
                    pipeline = pipeline.resize({ width: 1200 });
                }

                buffer = await pipeline.toBuffer();
            } catch (e) {
                console.error('Sharp processing error:', e);
            }

            const fileName = `${selectedFile.split('.')[0]}-${Date.now()}.png`.replace(/\s+/g, '_');
            const attachment = new AttachmentBuilder(buffer, { name: fileName });

            let desc = `*<@${interaction.user.id}> boops <@${target.id}> on the nose! Boop!*`;
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
            if (!initial) return await interaction.editReply({ content: '❌ No boop images found!' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('reroll_boop')
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
                if (i.user.id !== interaction.user.id) return i.reply({ content: "Only the booper can reroll!", ephemeral: true });
                
                const next = await getAttachmentAndEmbed();
                await i.update({ embeds: [next.embed], files: [next.attachment], components: [row] });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error('Boop Error:', error);
            await interaction.reply({ content: '❌ Failed to load the boop image.', ephemeral: true });
        }
    },
};
