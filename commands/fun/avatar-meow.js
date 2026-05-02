const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar-meow')
        .setDescription("Add cat ears to a user's avatar!")
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to catify').setRequired(false))
        .addBooleanOption(option => option.setName('server-profile').setDescription('Use the server-specific profile avatar').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            const useServerProfile = interaction.options.getBoolean('server-profile') || false;
            
            let avatarUrl;
            if (useServerProfile && interaction.guild) {
                const member = await interaction.guild.members.fetch(user.id).catch(() => null);
                avatarUrl = member ? member.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL({ extension: 'png', size: 512 });
            } else {
                avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
            }

            const avatar = await loadImage(avatarUrl);
            const sharp = require('sharp');

            // Create canvas
            const canvas = createCanvas(600, 600);
            const ctx = canvas.getContext('2d');

            // --- Glassmorphism Background ---
            // Draw a blurred, zoomed-in version of the avatar as background
            const avatarResp = await fetch(avatarUrl);
            const avatarArrayBuffer = await avatarResp.arrayBuffer();
            const avatarBuffer = Buffer.from(avatarArrayBuffer);
            
            const blurredBuffer = await sharp(avatarBuffer)
                .resize(800, 800, { fit: 'cover' })
                .blur(30)
                .modulate({ brightness: 0.6 })
                .toBuffer();
            
            const blurredBackground = await loadImage(blurredBuffer);
            ctx.drawImage(blurredBackground, -100, -100, 800, 800);

            // Draw a semi-transparent overlay to enhance the glass effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, 600, 600);

            // --- Main Avatar ---
            // Draw a nice rounded frame for the avatar
            const avatarSize = 420;
            const avatarX = (600 - avatarSize) / 2;
            const avatarY = 120;
            
            ctx.save();
            // Create rounded rectangle path
            const r = 30;
            ctx.beginPath();
            ctx.moveTo(avatarX + r, avatarY);
            ctx.lineTo(avatarX + avatarSize - r, avatarY);
            ctx.quadraticCurveTo(avatarX + avatarSize, avatarY, avatarX + avatarSize, avatarY + r);
            ctx.lineTo(avatarX + avatarSize, avatarY + avatarSize - r);
            ctx.quadraticCurveTo(avatarX + avatarSize, avatarY + avatarSize, avatarX + avatarSize - r, avatarY + avatarSize);
            ctx.lineTo(avatarX + r, avatarY + avatarSize);
            ctx.quadraticCurveTo(avatarX, avatarY + avatarSize, avatarX, avatarY + avatarSize - r);
            ctx.lineTo(avatarX, avatarY + r);
            ctx.quadraticCurveTo(avatarX, avatarY, avatarX + r, avatarY);
            ctx.closePath();
            ctx.clip();
            
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            // Frame Border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 10;
            ctx.stroke();

            // --- Improved Cat Ears ---
            const drawEar = (x, y, isRight) => {
                ctx.save();
                if (isRight) {
                    ctx.translate(x, y);
                    ctx.scale(-1, 1);
                    ctx.translate(-x, -y);
                }

                // Outer Ear
                ctx.fillStyle = '#2c2f33';
                ctx.beginPath();
                ctx.moveTo(x - 60, y + 80);
                ctx.bezierCurveTo(x - 50, y - 20, x + 30, y - 40, x + 70, y + 60);
                ctx.fill();

                // Inner Ear
                ctx.fillStyle = '#ffb6c1';
                ctx.beginPath();
                ctx.moveTo(x - 40, y + 70);
                ctx.bezierCurveTo(x - 30, y + 10, x + 20, y, x + 50, y + 60);
                ctx.fill();
                
                ctx.restore();
            };

            drawEar(avatarX + 80, avatarY + 20, false);
            drawEar(avatarX + avatarSize - 80, avatarY + 20, true);

            // --- Soft Blush ---
            const drawBlush = (x, y) => {
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 45);
                gradient.addColorStop(0, 'rgba(255, 182, 193, 0.7)');
                gradient.addColorStop(1, 'rgba(255, 182, 193, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 45, 0, Math.PI * 2);
                ctx.fill();
            };

            drawBlush(avatarX + 100, avatarY + 280);
            drawBlush(avatarX + avatarSize - 100, avatarY + 280);

            // --- Text Label ---
            ctx.font = 'bold 32px "Inter"';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText('Meowified! 🐾', 300, 80);

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
