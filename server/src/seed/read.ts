import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Directory that holds the example .xlsx files.
const DATA_DIR = path.join(__dirname, '..', 'database', 'example_data');

/**
 * Resolves an .xlsx file inside `example_data/` by a substring of its name.
 * Lets us avoid hard-coding long, non-ASCII filenames (e.g. the Myanmar
 * township export). Throws if zero or multiple files match.
 */
export function resolveDataFile(nameFragment: string): string {
  const matches = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.toLowerCase().endsWith('.xlsx'))
    .filter((f) => f.includes(nameFragment));

  if (matches.length === 0) {
    throw new Error(
      `No .xlsx file matching "${nameFragment}" found in ${DATA_DIR}`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple .xlsx files match "${nameFragment}": ${matches.join(', ')}`,
    );
  }
  return path.join(DATA_DIR, matches[0]);
}

/**
 * Reads the first worksheet of an .xlsx file and returns its rows as arrays.
 * The header row is included; callers usually skip it. `defval: ''` keeps
 * empty cells as empty strings so column indexes stay stable.
 */
export function readSheetRows(nameFragment: string): unknown[][] {
  const file = resolveDataFile(nameFragment);
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
    blankrows: false,
  });
}
