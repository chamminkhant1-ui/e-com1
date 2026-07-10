import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../database/data-source';
import { EntranceRegistration } from '../database/entities/EntranceRegistration';
import type { InstitutionType } from '../database/entities/types';
import { readSheetRows } from './read';

// Column layout of Entrance_List.xlsx (header row):
// 0: စဉ်                           (row no)
// 1: ...အောင်မြင်သည့်ခုနှစ်       (exam year)       -> examYear
// 2: နည်းပညာ/ကွန်ပျူတာ            (institution)     -> institution enum
// 3: ...ခုံအမှတ်                    (exam roll no)    -> matricExamRollNo
// 4: အမည်(မြန်မာ)                  (applicant name)  -> applicantNameMm
// 5: အဘအမည်(မြန်မာ)              (father name)     -> fatherNameMm
// 6: ...ကတ်ပြားအမှတ်               (NRC)             -> nrcNumber
// 7: လေးဘာသာပေါင်း/နှစ်ဘာသာပေါင်း  (subject-group)   -> subjectGroupScore
// 8: စုစုပေါင်းရမှတ်               (total score)     -> totalScore
// 9: လျှောက်လွှာအမှတ်              (application no)  -> applicationNo

const NAME_FRAGMENT = 'Entrance_List';

/**
 * Maps the Myanmar institution label to the DB enum value.
 * Throws on anything unrecognised (fail-loud policy).
 */
function mapInstitution(raw: string): InstitutionType {
  const v = raw.trim();
  if (v === 'နည်းပညာ') return 'technology';
  if (v === 'ကွန်ပျူတာ') return 'computer';
  throw new Error(
    `Unrecognized institution "${v}" in Entrance_List.xlsx. ` +
      'Expected နည်းပညာ (technology) or ကွန်ပျူတာ (computer).',
  );
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  await AppDataSource.initialize();

  const rows = readSheetRows(NAME_FRAGMENT);

  // Skip the header row.
  const dataRows = rows.slice(1).filter((r) => r[3] || r[6]); // require roll or NRC

  if (dataRows.length === 0) {
    console.log('No data rows found in the entrance file.');
    return;
  }

  const repo = AppDataSource.getRepository(EntranceRegistration);

  const entities: EntranceRegistration[] = dataRows.map((r) => {
    const row = r as unknown[];
    const institution = mapInstitution(String(row[2] ?? ''));

    return Object.assign(new EntranceRegistration(), {
      examYear: String(row[1] ?? '').trim(),
      institution,
      matricExamRollNo: String(row[3] ?? '').trim(),
      applicantNameMm: String(row[4] ?? '').trim(),
      fatherNameMm: String(row[5] ?? '').trim(),
      nrcNumber: String(row[6] ?? '').trim(),
      subjectGroupScore: toNumberOrNull(row[7]),
      totalScore: toNumberOrNull(row[8]) ?? 0,
      applicationNo: String(row[9] ?? '').trim(),
    });
  });

  // exam_roll_no and nrc_number each have a UNIQUE constraint (not a composite
  // one), so we use a plain DO NOTHING upsert: rows that already exist (by roll
  // no or NRC) are skipped, making this re-runnable.
  await repo
    .createQueryBuilder()
    .insert()
    .into(EntranceRegistration)
    .values(entities)
    .orIgnore()
    .execute();

  console.log(`Entrance rows processed: ${entities.length}`);
  console.log('Entrance seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Entrance seed failed:', err);
    process.exit(1);
  });
