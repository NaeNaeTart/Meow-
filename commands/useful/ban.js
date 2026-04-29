const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server with optional duration! 🚫')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setIntegrationTypes([0])
        .setContexts([0])
        .addUserOption(option => option.setName('target').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Duration of the ban (e.g., 1h, 1d). Leave empty for permanent.').setRequired(false))
        .addStringOption(option => option.setName('reason').setDescription('Reason for banning').setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return await interaction.reply({ content: '❌ Target member not found! 😿', flags: [MessageFlags.Ephemeral] });
        if (!target.bannable) {
            return await interaction.reply({ content: '❌ I don\'t have permission to ban this user! (Role hierarchy or missing permission) 😿', flags: [MessageFlags.Ephemeral] });
        }

        let durationMs = null;
        if (durationStr) {
            durationMs = ms(durationStr);
            if (!durationMs) {
                return await interaction.reply({ content: '❌ Invalid duration format! Use 1h, 1d, 1w, etc. 😿', flags: [MessageFlags.Ephemeral] });
            }
        }

        // 1. Try to DM the user
        const dmEmbed = new EmbedBuilder()
            .setTitle(`🚫 You have been banned from ${interaction.guild.name}`)
            .addFields(
                { name: '📝 Reason', value: reason },
                { name: '⏳ Duration', value: durationStr ? durationStr : 'Permanent' }
            )
            .setColor('#FF0000')
            .setTimestamp();

        try {
            await target.send({ embeds: [dmEmbed] });
        } catch (e) {
            console.log(`Could not DM user ${target.id}. They likely have DMs closed.`);
        }

        // 2. Perform the ban
        try {
            await target.ban({ reason });

            // 3. Store temp ban if applicable
            if (durationMs) {
                const bans = db.get('bans.json') || {};
                bans[target.id] = {
                    guildId: interaction.guild.id,
                    unbanAt: Date.now() + durationMs,
                    reason: reason
                };
                db.save('bans.json');
            }

            const embed = new EmbedBuilder()
                .setTitle(durationStr ? '⏳ Temporarily Banned!' : '🚫 Permanently Banned!')
                .setDescription(`**${target.user.username}** has been hissed out of the server.`)
                .addFields(
                    { name: '👤 User', value: `${target.user.username} (\`${target.id}\`)`, inline: true },
                    { name: '🛡️ Moderator', value: `${interaction.user.username}`, inline: true },
                    { name: '📝 Reason', value: reason }
                )
                .setThumbnail(target.user.displayAvatarURL())
                .setColor('#FF0000')
                .setFooter({ text: durationStr ? `Ban expires in ${durationStr}` : 'The claws have spoken.' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ban Error:', error);
            await interaction.reply({ content: `❌ API Error: ${error.message} 😿`, flags: [MessageFlags.Ephemeral] });
        }
    },
};
