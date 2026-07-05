/**
 * Full entrance record returned by GET /api/entrance/me.
 * Mirrors the server's EntranceDto schema.
 */
export interface EntranceRecord {
  entranceId: number;
  examYear: string;
  examRollNo: string;
  applicantNameMm: string;
  fatherNameMm: string;
  nrcNumber: string;
  institution: 'computer' | 'technology';
  totalScore: number;
  subjectGroupScore: number | null;
  applicationNo: string;
}
