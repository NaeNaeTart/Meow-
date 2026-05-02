const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: [
        new ContextMenuCommandBuilder()
            .setName('Meowify Message')
            .setType(ApplicationCommandType.Message),
        new ContextMenuCommandBuilder()
            .setName('Dogify Message')
            .setType(ApplicationCommandType.Message)
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;
        const isDog = commandName === 'Dogify Message';
        const petType = isDog ? 'dog' : 'cat';
        const message = interaction.targetMessage;
        const author = message.author;
        const originalContent = message.content || "*No text content*";

        await interaction.deferReply();

        const db = require('../../db');
        const { createCanvas, loadImage } = require('canvas');
        const { AttachmentBuilder } = require('discord.js');

        // --- Custom Design Logic ---
        const designs = db.get('petify_designs.json') || {};
        const userDesign = designs[author.id] || {};
        
        // --- Advanced Translation Logic ---
        const translate = (text, type) => {
            const catVocab = ['Meow', 'Mrrp', 'Nya', 'Purr', 'Hiss', 'Mew', 'Meowww'];
            const dogVocab = ['Woof', 'Bark', 'Arf', 'Bork', 'Awoo', 'Grrr', 'Woofff'];
            const vocab = type === 'dog' ? dogVocab : catVocab;
            
            return text.split(/\s+/).map(word => {
                const cleanWord = word.replace(/[^\w]/g, '');
                const len = cleanWord.length;
                let result = vocab[Math.floor(Math.random() * vocab.length)];
                if (len <= 2) result = result.charAt(0).toLowerCase() + (Math.random() > 0.5 ? '!' : '');
                else if (len > 8) result = result + result.slice(-1).repeat(Math.min(len - 5, 10));
                else if (len > 5) result = result + (Math.random() > 0.5 ? '!' : '~');

                if (cleanWord === cleanWord.toUpperCase() && len > 1) result = result.toUpperCase();
                else if (cleanWord.charAt(0) === cleanWord.charAt(0).toUpperCase()) result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
                else result = result.toLowerCase();

                if (word.endsWith('?')) result += '?';
                if (word.endsWith('!')) result += '!';
                if (word.endsWith('...')) result += '...';
                return result;
            }).join(' ');
        };

        const petifiedContent = translate(originalContent, petType);

        try {
            const canvas = createCanvas(600, 260);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = userDesign.background || '#1e1f22';
            const x = 15, y = 15, w = 570, h = 180, r = 20;
            ctx.beginPath();
            ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
            ctx.fill();

            const avatarUrl = author.displayAvatarURL({ extension: 'png', size: 128 });
            const avatar = await loadImage(avatarUrl);
            ctx.save(); ctx.beginPath(); ctx.arc(60, 65, 36, 0, Math.PI * 2, true); ctx.closePath(); ctx.clip();
            ctx.drawImage(avatar, 24, 29, 72, 72); ctx.restore();

            ctx.font = 'bold 22px "Inter"';
            ctx.fillStyle = userDesign.textColor || '#ffffff';
            ctx.fillText(author.username, 115, 58);

            // --- Label ---
            ctx.save();
            ctx.font = 'italic bold 16px "Inter"';
            ctx.fillStyle = userDesign.textColor || (isDog ? '#FFD700' : '#FFB6C1');
            ctx.textAlign = 'right';
            ctx.fillText(`${isDog ? 'Dogified' : 'Meowified'}! ✨`, 570, 58);
            ctx.restore();

            ctx.font = '18px "Inter"';
            ctx.fillStyle = userDesign.textColor || '#dbdee1';
            const words = petifiedContent.split(' ');
            let line = ''; let lineY = 95; const maxWidth = 420;
            for(let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                    ctx.fillText(line, 115, lineY); line = words[n] + ' '; lineY += 28;
                } else line = testLine;
            }
            ctx.fillText(line, 115, lineY);

            // --- Stamps (Paw Prints) ---
            const assets = interaction.client.assets;
            const pawAsset = isDog ? assets.dogPaw : assets.catPaw;
            if (assets && pawAsset) {
                ctx.save();
                ctx.globalAlpha = 0.15;
                // Bottom right stamp - fully inside bubble
                ctx.translate(480, 110);
                ctx.rotate(Math.PI / 10);
                ctx.drawImage(pawAsset, 0, 0, 80, 80);
                ctx.restore();

                ctx.save();
                ctx.globalAlpha = 0.1;
                // Middle right stamp - clear of text
                ctx.translate(510, 40);
                ctx.rotate(-Math.PI / 15);
                ctx.drawImage(pawAsset, 0, 0, 50, 50);
                ctx.restore();
            }

            // --- Bottom Text ---
            ctx.font = 'bold 14px "Inter"';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(`${isDog ? '🐶' : '🐾'} ${isDog ? 'Dog' : 'Meow'}! Bot System`, 300, 240);

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: `${petType}ified.png` });
            await interaction.editReply({ files: [attachment] });
        } catch (e) {
            console.error(e);
            await interaction.editReply('Something went wrong. 😿');
        }
    },
};
