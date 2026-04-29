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
            const canvas = createCanvas(600, 220);
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

            ctx.font = 'bold 18px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = userDesign.textColor || '#ffffff';
            ctx.fillText(author.username, 115, 58);

            ctx.font = 'normal 16px "Segoe UI", "Arial", sans-serif';
            ctx.fillStyle = userDesign.textColor || '#dbdee1';
            const words = petifiedContent.split(' ');
            let line = ''; let lineY = 88; const maxWidth = 420;
            for(let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                    ctx.fillText(line, 115, lineY); line = words[n] + ' '; lineY += 24;
                } else line = testLine;
            }
            ctx.fillText(line, 115, lineY);

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: `${petType}ified.png` });
            await interaction.editReply({ files: [attachment] });
        } catch (e) {
            console.error(e);
            await interaction.editReply('Something went wrong. 😿');
        }
    },
};
