const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../db.js');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kick a member from the server.')
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to kick').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for kicking').setRequired(false)),
        new SlashCommandBuilder()
            .setName('purge')
            .setDescription('Delete a specified number of messages.')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
        new SlashCommandBuilder()
            .setName('who')
            .setDescription('Investigate a user and gather hidden details. 🔍')
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to investigate').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcmute')
            .setDescription('Permanently mute a user in VC until unmuted.')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to mute').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcunmute')
            .setDescription('Unmute a user previously muted by vcmute.')
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to unmute').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcdeafen')
            .setDescription('Permanently deafen a user in VC until undeafened.')
            .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to deafen').setRequired(true)),
        new SlashCommandBuilder()
            .setName('vcundeafen')
            .setDescription('Undeafen a user previously deafened by vcdeafen.')
            .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
            .setIntegrationTypes([0])
            .setContexts([0])
            .addUserOption(opt => opt.setName('target').setDescription('The user to undeafen').setRequired(true)),
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Clear all recent messages in the channel (Up to 500).')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .setIntegrationTypes([0])
            .setContexts([0]),
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
            try {
                const fetched = await interaction.channel.messages.fetch({ limit: amount });
                const messages = await interaction.channel.bulkDelete(fetched, true);
                await interaction.reply({ content: `✅ Deleted **${messages.size}** messages! 🧹🐾`, ephemeral: true });
            } catch (error) {
                console.error('Purge error:', error);
                await interaction.reply({ content: '❌ Failed to purge messages! Ensure they are under 14 days old and I have the `Manage Messages` permission. 😿', ephemeral: true });
            }

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
        } else if (commandName === 'clear') {
            try {
                await interaction.deferReply({ ephemeral: true });
                let totalDeleted = 0;
                
                // Limit to 5 loops (500 messages) to avoid timeouts
                for (let i = 0; i < 5; i++) {
                    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
                    if (fetched.size === 0) break;
                    
                    const deleted = await interaction.channel.bulkDelete(fetched, true);
                    totalDeleted += deleted.size;
                    
                    if (deleted.size < 100) break; // If we hit old messages or end of channel
                }
                
                await interaction.editReply({ content: `✅ Cleared **${totalDeleted}** recent messages! 🧹🐾` });
            } catch (error) {
                console.error(error);
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Failed to clear messages! Ensure I have permissions. 😿' });
                } else {
                    await interaction.reply({ content: '❌ Failed to clear messages! 😿', ephemeral: true });
                }
            }
        }
    },
};
