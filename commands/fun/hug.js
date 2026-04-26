const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Give someone a virtual hug')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to hug').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const path = require('path');
        const fs = require('fs');
        
        const stashPath = path.join(__dirname, '../../Meow! stash');
        const hugFiles = ['Hug 1.webp', 'Hug 2.webp', 'Hug 3.jpg'];
        const selectedFile = hugFiles[Math.floor(Math.random() * hugFiles.length)];
        const filePath = path.join(stashPath, selectedFile);

        try {
            const buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();
            const attachment = new AttachmentBuilder(buffer, { name: `hug.${extension}` });

            const embed = new EmbedBuilder()
                .setDescription(`*<@${interaction.user.id}> hugs <@${target.id}> tightly!*`)
                .setImage(`attachment://hug.${extension}`)
                .setColor('#FFB6C1');

            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Hug Local Image Error:', error);
            await interaction.reply({ content: '❌ Failed to load the hug image from local storage.', ephemeral: true });
        }
    },
};
