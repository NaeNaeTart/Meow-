const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Shorten a long URL')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('The URL to shorten')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('service')
                .setDescription('The shortening service to use')
                .addChoices(
                    { name: 'CleanURI (Default)', value: 'cleanuri' },
                    { name: 'Is.gd', value: 'isgd' },
                    { name: 'TinyURL', value: 'tinyurl' },
                    { name: 'Da.gd', value: 'dagd' }
                )),
    async execute(interaction) {
        await interaction.deferReply();
        const url = interaction.options.getString('url');
        const service = interaction.options.getString('service') || 'cleanuri';

        try {
            let shortUrl = '';
            if (service === 'cleanuri') {
                const res = await fetch('https://cleanuri.com/api/v1/shorten', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `url=${encodeURIComponent(url)}`
                });
                const data = await res.json();
                shortUrl = data.result_url;
            } else if (service === 'isgd') {
                const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
                const data = await res.json();
                shortUrl = data.shorturl;
            } else if (service === 'tinyurl') {
                const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                shortUrl = await res.text();
            } else if (service === 'dagd') {
                const res = await fetch(`https://da.gd/s?url=${encodeURIComponent(url)}`);
                shortUrl = await res.text();
            }

            if (!shortUrl || shortUrl.toLowerCase().includes('error')) {
                throw new Error('API returned an error');
            }

            await interaction.editReply(`🔗 **Shortened URL (${service}):** ${shortUrl.trim()}`);
        } catch (error) {
            console.error('Shorten Error:', error);
            await interaction.editReply('❌ Failed to shorten the URL. Please ensure it is a valid link (including http/https).');
        }
    }
};
