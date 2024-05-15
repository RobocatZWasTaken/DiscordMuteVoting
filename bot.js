const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token, allowedRole, mutedRole } = require('./config.json');

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if command === 'mute') {
        // Check if user has the allowed role
        if (!message.member.roles.cache.some(role => role.name === allowedRole)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Get the mentioned user
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('You need to mention a user to perform this action on.');
        }

        // Create a vote message
        const voteMessage = await message.channel.send(`Vote to ${command} ${member.displayName}. React with ✅ to ${command} or ❌ to cancel.`);

        // Add reaction options
        await voteMessage.react('✅');
        await voteMessage.react('❌');

        // Create a filter to collect reactions
        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id !== client.user.id;

        // Collect reactions
        const collected = await voteMessage.awaitReactions(filter, { time: 60000 });

        // Calculate votes
        const votesFor = collected.get('✅') ? collected.get('✅').count - 1 : 0; // Subtract 1 to exclude the bot's reaction
        const votesAgainst = collected.get('❌') ? collected.get('❌').count - 1 : 0;

        // Check if the action should be carried out
        if (votesFor > votesAgainst) {
           if (command === 'mute') {
                // Assign Muted role
                const mutedRoleObj = message.guild.roles.cache.find(role => role.name === mutedRole);
                if (!mutedRoleObj) {
                    return message.channel.send('Muted role not found. Please ask a mod to create a role named "Muted" with appropriate permissions.');
                }
                await member.roles.add(mutedRoleObj);
                message.channel.send(`${member.displayName} has been muted.`);
            }
        } else {
            message.channel.send(`${member.displayName} will not be ${command}ed.`);
        }
    }
});

client.login(token);  
