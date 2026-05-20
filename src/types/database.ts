import type { Role } from "@/lib/roles";
import type { DogStatus, DogSex, DocType } from "@/lib/dogs";
import type { JobStatus, BidStatus, JobCategory } from "@/lib/marketplace";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  search_radius_miles: number;
  bio: string | null;
  avatar_url: string | null;
  contact_email: string | null;
  website: string | null;
  tags: string[];
  detection_capabilities: string[];
  cert_meaning: string | null;
  cert_audience: string | null;
  cert_requirements: string | null;
  notify_on_bids: boolean;
  notify_on_matching_jobs: boolean;
  notify_on_messages: boolean;
  approval_status: "pending" | "approved" | "rejected";
  application_data: Record<string, unknown> | null;
  is_admin: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type Certification = {
  id: string;
  profile_id: string;
  title: string;
  issuer: string | null;
  issued_date: string | null;
  file_url: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Dog = {
  id: string;
  owner_id: string;
  name: string;
  call_name: string | null;
  breed: string | null;
  sex: DogSex | null;
  date_of_birth: string | null;
  color: string | null;
  registration: string | null;
  status: DogStatus;
  bio: string | null;
  avatar_url: string | null;
  detection_capabilities: string[];
  created_at: string;
  updated_at: string;
};

export type DogCertification = {
  id: string;
  dog_id: string;
  title: string;
  issuer: string | null;
  issued_date: string | null;
  file_url: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  notes: string | null;
  created_at: string;
};

export type DogTrainingEntry = {
  id: string;
  dog_id: string;
  entry_date: string;
  title: string;
  notes: string | null;
  created_at: string;
};

export type DogVetRecord = {
  id: string;
  dog_id: string;
  record_date: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type DogDocument = {
  id: string;
  dog_id: string;
  doc_type: DocType;
  title: string;
  notes: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type DogVetRecordWithUrl = DogVetRecord & { signed_url: string | null };
export type DogDocumentWithUrl = DogDocument & { signed_url: string | null };

export type JobPost = {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: JobCategory;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  duration: string | null;
  pay: string | null;
  required_licensing: string | null;
  required_capabilities: string[];
  other_capability: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

export type Bid = {
  id: string;
  job_id: string;
  bidder_id: string;
  amount: string | null;
  message: string;
  status: BidStatus;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  reviewee_id: string;
  reviewer_id: string;
  rating: number; // 1–5
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export type EventPost = {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  location: string | null;
  start_at: string;
  end_at: string | null;
  url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  author_id: string;
  title: string;
  summary: string | null;
  body: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentListing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  condition: string | null;
  price: string | null;
  price_cents: number | null;
  location: string | null;
  image_url: string | null;
  status: "available" | "sold" | "removed";
  pack_tags: string[];
  created_at: string;
  updated_at: string;
};
