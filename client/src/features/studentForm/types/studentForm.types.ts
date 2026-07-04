export interface NrcValue {
  region: string;
  city: string;
  prefix: string;
  number: string;
}

export interface RaceValue {
  r1: string;
  r2: string;
  r3: string;
}

export interface AddressValue {
  state: string;
  district: string;
  township: string;
  address: string;
}

export interface StudentFormData {
  // Header info (read-only from server)
  registrationDate: string;
  acYear: string;
  admissionId: string;
  yearLevel: string;

  // Names
  nameMm: string;
  nameEn: string;
  fatherNameMm: string;
  fatherNameEn: string;
  motherNameMm: string;
  motherNameEn: string;

  // NRC
  studentNrc: NrcValue;
  fatherNrc: NrcValue;
  motherNrc: NrcValue;

  // Race
  ethnicity: RaceValue;
  fatherEthnicity: RaceValue;
  motherEthnicity: RaceValue;

  // Religion
  religion: string;
  fatherReligion: string;
  motherReligion: string;

  // Student personal info
  dob: string;
  gender: string;

  // Matriculation
  entryAcademicYear: string;
  matriPlaceSelect: string;
  matriRollNumber: string;
  highSchoolName: string;

  // Parent occupation
  fatherJob: string;
  motherJob: string;

  // Parent contact
  parent_contact: AddressValue;
  parentPhone: string;

  // Student contact
  student_contact: AddressValue;
  phoneNumber: string;
  std_email: string;
}
