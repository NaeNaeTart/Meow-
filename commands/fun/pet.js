const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Virtual pet system!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .addSubcommand(sub => 
            sub.setName('adopt')
                .setDescription('Adopt a new pet! (Costs 500 Kisses)')
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('What kind of pet?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Kitten', value: 'kitten' },
                            { name: 'Puppy', value: 'puppy' },
                            { name: 'Boykisser', value: 'boykisser' }
                        )
                )
                .addStringOption(option => option.setName('name').setDescription('Name your pet').setRequired(true))
        )
        .addSubcommand(sub => sub.setName('status').setDescription('Check on your pet'))
        .addSubcommand(sub => sub.setName('feed').setDescription('Feed your pet'))
        .addSubcommand(sub => sub.setName('play').setDescription('Play with your pet'))
        .addSubcommand(sub => sub.setName('tuck-in').setDescription('Put your pet to sleep')),

    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        let pets = db.get('pets.json');
        if (!pets) {
            pets = {};
            db.set('pets.json', pets);
        }

        const calculateStats = (pet) => {
            if (!pet) return null;
            const now = Date.now();
            const hoursPassed = (now - pet.lastInteraction) / (1000 * 60 * 60);
            
            // Stats drop by 5% every hour
            const drop = Math.floor(hoursPassed * 5);
            
            return {
                hunger: Math.max(0, pet.hunger - drop),
                happiness: Math.max(0, pet.happiness - drop),
                energy: Math.max(0, pet.energy - (drop / 2)) // Energy drops slower
            };
        };

        if (subCmd === 'adopt') {
            if (pets[userId]) {
                return await interaction.reply({ content: '❌ You already have a pet! You must take care of them.', flags: [MessageFlags.Ephemeral] });
            }

            let ecoData = db.get('economy.json');
            if (!ecoData || !ecoData.users[userId] || ecoData.users[userId].balance < 500) {
                return await interaction.reply({ content: '❌ You need at least 500 Kisses to adopt a pet!', flags: [MessageFlags.Ephemeral] });
            }

            ecoData.users[userId].balance -= 500;
            db.save('economy.json');

            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name');

            pets[userId] = {
                type,
                name,
                hunger: 100,
                happiness: 100,
                energy: 100,
                lastInteraction: Date.now()
            };
            db.save('pets.json');

            const emojis = { kitten: '🐱', puppy: '🐶', boykisser: '😽' };
            await interaction.reply(`🎉 You successfully adopted a **${type}** named **${name}**! ${emojis[type]}\nDon't forget to use \`/pet feed\` and \`/pet play\`!`);
            return;
        }

        const myPet = pets[userId];
        if (!myPet) {
            return await interaction.reply({ content: '❌ You don\'t have a pet yet! Use `/pet adopt` to get one.', flags: [MessageFlags.Ephemeral] });
        }

        const currentStats = calculateStats(myPet);
        
        if (subCmd === 'status') {
            const emojis = { kitten: '🐱', puppy: '🐶', boykisser: '😽' };
            const embed = new EmbedBuilder()
                .setTitle(`${emojis[myPet.type]} ${myPet.name}'s Status`)
                .setDescription(`Here is how your ${myPet.type} is doing today:`)
                .addFields(
                    { name: '🍖 Hunger', value: `${currentStats.hunger}%`, inline: true },
                    { name: '🎾 Happiness', value: `${currentStats.happiness}%`, inline: true },
                    { name: '💤 Energy', value: `${currentStats.energy}%`, inline: true }
                )
                .setColor('#FFB6C1');
            
            return await interaction.reply({ embeds: [embed] });
        }

        // Action commands
        if (subCmd === 'feed') {
            myPet.hunger = Math.min(100, currentStats.hunger + 30);
            myPet.lastInteraction = Date.now();
            db.save('pets.json');
            return await interaction.reply(`🍖 You fed **${myPet.name}**. They look full and happy! (Hunger: ${myPet.hunger}%)`);
        }

        if (subCmd === 'play') {
            if (currentStats.energy < 20) {
                return await interaction.reply(`💤 **${myPet.name}** is too tired to play right now. Try \`/pet tuck-in\`!`);
            }
            myPet.happiness = Math.min(100, currentStats.happiness + 30);
            myPet.energy = Math.max(0, currentStats.energy - 15);
            myPet.lastInteraction = Date.now();
            db.save('pets.json');
            return await interaction.reply(`🎾 You played fetch with **${myPet.name}**! (Happiness: ${myPet.happiness}%)`);
        }

        if (subCmd === 'tuck-in') {
            myPet.energy = 100;
            myPet.lastInteraction = Date.now();
            db.save('pets.json');
            return await interaction.reply(`💤 You tucked **${myPet.name}** into bed. Sweet dreams! (Energy: 100%)`);
        }
    },
};
