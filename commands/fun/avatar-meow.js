const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar-meow')
        .setDescription("Add cat ears to a user's avatar!")
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to catify').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            
            // Get avatar URL
            const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
            const avatar = await loadImage(avatarUrl);

            // Create canvas
            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');

            // Draw background to fill transparent avatars
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 512, 512);

            // Draw the avatar scaled down and shifted down to leave room for ears
            // Avatar size 412x412, centered X (50), shifted Y (100)
            ctx.drawImage(avatar, 50, 100, 412, 412);

            // Draw Left Ear
            // Outer Ear (Dark Grey)
            ctx.fillStyle = '#2c2f33'; 
            ctx.beginPath();
            ctx.moveTo(100, 150); // Bottom left
            ctx.lineTo(130, 20);  // Top tip
            ctx.lineTo(200, 120); // Bottom right
            ctx.fill();

            // Inner Ear (Pink)
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.moveTo(115, 140);
            ctx.lineTo(135, 45);
            ctx.lineTo(180, 115);
            ctx.fill();

            // Draw Right Ear
            // Outer Ear (Dark Grey)
            ctx.fillStyle = '#2c2f33';
            ctx.beginPath();
            ctx.moveTo(412, 150); // Bottom right
            ctx.lineTo(382, 20);  // Top tip
            ctx.lineTo(312, 120); // Bottom left
            ctx.fill();

            // Inner Ear (Pink)
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.moveTo(397, 140);
            ctx.lineTo(377, 45);
            ctx.lineTo(332, 115);
            ctx.fill();

            // Add some cute blush
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            ctx.beginPath();
            ctx.arc(150, 300, 40, 0, Math.PI * 2); // Left cheek
            ctx.fill();

            ctx.beginPath();
            ctx.arc(362, 300, 40, 0, Math.PI * 2); // Right cheek
            ctx.fill();

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'meow-avatar.png' });

            await interaction.editReply({ 
                content: `Meow! 🐾 Here is ${user}'s new look:`, 
                files: [attachment] 
            });

        } catch (error) {
            console.error('Error generating avatar-meow:', error);
            await interaction.editReply('❌ Failed to meowify the avatar. Something went wrong with the image processing.');
        }
    },
};
