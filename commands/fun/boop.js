const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boop')
        .setDescription('Boop someone on the nose')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to boop').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const path = require('path');
        const fs = require('fs');
        
        const stashPath = path.join(__dirname, '../../Meow! stash');
        const selectedFile = 'Boop 1.gif';
        const filePath = path.join(stashPath, selectedFile);

        try {
            const buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();
            const attachment = new AttachmentBuilder(buffer, { name: `boop.${extension}` });

            const embed = new EmbedBuilder()
                .setDescription(`*<@${interaction.user.id}> boops <@${target.id}> on the nose! Boop!*`)
                .setImage(`attachment://boop.${extension}`)
                .setColor('#FFB6C1');

            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Boop Local Image Error:', error);
            await interaction.reply({ content: '❌ Failed to load the boop image from local storage.', ephemeral: true });
        }
    },
};
