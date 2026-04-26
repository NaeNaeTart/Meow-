const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Play trivia to win Kisses!')
        .setIntegrationTypes([0])
        .setContexts([0]),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const fetch = (await import('node-fetch')).default;
            const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = await res.json();
            
            if (!data.results || data.results.length === 0) {
                return await interaction.editReply('❌ Failed to fetch trivia. Try again later.');
            }

            const questionData = data.results[0];
            const questionText = questionData.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");
            const correctAnswer = questionData.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");
            const incorrectAnswers = questionData.incorrect_answers.map(a => a.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"));

            const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);

            const buttons = allAnswers.map((answer, index) => {
                return new ButtonBuilder()
                    .setCustomId(`trivia_${index}`)
                    .setLabel(answer.substring(0, 80))
                    .setStyle(ButtonStyle.Primary);
            });

            const row = new ActionRowBuilder().addComponents(buttons);

            const embed = new EmbedBuilder()
                .setTitle('🧠 Trivia Time!')
                .setDescription(`**Category:** ${questionData.category}\n**Difficulty:** ${questionData.difficulty}\n\n**${questionText}**\n\n*First person to click the correct answer wins 200 Kisses!*`)
                .setColor('#0099ff');

            const message = await interaction.editReply({ embeds: [embed], components: [row] });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async i => {
                const selectedAnswerIndex = parseInt(i.customId.split('_')[1]);
                const selectedAnswer = allAnswers[selectedAnswerIndex];

                if (selectedAnswer === correctAnswer) {
                    let ecoData = db.get('economy.json');
                    if (!ecoData.users) ecoData.users = {};
                    if (!ecoData.users[i.user.id]) ecoData.users[i.user.id] = { balance: 0, lastDaily: 0 };
                    
                    ecoData.users[i.user.id].balance += 200;
                    db.save('economy.json');

                    await i.update({ content: `✅ **<@${i.user.id}> won 200 Kisses!** The correct answer was **${correctAnswer}**.`, components: [], embeds: [] });
                    collector.stop();
                } else {
                    await i.reply({ content: '❌ Wrong answer!', ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0 || !collected.find(i => allAnswers[parseInt(i.customId.split('_')[1])] === correctAnswer)) {
                    interaction.editReply({ content: `Time is up! The correct answer was **${correctAnswer}**.`, components: [], embeds: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Failed to fetch trivia. Try again later.');
        }
    },
};
