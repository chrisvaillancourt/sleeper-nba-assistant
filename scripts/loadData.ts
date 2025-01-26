import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { safeDestr } from 'destr';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://api.sleeper.app/v1/';
const allPlayers = `${baseUrl}players/nba`;

// we're removing the metadata key cause we don't need it
const playerSchema = z.object({
	age: z.nullable(z.number()),
	team_abbr: z.nullable(z.string()),
	birth_date: z.nullable(z.string()),
	search_last_name: z.string(),
	opta_id: z.nullable(z.string()),
	espn_id: z.nullable(z.string()),
	full_name: z.string(),
	swish_id: z.nullable(z.number()),
	active: z.boolean(),
	oddsjam_id: z.nullable(z.string()),
	hashtag: z.string(),
	practice_description: z.nullable(z.string()),
	team_changed_at: z.nullable(z.string()),
	sportradar_id: z.nullable(z.string()),
	last_name: z.string(),
	team: z.nullable(z.string()),
	depth_chart_position: z.nullable(z.string()),
	injury_notes: z.nullable(z.string()),
	gsis_id: z.nullable(z.string()),
	search_rank: z.nullable(z.number()),
	pandascore_id: z.nullable(z.string()),
	first_name: z.string(),
	fantasy_positions: z.array(z.string()),
	status: z.string(),
	birth_country: z.nullable(z.string()),
	news_updated: z.nullable(z.number()),
	practice_participation: z.nullable(z.string()),
	height: z.string(),
	fantasy_data_id: z.nullable(z.string()),
	injury_status: z.nullable(z.string()),
	sport: z.string(),
	weight: z.string(),
	injury_body_part: z.nullable(z.string()),
	player_id: z.string(),
	rotowire_id: z.nullable(z.number()),
	rotoworld_id: z.nullable(z.string()),
	competitions: z.array(z.unknown()),
	depth_chart_order: z.nullable(z.number()),
	yahoo_id: z.nullable(z.string()),
	birth_city: z.nullable(z.string()),
	birth_state: z.nullable(z.string()),
	search_first_name: z.string(),
	position: z.string(),
	high_school: z.nullable(z.string()),
	number: z.nullable(z.number()),
	stats_id: z.nullable(z.string()),
	search_full_name: z.string(),
	years_exp: z.number(),
	injury_start_date: z.nullable(z.string()),
	college: z.nullable(z.string()),
});

// For the outer object where the key is a string (like "1000")
const playersSchema = z.record(z.string(), playerSchema);

async function get(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const responseTxt = await response.text();
	const json = safeDestr(responseTxt);
	return json;
}

async function loadFile(fileName: string) {
	const filePath = path.join(__dirname, fileName);
	const data = await readFile(filePath, 'utf-8');
	return safeDestr(data);
}

function toFile(filename: string, data: unknown) {
	return writeFile(`${__dirname}/${filename}`, JSON.stringify(data, null, 2));
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		Object.prototype.toString.call(value) === '[object Object]'
	);
}

function isDuplicatePlayer(playerData: Record<string, unknown>) {
	return (
		typeof playerData['search_full_name'] == 'string' &&
		playerData['search_full_name'].includes('duplicate')
	);
}

function filterPlayersData(playerData: Record<string, unknown> | unknown) {
	if (!isRecord(playerData))
		throw new Error('Raw player data was not a record.');
	return Object.entries(playerData).reduce<Record<string, unknown>>(
		(acc, [key, value]) => {
			// their api returns keys that are teams not players, players have a numerical id
			if (Number.isNaN(Number.parseInt(key))) {
				return acc;
			}
			if (isRecord(value) && isDuplicatePlayer(value)) {
				return acc;
			}
			// remove player with all null data
			if (key === '4732') {
				return acc;
			}

			acc[key] = value;
			return acc;
		},
		{},
	);
}

async function main() {
	console.log('running...');

	try {
		const playerFileName = 'players.json';
		const playerData = await get(allPlayers);

		const filteredPlayerData = filterPlayersData(playerData);
		const validated = playersSchema.parse(filteredPlayerData);
		await toFile(`${playerFileName}_validated.json`, validated);
		console.log('finished');
	} catch (error) {
		console.error('error');
		await toFile('error.json', error);
	}
}

main();
