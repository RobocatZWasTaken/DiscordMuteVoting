const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const { token, prefix, allowedRole, mutedRole } = require('./config.json');

const client = new CommandoClient({
    commandPrefix: prefix,
    owner: 'your_owner_id_here', // Replace 'your_owner_id_here' with your Discord user ID
});

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerGroup('moderation', 'Moderation')
    .registerCommand(MuteCommand);

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('error', console.error);

client.login(token);

const { Command } = require('discord.js-commando');

class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            memberName: 'mute',
            description: 'Mutes a user.',
            userPermissions: ['MANAGE_ROLES'],
            args: [
                {
                    key: 'member',
                    prompt: 'Which member do you want to mute?',
                    type: 'member',
                },
            ],
        });
    }

    async run(message, { member }) {
        const voteMessage = await message.channel.send(`Vote to mute ${member.displayName}. React with ✅ to mute or ❌ to cancel.`);

        await voteMessage.react('✅');
        await voteMessage.react('❌');

        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id !== this.client.user.id;
        const collected = await voteMessage.awaitReactions(filter, { time: 60000 });
        const votesFor = collected.get('✅') ? collected.get('✅').count - 1 : 0;
        const votesAgainst = collected.get('❌') ? collected.get('❌').count - 1 : 0;

        if (votesFor > votesAgainst) {
            const mutedRoleObj = message.guild.roles.cache.find((role) => role.name === mutedRole);
            if (!mutedRoleObj) {
                return message.channel.send('Muted role not found. Please ask a mod to create a role named "Muted" with appropriate permissions.');
            }
            await member.roles.add(mutedRoleObj);
            message.channel.send(`${member.displayName} has been muted.`);
        } else {
            message.channel.send(`${member.displayName} will not be muted.`);
        }
    }
}

//Changed By S4vvyos: https://github.com/tubers93os
