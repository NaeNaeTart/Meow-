const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activity-heatmap')
        .setDescription('Generate a visual graph of server activity! 📊')
        .setIntegrationTypes([0])
        .setContexts([0]),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const guildConfigs = db.get('guild_configs.json') || {};
        const config = guildConfigs[interaction.guild.id];

        if (!config || !config.activity) {
            return await interaction.editReply('❌ No activity data recorded yet! 😿');
        }

        try {
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, 800, 400);

            // Chart setup
            const padding = 50;
            const chartWidth = 700;
            const chartHeight = 300;
            const barWidth = chartWidth / 24;

            const activity = config.activity;
            const maxActivity = Math.max(...Object.values(activity), 1);

            // Draw bars
            for (let i = 0; i < 24; i++) {
                const val = activity[i] || 0;
                const h = (val / maxActivity) * chartHeight;
                
                // Gradient for bars
                const grad = ctx.createLinearGradient(0, 400 - padding - h, 0, 400 - padding);
                grad.addColorStop(0, '#FFB6C1');
                grad.addColorStop(1, '#FF69B4');
                
                ctx.fillStyle = grad;
                ctx.fillRect(padding + (i * barWidth) + 5, 400 - padding - h, barWidth - 10, h);

                // Labels
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                if (i % 2 === 0) {
                    ctx.fillText(`${i}h`, padding + (i * barWidth), 400 - 20);
                }
            }

            // Axis
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, 400 - padding);
            ctx.lineTo(padding + chartWidth, 400 - padding);
            ctx.stroke();

            // Top active users
            const topUsers = Object.entries(config.activeUsers || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            let userText = "Top Chatters:\n";
            for (const [id, count] of topUsers) {
                const user = await interaction.client.users.fetch(id).catch(() => ({ username: 'Unknown' }));
                userText += `• **${user.username}**: ${count} msgs\n`;
            }

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'activity.png' });

            const embed = new EmbedBuilder()
                .setTitle('📊 Server Activity Heatmap (Last 24h)')
                .setDescription(userText)
                .setImage('attachment://activity.png')
                .setColor('#FFB6C1')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Something went wrong while generating the heatmap. 😿');
        }
    },
};
