const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your beautiful kawaii profile! ✨')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addUserOption(option => option.setName('target').setDescription('The user to view').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            const userId = user.id;

            // Fetch data
            const ecoData = db.get('economy.json') || { users: {} };
            const marriages = db.get('marriages.json') || {};
            const pets = db.get('pets.json') || {};
            const headpats = db.get('headpats.json') || {};

            const balance = ecoData.users[userId]?.balance || 0;
            const partnerId = marriages[userId];
            const myPet = pets[userId];
            const patCount = headpats[userId] || 0;

            let partnerName = 'Single 💔';
            if (partnerId) {
                try {
                    const partnerUser = await interaction.client.users.fetch(partnerId);
                    partnerName = `Married to ${partnerUser.username} 💕`;
                } catch (e) {
                    partnerName = 'Married 💕';
                }
            }

            let petInfo = 'No pet 😿';
            if (myPet) {
                const emojis = { kitten: '🐱', puppy: '🐶', boykisser: '😽' };
                petInfo = `${emojis[myPet.type]} ${myPet.name} (${myPet.hunger}% Hunger)`;
            }

            // --- Canvas Rendering ---
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#1e1f22';
            ctx.roundRect(0, 0, 800, 400, 20);
            ctx.fill();

            // Accent Header Strip
            ctx.fillStyle = '#FFB6C1'; // Light pink accent
            ctx.beginPath();
            ctx.roundRect(0, 0, 800, 120, { tl: 20, tr: 20, bl: 0, br: 0 });
            ctx.fill();

            // Load Avatar
            const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar = await loadImage(avatarUrl);

            // Draw Avatar with border
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 50, 50, 200, 200);
            ctx.restore();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
            ctx.stroke();

            // Username
            ctx.font = 'bold 48px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(user.username, 300, 100);

            // Stats Section
            ctx.font = 'bold 24px "Segoe UI", "Arial", sans-serif';
            
            // Economy
            ctx.fillStyle = '#FF69B4'; // Hot pink
            ctx.fillText('💋 Kisses Balance:', 300, 180);
            ctx.fillStyle = '#dbdee1';
            ctx.fillText(`${balance.toLocaleString()}`, 300, 215);

            // Marriage
            ctx.fillStyle = '#FF1493'; // Deep pink
            ctx.fillText('💒 Status:', 300, 280);
            ctx.fillStyle = '#dbdee1';
            ctx.fillText(partnerName, 300, 315);

            // Pet
            ctx.fillStyle = '#FFA07A'; // Salmon
            ctx.fillText('🐾 Pet:', 550, 180);
            ctx.fillStyle = '#dbdee1';
            ctx.fillText(petInfo, 550, 215);

            // Headpats
            ctx.fillStyle = '#87CEEB'; // Sky blue
            ctx.fillText('✋ Headpats Received:', 550, 280);
            ctx.fillStyle = '#dbdee1';
            ctx.fillText(`${patCount.toLocaleString()}`, 550, 315);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (error) {
            console.error('Profile Error:', error);
            await interaction.editReply('❌ Failed to generate profile due to an error.');
        }
    },
};
