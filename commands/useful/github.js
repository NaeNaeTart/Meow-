const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('github-repo')
        .setDescription('Fetch stats for a GitHub repository! 🐙')
        .addStringOption(option => option.setName('owner').setDescription('The owner of the repo').setRequired(true))
        .addStringOption(option => option.setName('repo').setDescription('The name of the repo').setRequired(true)),
    
    async execute(interaction) {
        const owner = interaction.options.getString('owner');
        const repo = interaction.options.getString('repo');
        await interaction.deferReply();

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (response.status === 404) {
                return await interaction.editReply(`❌ Meow... I couldn't find the repository "**${owner}/${repo}**". 😿`);
            }

            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`🐙 ${data.full_name}`)
                .setURL(data.html_url)
                .setDescription(data.description || 'No description provided.')
                .addFields(
                    { name: '⭐ Stars', value: data.stargazers_count.toLocaleString(), inline: true },
                    { name: '🍴 Forks', value: data.forks_count.toLocaleString(), inline: true },
                    { name: '👀 Watchers', value: data.watchers_count.toLocaleString(), inline: true },
                    { name: '🐛 Open Issues', value: data.open_issues_count.toLocaleString(), inline: true },
                    { name: '📜 License', value: data.license ? data.license.name : 'No License', inline: true },
                    { name: '📅 Created', value: `<t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:R>`, inline: true }
                )
                .setColor('#24292F')
                .setThumbnail(data.owner.avatar_url)
                .setFooter({ text: 'GitHub API', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Something went wrong while fetching GitHub data. 😿');
        }
    },
};
