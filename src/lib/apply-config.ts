export type ProviderRole =
  | 'handler'
  | 'breeder'
  | 'trainer'
  | 'veterinarian'
  | 'transporter'
  | 'employer';

export type ApplyConfig = {
  label: string;
  stepLabels: string[];
  certLabel: string;
  certAgencies: string[];
  certNotes: string;
  hasOwnDogQuestion: boolean;
  includeDogsStep: boolean;
  businessStep: boolean;
};

export const APPLY_CONFIGS: Record<ProviderRole, ApplyConfig> = {
  handler: {
    label: 'K9 Handler',
    stepLabels: ['Certifications', 'Goals', 'References', 'Create Profile', 'Dog Profiles'],
    certLabel: 'Handler Certifications',
    certAgencies: [
      'NAPWDA',
      'USPCA',
      'AKC (working titles)',
      'NASAR',
      'FEMA SAR',
      'IABTI',
    ],
    certNotes:
      "Select all agencies you hold or have held certifications from. If you don't have a dog, list any prior certifications or training programs instead.",
    hasOwnDogQuestion: true,
    includeDogsStep: true,
    businessStep: false,
  },
  breeder: {
    label: 'Breeder',
    stepLabels: ['Certifications', 'Goals', 'References', 'Create Profile', 'Dog Profiles'],
    certLabel: 'Breeder Credentials',
    certAgencies: [
      'USDA Licensed Kennel',
      'AKC Registered Breeder',
      'OFA Health Testing Program',
      'AWA (Animal Welfare Act) Compliant',
    ],
    certNotes:
      'Commercial breeders require a USDA license. Please upload your USDA license and documentation of humane kennel conditions (inspection records, photos).',
    hasOwnDogQuestion: false,
    includeDogsStep: true,
    businessStep: false,
  },
  trainer: {
    label: 'Trainer',
    stepLabels: ['Certifications', 'Goals', 'References', 'Create Profile'],
    certLabel: 'Trainer Certifications',
    certAgencies: [
      'NAPWDA',
      'USPCA',
      'AKC (working titles)',
      'CCPDT',
      'APDT',
      'NASAR',
    ],
    certNotes:
      'Select all certifications you hold. Upload supporting documentation for each.',
    hasOwnDogQuestion: false,
    includeDogsStep: false,
    businessStep: false,
  },
  veterinarian: {
    label: 'Veterinarian',
    stepLabels: ['Credentials', 'Goals', 'References', 'Create Profile'],
    certLabel: 'Veterinary Credentials',
    certAgencies: [
      'State Veterinary License',
      'AVMA Member',
      'ACVIM (Internal Medicine)',
      'ACVS (Surgery)',
      'Military/Government Veterinarian',
    ],
    certNotes:
      'Please upload your state veterinary license. If you hold board specialty certifications, upload those as well.',
    hasOwnDogQuestion: false,
    includeDogsStep: false,
    businessStep: false,
  },
  transporter: {
    label: 'Transporter',
    stepLabels: ['License & Insurance', 'Goals', 'References', 'Create Profile'],
    certLabel: 'Transportation Credentials',
    certAgencies: [
      'USDA APHIS Class T License (Commercial Animal Transporter)',
      'DOT Motor Carrier Number (interstate ground transport)',
      'IPATA Member (International Pet and Animal Transportation Association)',
      'IATA Certification (air cargo / live animal regulations)',
      'State Kennel / Boarding License (if holding animals)',
      'Certificate of Insurance (cargo / animal liability)',
    ],
    certNotes:
      'If you transport animals commercially across state lines, a USDA APHIS Class T license is required. Upload whichever credentials apply to your operation — ground carriers, air coordinators, and boarding facilities each have different requirements. Insurance documentation is strongly encouraged for all applicants.',
    hasOwnDogQuestion: false,
    includeDogsStep: false,
    businessStep: false,
  },
  employer: {
    label: 'Employer',
    stepLabels: ['Business Verification', 'Goals', 'References', 'Create Profile'],
    certLabel: 'Business Documentation',
    certAgencies: [
      'State Business License/Registration',
      'Federal EIN Documentation',
      'Certificate of Insurance',
      'Government Agency / Military Branch',
    ],
    certNotes:
      'Please provide documentation proving your business is legally registered and authorized to operate in the working-dog industry.',
    hasOwnDogQuestion: false,
    includeDogsStep: false,
    businessStep: true,
  },
};

export const PROVIDER_ROLES: ProviderRole[] = [
  'handler',
  'breeder',
  'trainer',
  'veterinarian',
  'transporter',
  'employer',
];

export function isProviderRole(v: unknown): v is ProviderRole {
  return typeof v === 'string' && (PROVIDER_ROLES as string[]).includes(v);
}
