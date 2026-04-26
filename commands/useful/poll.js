const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .setIntegrationTypes([0])
        .setContexts([0])
        .addStringOption(option => option.setName('question').setDescription('The question').setRequired(true))
        .addStringOption(option => option.setName('options').setDescription('Comma separated options (e.g. Cats, Dogs, Birds)').setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const options = optionsString.split(',').map(o => o.trim()).filter(o => o.length > 0);

        if (options.length < 2 || options.length > 10) {
            return await interaction.reply({ content: '❌ You must provide between 2 and 10 options.', ephemeral: true });
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        let description = '';
        for (let i = 0; i < options.length; i++) {
            description += `${emojis[i]} ${options[i]}\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setColor('#FFB6C1')
            .setFooter({ text: `Poll created by ${interaction.user.tag}` })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
