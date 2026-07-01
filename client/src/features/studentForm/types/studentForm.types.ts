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
  std_myan_name: string;
  std_eng_name: string;
  dad_myan_name: string;
  dad_eng_name: string;
  mum_myan_name: string;
  mum_eng_name: string;

  // NRC
  nrc_std: NrcValue;
  nrc_dad: NrcValue;
  nrc_mum: NrcValue;

  // Race
  race_std: RaceValue;
  race_dad: RaceValue;
  race_mum: RaceValue;

  // Religion
  std_religion: string;
  dad_religion: string;
  mum_religion: string;

  // Student personal info
  std_dob: string;
  std_gender: string;

  // Matriculation
  intakeYear: string;
  matriPlaceSelect: string;
  matriRollNumber: string;
  std_mat_pass_school: string;

  // Parent occupation
  dad_work: string;
  mum_work: string;

  // Parent contact
  parent_contact: AddressValue;
  parent_phone: string;

  // Student contact
  student_contact: AddressValue;
  std_phone: string;
  std_email: string;
}
