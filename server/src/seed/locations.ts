import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../database/data-source';
import { State } from '../database/entities/State';
import { District } from '../database/entities/District';
import { Township } from '../database/entities/Township';
import { readSheetRows } from './read';

// Column layout of မြို့နယ်_Code_*.xlsx (header row):
// 0: တိုင်းဒေသကြီး/ပြည်နယ်အမည်   (state name)
// 1: ခရိုင်/...အမည်                 (district name)
// 2: မြို့နယ်အမည်                   (township name)
// 3: stateID   4: districtID   5: townshipID

const NAME_FRAGMENT = 'Code'; // matches "..._Code_....xlsx"

async function main() {
  await AppDataSource.initialize();

  const rows = readSheetRows(NAME_FRAGMENT);

  // Skip the header row.
  const dataRows = rows.slice(1).filter((r) => r[3] && r[4] && r[5]);

  if (dataRows.length === 0) {
    console.log('No data rows found in the location file.');
    return;
  }

  const stateRepo = AppDataSource.getRepository(State);
  const districtRepo = AppDataSource.getRepository(District);
  const townshipRepo = AppDataSource.getRepository(Township);

  // De-duplicate by primary key while preserving first-seen order.
  const states = new Map<string, State>();
  const districts = new Map<string, District>();
  const townships = new Map<string, Township>();

  for (const r of dataRows) {
    const [nameState, nameDistrict, nameTownship, sid, did, tid] = r as [
      string, string, string, string, string, string,
    ];

    const stateId = String(sid).trim();
    const districtId = String(did).trim();
    const townshipId = String(tid).trim();

    if (!states.has(stateId)) {
      states.set(stateId, Object.assign(new State(), {
        stateId,
        nameMm: String(nameState).trim(),
      }));
    }

    const dkey = `${stateId}|${districtId}`;
    if (!districts.has(dkey)) {
      districts.set(dkey, Object.assign(new District(), {
        stateId,
        districtId,
        nameMm: String(nameDistrict).trim(),
      }));
    }

    const tkey = `${stateId}|${districtId}|${townshipId}`;
    if (!townships.has(tkey)) {
      townships.set(tkey, Object.assign(new Township(), {
        stateId,
        districtId,
        townshipId,
        nameMm: String(nameTownship).trim(),
      }));
    }
  }

  // Insert in FK order; .orIgnore() makes the script re-runnable.
  await stateRepo
    .createQueryBuilder()
    .insert()
    .into(State)
    .values([...states.values()])
    .orIgnore('("state_id") DO NOTHING')
    .execute();
  console.log(`States upserted: ${states.size}`);

  await districtRepo
    .createQueryBuilder()
    .insert()
    .into(District)
    .values([...districts.values()])
    .orIgnore('("state_id","district_id") DO NOTHING')
    .execute();
  console.log(`Districts upserted: ${districts.size}`);

  await townshipRepo
    .createQueryBuilder()
    .insert()
    .into(Township)
    .values([...townships.values()])
    .orIgnore('("state_id","district_id","township_id") DO NOTHING')
    .execute();
  console.log(`Townships upserted: ${townships.size}`);

  console.log('Location seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Location seed failed:', err);
    process.exit(1);
  });
