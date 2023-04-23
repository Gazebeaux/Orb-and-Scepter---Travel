import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface TravelSystemSettings {
	isMounted: boolean;
}

const DEFAULT_SETTINGS: TravelSystemSettings = {
	isMounted: false
};

export default class TravelSystemPlugin extends Plugin {
	settings: TravelSystemSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('dice', 'Travel System', async () => {
			const roll = this.roll2d20();
			const outcome = this.getTravelOutcome(roll, this.settings.isMounted);

			new Notice(`Distance: ${outcome.distance} miles\nEncounter: ${outcome.encounter}`);
		});

		this.addSettingTab(new TravelSystemSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	roll2d20() {
		return this.rollDice(2, 20);
	}

	rollDice(numDice, numSides) {
		let total = 0;
		for (let i = 0; i < numDice; i++) {
			total += Math.floor(Math.random() * numSides) + 1;
		}
		return total;
	}

	getTravelOutcome(roll, isMounted) {
		const onFootDistances = [1, 2, 3, 4, 5, 6, 7, 8];
		const mountedDistances = [2, 4, 6, 8, 10, 12, 14, 16];
		let distance;

		if (isMounted) {
			distance = mountedDistances;
		} else {
			distance = onFootDistances;
		}

		if (roll >= 2 && roll <= 5) {
			return { distance: distance[0], encounter: 'Major combat encounter' };
		} else if (roll >= 6 && roll <= 12) {
			return { distance: distance[1], encounter: 'Minor combat encounter' };
		} else if (roll >= 13 && roll <= 18) {
			return { distance: distance[2], encounter: 'No encounter' };
		}
		// ... and so on
	}
}

class TravelSystemSettingTab extends PluginSettingTab {
	plugin: TravelSystemPlugin;

	constructor(app: App, plugin: TravelSystemPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Travel System Plugin.'});

		new Setting(containerEl)
			.setName('Mounted Travel')
			.setDesc('Enable if the characters are mounted.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.isMounted)
				.onChange(async (value) => {
					this.plugin.settings.isMounted = value;
					await this.plugin.saveSettings();
				}));
	}
}
