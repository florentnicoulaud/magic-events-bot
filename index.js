const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

dotenv.config();

// add timestamps in front of log messages
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
    console.log(`Loading command : ${command.data.name}`)
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});


// Respond to user interactions
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
    console.log(`Getting client command : ${interaction.commandName} from ${interaction.guild}#${interaction.channel.name}:${interaction.user.username}`)

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
