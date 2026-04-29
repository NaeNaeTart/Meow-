const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tweet')
        .setDescription('Generate a fake tweet from a user! 🐦')
        .addStringOption(option => option.setName('text').setDescription('What the tweet should say').setRequired(true))
        .addUserOption(option => option.setName('user').setDescription('The user who is tweeting (defaults to you)').setRequired(false))
        .addBooleanOption(option => option.setName('verified').setDescription('Should they be verified?').setRequired(false)),
    
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const user = interaction.options.getUser('user') || interaction.user;
        const verified = interaction.options.getBoolean('verified') || false;

        await interaction.deferReply();

        try {
            const canvas = createCanvas(600, 250);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#15202b'; // Twitter dark mode
            ctx.fillRect(0, 0, 600, 250);

            // Avatar
            const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
            const avatar = await loadImage(avatarUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, 60, 30, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 30, 30, 60, 60);
            ctx.restore();

            // Name
            ctx.font = 'bold 20px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(user.username, 105, 55);

            // Verified Icon (if applicable)
            if (verified) {
                // For simplicity, I'll draw a small blue circle with a checkmark
                const nameWidth = ctx.measureText(user.username).width;
                ctx.fillStyle = '#1d9bf0';
                ctx.beginPath();
                ctx.arc(105 + nameWidth + 15, 48, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(105 + nameWidth + 12, 48);
                ctx.lineTo(105 + nameWidth + 14, 50);
                ctx.lineTo(105 + nameWidth + 18, 46);
                ctx.stroke();
            }

            // Username
            ctx.font = 'normal 16px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#8899a6';
            ctx.fillText(`@${user.username.toLowerCase()}`, 105, 80);

            // Content
            ctx.font = 'normal 22px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#ffffff';
            
            const words = text.split(' ');
            let line = '';
            let lineY = 120;
            const maxWidth = 540;

            for(let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, 30, lineY);
                    line = words[n] + ' ';
                    lineY += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 30, lineY);

            // Date
            ctx.font = 'normal 14px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#8899a6';
            ctx.fillText(new Date().toLocaleString(), 30, 220);

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'tweet.png' });

            await interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Something went wrong while generating the tweet. 😿');
        }
    },
};
