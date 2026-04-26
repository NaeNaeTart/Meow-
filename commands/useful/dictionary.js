const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dictionary')
        .setDescription('Look up a word definition')
        .addStringOption(option => 
            option.setName('word')
                .setDescription('The word to look up')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('The dictionary to use')
                .addChoices(
                    { name: 'Standard (Free Dictionary API)', value: 'standard' },
                    { name: 'Urban Dictionary (Slang)', value: 'urban' }
                )),
    async execute(interaction) {
        await interaction.deferReply();
        const word = interaction.options.getString('word');
        const source = interaction.options.getString('source') || 'standard';

        try {
            if (source === 'standard') {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                if (res.status === 404) return await interaction.editReply(`❌ Could not find a definition for **${word}**.`);
                const data = await res.json();
                const entry = data[0];

                const embed = new EmbedBuilder()
                    .setTitle(`📖 Definition: ${entry.word}`)
                    .setDescription(entry.meanings[0].definitions[0].definition)
                    .addFields(
                        { name: 'Part of Speech', value: entry.meanings[0].partOfSpeech, inline: true },
                        { name: 'Phonetic', value: entry.phonetic || 'N/A', inline: true }
                    )
                    .setColor('#3498db')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                const res = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
                const data = await res.json();
                if (!data.list || data.list.length === 0) return await interaction.editReply(`❌ No Urban Dictionary entries found for **${word}**.`);
                const entry = data.list[0];

                const embed = new EmbedBuilder()
                    .setTitle(`🏙️ Urban Dictionary: ${entry.word}`)
                    .setDescription(entry.definition.replace(/\[|\]/g, '').substring(0, 2048))
                    .addFields(
                        { name: 'Example', value: entry.example.replace(/\[|\]/g, '').substring(0, 1024) || 'None' },
                        { name: 'Rating', value: `👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}`, inline: true }
                    )
                    .setColor('#efff00')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Dictionary Error:', error);
            await interaction.editReply('❌ Failed to look up the word. Try again later!');
        }
    }
};
