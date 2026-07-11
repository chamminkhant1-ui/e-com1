export type Role = 'student' | 'admin' | 'super' | 'finance' | 'owner';

export type GenderType = 'M' | 'F' | 'Other';

export type InstitutionType = 'computer' | 'technology';

export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'deferred';

export type AddressType = 'current' | 'parent' | 'office';

export type ClaimStatus = 'unclaimed' | 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type ApplicationStatus =
  | 'DRAFT'
  | 'PROFILE_COMPLETED'
  | 'NRC_UPLOADED'
  | 'DOCUMENTS_UPLOADED'
  | 'APPROVED'
  | 'REJECTED';
