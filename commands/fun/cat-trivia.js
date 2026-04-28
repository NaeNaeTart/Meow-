const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat-trivia')
        .setDescription('Get a random fun fact about cats! 🐈')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        const facts = [
            "Cats have a third eyelid called the 'haw' that's usually only visible when they're unwell.",
            "A group of cats is called a 'clowder'.",
            "Cats spend about 70% of their lives sleeping.",
            "A cat's nose print is unique, much like a human fingerprint.",
            "Cats make about 100 different sounds. Dogs make only about 10.",
            "The first cat in space was a French cat named Félicette in 1963. She survived the trip!",
            "Cats can rotate their ears 180 degrees.",
            "A cat's whiskers are generally about the same width as its body.",
            "Cats have 32 muscles in each ear.",
            "The oldest known pet cat was found in a 9,500-year-old grave on the Mediterranean island of Cyprus.",
            "Cats can't taste sweetness.",
            "A cat's purr vibrates at a frequency that can actually help improve bone density and promote healing.",
            "The record for the most kittens born to one cat is 420!",
            "Black cats are considered good luck in Japan.",
            "Ancient Egyptians would shave their eyebrows as a sign of mourning when their family cat died."
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        const embed = new EmbedBuilder()
            .setTitle('💡 Cat Trivia')
            .setDescription(randomFact)
            .setColor('#FFB6C1')
            .setThumbnail('https://i.imgur.com/8N69HjH.png') // Cute cat icon
            .setFooter({ text: 'Did you know that? 🐾' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
