const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dogfact')
        .setDescription('Get a random fun fact about dogs!'),
    async execute(interaction) {
        try {
            const res = await fetch('https://dog-api.kinduff.com/api/facts');
            const data = await res.json();
            
            const embed = new EmbedBuilder()
                .setTitle('🐶 Dog Fact!')
                .setDescription(data.facts[0])
                .setColor('#f1c40f')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('DogFact Error:', error);
            await interaction.reply('❌ Failed to fetch a dog fact. Try again later!');
        }
    }
};
