const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addStringOption(option => option.setName('question').setDescription('What do you want to ask?').setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        const responses = [
            'My whiskers say yes! 😺',
            'Absolutely! Purr-fect. 😻',
            'Without a doubt. 😼',
            'Yes, definitely. 😽',
            'You may rely on it. 🐾',
            'As I see it, yes. 🐈',
            'Most likely. 🐈‍⬛',
            'Outlook good. ✨',
            'Yes. 🐱',
            'Signs point to yes. 🐾',
            'Hiss... reply hazy, try again. 😾',
            'Ask again later, I am napping. 💤',
            'Better not tell you now. 🙀',
            'Cannot predict now, too busy chasing laser. 🔴',
            'Concentrate and ask again. 👁️',
            "Don't count on it. 😿",
            'My reply is no. 🚫',
            'My sources say no. 🐈',
            'Outlook not so good. 🌧️',
            'Very doubtful. ⛔'
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: 'Question', value: question },
                { name: 'Answer', value: answer }
            )
            .setColor('#2F3136');

        await interaction.reply({ embeds: [embed] });
    },
};
