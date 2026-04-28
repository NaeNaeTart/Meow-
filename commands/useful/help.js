const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help and learn how to use Meow!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🐾 Welcome to Meow!')
            .setDescription('Meow! is your all-in-one companion for fun, utility, and kawaii interactions. Here is a quick guide to get you started:')
            .addFields(
                { name: '💰 Economy & Games', value: 'Start by claiming your `/daily` kisses! You can gamble them in `/slots`, `/roulette`, or challenge someone to `/rps`. Once you\'re rich, `/pay` others or buy a `/pet`!' },
                { name: '🐾 Pets & Marriage', value: 'Adopt a virtual companion with `/pet adopt` or propose to your best friend with `/propose`. You can even customize your `/profile`!' },
                { name: '🛠️ Utility', value: 'We have tools! Resize images with `/compress`, shorten links with `/shorten`, or look up words with `/dictionary`.' },
                { name: '🔍 Finding Commands', value: 'To see a full list of every command I have, type `/cmds`.' }
            )
            .setColor('#FFB6C1')
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/TxUmxAjrbv'),
                new ButtonBuilder()
                    .setLabel('Invite Me!')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1497845203153977454')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
