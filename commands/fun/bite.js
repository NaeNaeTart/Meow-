const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bite')
        .setDescription('Bite someone!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to bite').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const stashPath = path.join(__dirname, '../../Meow! stash');

        const getAttachmentAndEmbed = () => {
            // Flawlessly scan for any files starting with "Bite"
            const files = fs.readdirSync(stashPath).filter(f => f.toLowerCase().startsWith('bite'));
            if (files.length === 0) return null;

            const selectedFile = files[Math.floor(Math.random() * files.length)];
            const filePath = path.join(stashPath, selectedFile);
            const buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();
            const fileName = `${selectedFile.split('.')[0]}-${Date.now()}.${extension}`.replace(/\s+/g, '_');
            const attachment = new AttachmentBuilder(buffer, { name: fileName });

            let desc = `*<@${interaction.user.id}> bites <@${target.id}>! CHOMP!*`;
            if (selectedFile.includes('NOOT')) {
                desc += `\n\n🎨 *Image credit: <@846490523509194822>*`;
            }

            const embed = new EmbedBuilder()
                .setDescription(desc)
                .setImage(`attachment://${fileName}`)
                .setColor('#FF0000');

            return { attachment, embed };
        };

        try {
            const initial = getAttachmentAndEmbed();
            if (!initial) return await interaction.reply({ content: '❌ No bite images found!', ephemeral: true });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('reroll_bite')
                    .setLabel('Reroll 🐾')
                    .setStyle(ButtonStyle.Secondary)
            );

            const response = await interaction.reply({ 
                embeds: [initial.embed], 
                files: [initial.attachment],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                time: 60000 
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: "Only the biter can reroll!", ephemeral: true });
                
                const next = getAttachmentAndEmbed();
                await i.update({ embeds: [next.embed], files: [next.attachment], components: [row] });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error('Bite Error:', error);
            await interaction.reply({ content: '❌ Failed to load the bite image.', ephemeral: true });
        }
    },
};
