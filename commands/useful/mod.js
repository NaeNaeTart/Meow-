const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../db.js');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kick a member from the server.')
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
            .addUserOption(opt => opt.setName('target').setDescription('The user to kick').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for kicking').setRequired(false)),
        new SlashCommandBuilder()
            .setName('purge')
            .setDescription('Delete a specified number of messages.')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
        new SlashCommandBuilder()
            .setName('who')
            .setDescription('Investigate a user and gather hidden details. 🔍')
            .addUserOption(opt => opt.setName('target').setDescription('The user to investigate').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcmute')
            .setDescription('Permanently mute a user in VC until unmuted.')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .addUserOption(opt => opt.setName('target').setDescription('The user to mute').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcunmute')
            .setDescription('Unmute a user previously muted by vcmute.')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .addUserOption(opt => opt.setName('target').setDescription('The user to unmute').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcdeafen')
            .setDescription('Permanently deafen a user in VC until undeafened.')
            .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
            .addUserOption(opt => opt.setName('target').setDescription('The user to deafen').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcundeafen')
            .setDescription('Undeafen a user previously deafened by vcdeafen.')
            .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
            .addUserOption(opt => opt.setName('target').setDescription('The user to undeafen').setRequired(true)),
    ],
    
    async execute(interaction) {
        const { commandName } = interaction;

        if (commandName === 'kick') {
            const target = interaction.options.getMember('target');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user! 😿', ephemeral: true });
            await target.kick(reason);
            await interaction.reply(`✅ Successfully kicked **${target.user.username}**! Reason: ${reason} 🐾`);

        } else if (commandName === 'purge') {
            const amount = interaction.options.getInteger('amount');
            const messages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ Deleted **${messages.size}** messages! 🧹🐾`, ephemeral: true });

        } else if (commandName === 'who') {
            const target = interaction.options.getUser('target');
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            
            const embed = new EmbedBuilder()
                .setTitle(`🔍 Investigation: ${target.username}`)
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: '🆔 ID', value: target.id, inline: true },
                    { name: '📅 Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setColor('#FFB6C1');

            if (member) {
                embed.addFields(
                    { name: '📥 Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.map(r => r).join(' ').substring(0, 1024) : 'None' }
                );
            }

            await interaction.reply({ embeds: [embed] });

        } else if (commandName === 'vcmute') {
            const target = interaction.options.getMember('target');
            const voiceStatus = db.get('voice_status.json');
            if (!voiceStatus[interaction.guildId]) voiceStatus[interaction.guildId] = {};
            if (!voiceStatus[interaction.guildId][target.id]) voiceStatus[interaction.guildId][target.id] = {};
            
            voiceStatus[interaction.guildId][target.id].mute = true;
            db.save('voice_status.json');

            try {
                await target.voice.setMute(true);
            } catch (e) {}
            await interaction.reply(`🔇 Muted **${target.user.username}** in voice! State is now persistent. 🐾`);

        } else if (commandName === 'vcunmute') {
            const target = interaction.options.getMember('target');
            const voiceStatus = db.get('voice_status.json');
            if (voiceStatus[interaction.guildId] && voiceStatus[interaction.guildId][target.id]) {
                delete voiceStatus[interaction.guildId][target.id].mute;
                if (Object.keys(voiceStatus[interaction.guildId][target.id]).length === 0) delete voiceStatus[interaction.guildId][target.id];
                db.save('voice_status.json');
            }

            try {
                await target.voice.setMute(false);
            } catch (e) {}
            await interaction.reply(`🔊 Unmuted **${target.user.username}** in voice! 🐾`);

        } else if (commandName === 'vcdeafen') {
            const target = interaction.options.getMember('target');
            const voiceStatus = db.get('voice_status.json');
            if (!voiceStatus[interaction.guildId]) voiceStatus[interaction.guildId] = {};
            if (!voiceStatus[interaction.guildId][target.id]) voiceStatus[interaction.guildId][target.id] = {};
            
            voiceStatus[interaction.guildId][target.id].deaf = true;
            db.save('voice_status.json');

            try {
                await target.voice.setDeaf(true);
            } catch (e) {}
            await interaction.reply(`🔇 Deafened **${target.user.username}** in voice! State is now persistent. 🐾`);

        } else if (commandName === 'vcundeafen') {
            const target = interaction.options.getMember('target');
            const voiceStatus = db.get('voice_status.json');
            if (voiceStatus[interaction.guildId] && voiceStatus[interaction.guildId][target.id]) {
                delete voiceStatus[interaction.guildId][target.id].deaf;
                if (Object.keys(voiceStatus[interaction.guildId][target.id]).length === 0) delete voiceStatus[interaction.guildId][target.id];
                db.save('voice_status.json');
            }

            try {
                await target.voice.setDeaf(false);
            } catch (e) {}
            await interaction.reply(`🔊 Undeafened **${target.user.username}** in voice! 🐾`);
        }
    },
};
