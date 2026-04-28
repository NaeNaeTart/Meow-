const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calculate the love compatibility between two users! 💕')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
        .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user1 = interaction.options.getUser('user1');
            const user2 = interaction.options.getUser('user2') || interaction.user;

            // Deterministic percentage based on IDs so it's always the same for the same two users
            const idSum = BigInt(user1.id) + BigInt(user2.id);
            const percentage = Number(idSum % 101n); // 0-100

            let comment = '';
            let heartColor = '#FF69B4'; // Pink
            if (percentage > 90) { comment = 'Match made in heaven! 😻'; heartColor = '#FF1493'; }
            else if (percentage > 70) { comment = 'Very compatible! 😽'; heartColor = '#FF69B4'; }
            else if (percentage > 40) { comment = 'There is potential... 😺'; heartColor = '#FFA07A'; }
            else if (percentage > 20) { comment = 'Might be a bit rough... 😿'; heartColor = '#778899'; }
            else { comment = 'Like cats and dogs! 🙀'; heartColor = '#000000'; }

            // --- Canvas Rendering ---
            const canvas = createCanvas(700, 250);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#1e1f22';
            ctx.roundRect(0, 0, 700, 250, 20);
            ctx.fill();

            // Load Avatars
            const avatar1Url = user1.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar2Url = user2.displayAvatarURL({ extension: 'png', size: 256 });
            const [avatar1, avatar2] = await Promise.all([loadImage(avatar1Url), loadImage(avatar2Url)]);

            const drawAvatar = (img, x, y) => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + 75, y + 75, 75, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, x, y, 150, 150);
                ctx.restore();

                // Border
                ctx.strokeStyle = heartColor;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(x + 75, y + 75, 75, 0, Math.PI * 2, true);
                ctx.stroke();
            };

            drawAvatar(avatar1, 50, 50);
            drawAvatar(avatar2, 500, 50);

            // Draw Heart and Percentage in the middle
            ctx.fillStyle = heartColor;
            ctx.font = 'bold 70px "Segoe UI", "Arial", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${percentage}%`, 350, 120);

            ctx.font = 'italic 24px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#dbdee1';
            ctx.fillText(comment, 350, 160);

            // Progress Bar
            ctx.fillStyle = '#2b2d31';
            ctx.roundRect(250, 180, 200, 20, 10);
            ctx.fill();

            if (percentage > 0) {
                ctx.fillStyle = heartColor;
                ctx.roundRect(250, 180, 200 * (percentage / 100), 20, 10);
                ctx.fill();
            }

            // Names
            ctx.font = 'bold 20px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(user1.username, 125, 230);
            ctx.fillText(user2.username, 575, 230);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'ship.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error('Ship Error:', error);
            await interaction.editReply('❌ Failed to calculate compatibility due to an error.');
        }
    },
};
