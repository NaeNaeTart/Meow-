const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('petifydesign')
        .setDescription('Customize how petified messages look when someone petifies you!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option => option.setName('background').setDescription('Background color (Hex, e.g. #1e1f22)'))
        .addStringOption(option => option.setName('text-color').setDescription('Main text color (Hex, e.g. #ffffff)'))
        .addStringOption(option => option.setName('badge-color').setDescription('Badge background color (Hex, e.g. #5865f2)'))
        .addStringOption(option => option.setName('border-color').setDescription('Avatar border color (Hex)'))
        .addStringOption(option => option.setName('stamp-color').setDescription('Color of the paw prints and branding stamp (Hex)'))
        .addBooleanOption(option => option.setName('reset').setDescription('Reset your design to default')),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.user.id;
            const reset = interaction.options.getBoolean('reset');
            
            let designs = db.get('petify_designs.json');
            if (!designs) {
                designs = {};
                db.set('petify_designs.json', designs);
            }

            if (reset) {
                delete designs[userId];
                db.save('petify_designs.json');
                return await interaction.editReply({ content: '✅ Your petify design has been reset to default!' });
            }

            const background = interaction.options.getString('background');
            const textColor = interaction.options.getString('text-color');
            const badgeColor = interaction.options.getString('badge-color');
            const borderColor = interaction.options.getString('border-color');
            const stampColor = interaction.options.getString('stamp-color');

            if (!background && !textColor && !badgeColor && !borderColor && !stampColor) {
                const current = designs[userId] || {};
                const embed = new EmbedBuilder()
                    .setTitle('🎨 Your Petify Design')
                    .setDescription('Use the options to customize how you look when someone "meows" or "dogs" you!')
                    .addFields(
                        { name: 'Background', value: current.background || 'Default (#1e1f22)', inline: true },
                        { name: 'Text Color', value: current.textColor || 'Default (#dbdee1)', inline: true },
                        { name: 'Badge Color', value: current.badgeColor || 'Default (Pet-specific)', inline: true },
                        { name: 'Border Color', value: current.borderColor || 'Default (Pet-specific)', inline: true },
                        { name: 'Stamp Color', value: current.stampColor || 'Default (Pet-specific)', inline: true }
                    )
                    .setColor(current.badgeColor || '#5865F2');

                return await interaction.editReply({ embeds: [embed] });
            }

            // Simple Hex validation
            const isHex = (h) => h && /^#[0-9A-F]{6}$/i.test(h);
            
            const updates = {};
            if (background) {
                if (!isHex(background)) return await interaction.editReply({ content: '❌ Invalid background hex code! Use format #RRGGBB' });
                updates.background = background;
            }
            if (textColor) {
                if (!isHex(textColor)) return await interaction.editReply({ content: '❌ Invalid text-color hex code! Use format #RRGGBB' });
                updates.textColor = textColor;
            }
            if (badgeColor) {
                if (!isHex(badgeColor)) return await interaction.editReply({ content: '❌ Invalid badge-color hex code! Use format #RRGGBB' });
                updates.badgeColor = badgeColor;
            }
            if (borderColor) {
                if (!isHex(borderColor)) return await interaction.editReply({ content: '❌ Invalid border-color hex code! Use format #RRGGBB' });
                updates.borderColor = borderColor;
            }
            if (stampColor) {
                if (!isHex(stampColor)) return await interaction.editReply({ content: '❌ Invalid stamp-color hex code! Use format #RRGGBB' });
                updates.stampColor = stampColor;
            }

            designs[userId] = { ...(designs[userId] || {}), ...updates };
            db.save('petify_designs.json');

            await interaction.editReply({ content: '✅ Your petify design has been updated! Next time someone petifies you, it will look stunning. ✨' });
        } catch (error) {
            console.error('Error in petifydesign:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: `❌ An error occurred: ${error.message}` });
            } else {
                await interaction.reply({ content: `❌ An error occurred: ${error.message}`, flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};
