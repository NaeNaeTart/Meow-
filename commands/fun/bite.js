const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bite')
        .setDescription('Bite someone!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to bite').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const path = require('path');
        const fs = require('fs');
        
        const stashPath = path.join(__dirname, '../../Meow! stash');
        const selectedFile = 'Bite 1.webp';
        const filePath = path.join(stashPath, selectedFile);

        try {
            const buffer = fs.readFileSync(filePath);
            const extension = selectedFile.split('.').pop();
            const attachment = new AttachmentBuilder(buffer, { name: `bite.${extension}` });

            const embed = new EmbedBuilder()
                .setDescription(`*<@${interaction.user.id}> bites <@${target.id}>! CHOMP!*`)
                .setImage(`attachment://bite.${extension}`)
                .setColor('#FF0000');

            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Bite Local Image Error:', error);
            await interaction.reply({ content: '❌ Failed to load the bite image from local storage.', ephemeral: true });
        }
    },
};
