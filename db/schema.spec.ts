import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadSql, openDuckDb } from 'duckdb-access';

type Db = ReturnType<typeof openDuckDb>;

const insertBreed = `
INSERT INTO breed (breed, fci_number, fci_name, fci_group, fci_group_name, fci_section,
                   country_of_origin, recognition, recognised_on, standard_published_on, source_url)
VALUES ($breed, $fci_number, 'BORDER COLLIE', $fci_group, 'Sheepdogs and Cattledogs', 'Sheepdogs',
        'GREAT BRITAIN', $recognition, DATE '1977-09-27', DATE '1987-06-24',
        'https://www.fci.be/en/nomenclature/BORDER-COLLIE-297.html')
RETURNING breed_id`;

const insertDog = `
INSERT INTO dog (dataset, dataset_dog_key, breed_id)
VALUES ($dataset, $dataset_dog_key, $breed_id)
RETURNING dog_id`;

const breed = {
	breed: 'Border Collie',
	fci_number: 297n,
	fci_group: 1n,
	recognition: 'definitive'
};

describe('schema', () => {
	let db: Db;

	beforeEach(async () => {
		db = openDuckDb({ path: ':memory:' });
		await db.exec(await loadSql('db/schema.sql'));
	});

	afterEach(async () => {
		await db.close();
	});

	it('creates empty breed and dog tables', async () => {
		const rows = await db.query(`SELECT (SELECT count(*) FROM breed) AS breeds,
		                                    (SELECT count(*) FROM dog) AS dogs`);
		expect(rows).toEqual([{ breeds: 0n, dogs: 0n }]);
	});

	it('generates surrogate keys and links a dog to a breed', async () => {
		const [{ breed_id }] = await db.query(insertBreed, breed);
		const [{ dog_id }] = await db.query(insertDog, {
			dataset: 'example',
			dataset_dog_key: 'A1',
			breed_id
		});
		expect(breed_id).toBe(1n);
		expect(dog_id).toBe(1n);
	});

	it('rejects a duplicate FCI number', async () => {
		await db.query(insertBreed, breed);
		await expect(db.query(insertBreed, { ...breed, breed: 'Other' })).rejects.toThrow();
	});

	it('rejects an unknown recognition status and an FCI group outside 1-10', async () => {
		await expect(db.query(insertBreed, { ...breed, recognition: 'pending' })).rejects.toThrow();
		await expect(db.query(insertBreed, { ...breed, fci_group: 11n })).rejects.toThrow();
	});

	it('rejects the same dog key twice within a dataset but allows it across datasets', async () => {
		const dog = { dataset: 'example', dataset_dog_key: 'A1', breed_id: null };
		await db.query(insertDog, dog);
		await expect(db.query(insertDog, dog)).rejects.toThrow();
		await expect(db.query(insertDog, { ...dog, dataset: 'other' })).resolves.toHaveLength(1);
	});

	it('rejects a dog pointing at a breed that does not exist', async () => {
		await expect(
			db.query(insertDog, { dataset: 'example', dataset_dog_key: 'A1', breed_id: 99n })
		).rejects.toThrow();
	});
});
