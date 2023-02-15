const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

class Store {
	id;
	name;
	website;
	phoneNumber;
	emailAddress;
	postalAddress;
}

let stores = new Map();
console.log('Fetching stores...');
axios.get('https://api.tabletop.wizards.com/event-reservations-service/Organizations/by-location?lat=47.394144&lng=0.68484&maxMeters=16093&pageSize=10000&isPremium=false')
	.then(res => {
		res.data.results.forEach(store => {
			stores.set(store.id, store);
		});
		console.log('Stores loaded.');
	});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('events')
		.setDescription('Replies with Magic events around Tours!')
		.addIntegerOption(option =>
			option
				.setName('number')
				.setMinValue(1)
				.setMaxValue(10)
				.setDescription('The number of events returned (max 10, default 3)')),
	async execute(interaction) {
		await axios.get('https://api.tabletop.wizards.com/event-reservations-service/events/search?lat=47.394144&lng=0.68484&isPremium=false&tag=magic:_the_gathering&searchType=magic-events&maxMeters=16093.4&pageSize=20&page=0&sort=date&sortDirection=asc')
			.then(res => {
				const embeddedEvents = [];

				const defaultNumberOfEvents = 3;
				const numberOfEvents = interaction.options.getInteger('number') ?? defaultNumberOfEvents;

				for (var e of res.data.results.filter(e => e.status !== 'Canceled').slice(0, numberOfEvents)) {
					const store = stores.get(e.organizationId);
					embeddedEvents.push(
						new EmbedBuilder()
							.setColor(0x0099FF)
							.setThumbnail('https://locator.wizards.com/img/magic.d7c185c9.png')
							.setTitle(e.name)
							.addFields(
								{ name: '\:house: Où', value: `${store.name}`, inline: true },
								{ name: '\:clock10: Quand', value: `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(e.startDatetime))}`, inline: true },
								{ name: '\:black_joker: Format', value: `${e.format}`, inline: true },
								{ name: '\:family_man_girl_boy: Capacité', value: `${e.capacity}`, inline: true }
							)
							.addFields({ name: 'Description', value: `${e.description}` },
								{ name: ' ', value: ' ' }
							)
							.addFields({ name: '\:magic_wand: Lien boutique', value: `${store.website}` })
					);
				}
				interaction.reply({ embeds: embeddedEvents });
			});
		// .catch(err => {
		// 	console.log('Error: ', err.message);
		// });


	},
};

