import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../database/data-source';
import { Major } from '../database/entities/Major';
import { Semester } from '../database/entities/Semester';
import { AcademicYear } from '../database/entities/AcademicYear';

async function main() {
  await AppDataSource.initialize();

  const majorRepo = AppDataSource.getRepository(Major);
  const semesterRepo = AppDataSource.getRepository(Semester);
  const academicYearRepo = AppDataSource.getRepository(AcademicYear);

  const majors = [
    { majorNameMm: 'ကွန်ပျူတာသိပ္ပံနှင့်နည်းပညာ', majorNameEn: 'Computer Science and Technology (CST)', institution: 'computer' as const },
    { majorNameMm: 'ကွန်ပျူတာနည်းပညာ', majorNameEn: 'Computer Technology (CT)', institution: 'computer' as const },
    { majorNameMm: 'ကွန်ပျူတာသိပ္ပံ', majorNameEn: 'Computer Science (CS)', institution: 'computer' as const },
  ];

  for (const m of majors) {
    await majorRepo
      .createQueryBuilder()
      .insert()
      .into(Major)
      .values(m)
      .orIgnore('("major_name_mm") DO NOTHING')
      .execute();
  }
  console.log(`Majors upserted: ${majors.length}`);

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const semesters = romanNumerals.map((numeral, index) => ({
    semesterName: `Semester ${numeral}`,
    numericalLevel: index + 1,
  }));

  for (const s of semesters) {
    await semesterRepo
      .createQueryBuilder()
      .insert()
      .into(Semester)
      .values(s)
      .orIgnore('("semester_name") DO NOTHING')
      .execute();
  }
  console.log(`Semesters upserted: ${semesters.length}`);

  const currentYear = new Date().getFullYear();
  const academicYears = [
    { academicYearId: `${currentYear}-${currentYear + 1}`, isActive: true },
  ];

  for (const ay of academicYears) {
    await academicYearRepo
      .createQueryBuilder()
      .insert()
      .into(AcademicYear)
      .values(ay)
      .orIgnore('("academic_year_id") DO NOTHING')
      .execute();
  }
  console.log(`Academic years upserted: ${academicYears.length}`);

  console.log('Academic setup seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Academic setup seed failed:', err);
    process.exit(1);
  });
