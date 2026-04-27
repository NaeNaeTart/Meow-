require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

client.once('ready', () => {
    console.log(`\n🐾 Logged in as: ${client.user.tag}`);
    console.log(`📊 Connected to ${client.guilds.cache.size} servers:\n`);
    
    client.guilds.cache.forEach(guild => {
        console.log(`- ${guild.name} (ID: ${guild.id}) [${guild.memberCount} members]`);
    });

    console.log('\n✅ List complete.');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ Failed to login. Make sure your .env has the correct token.');
    process.exit(1);
});
