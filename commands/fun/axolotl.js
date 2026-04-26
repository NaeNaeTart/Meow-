const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('axolotl')
        .setDescription('Get a random cute axolotl image!'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            // This API is often down, so we use it but have a fallback ready
            const res = await fetch('https://axoltlapi.herokuapp.com/');
            const data = await res.json();
            
            if (!data.url) throw new Error('No image found');

            const embed = new EmbedBuilder()
                .setTitle('🦎 Axolotl!')
                .setImage(data.url)
                .setDescription(data.facts || 'Just look at this cute little creature!')
                .setColor('#ff9ff3')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Axolotl Error:', error);
            // Fallback to cute axolotl images if the API is down
            const fallbackImages = [
                'https://i.imgur.com/39VwZId.jpeg',
                'https://i.imgur.com/7xX7LzR.jpeg',
                'https://i.imgur.com/uR8K5Zt.jpeg',
                'https://i.imgur.com/XFm6UAn.jpeg'
            ];
            const fallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
            
            const embed = new EmbedBuilder()
                .setTitle('🦎 Axolotl! (API is sleepy)')
                .setImage(fallback)
                .setDescription('The Axolotl API seems to be down, so I brought a cute one from my emergency collection!')
                .setColor('#ff9ff3')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
