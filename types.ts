
export enum UserRole {
  MD_Specialist = 'MD_Specialist', // e.g. Internal Medicine, Surgeon
  MD_General = 'MD_General',
  MedicalStudent = 'MedicalStudent',
  Nurse_Head = 'Nurse_Head',
  Nurse = 'Nurse',
  NursingStudent = 'NursingStudent'
}

export interface UserProfile {
  name: string;
  role: UserRole; 
  avatar: string;
}

export interface DrugOrder {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
}

export interface Order {
  id: string;
  type: 'Lab' | 'Imaging' | 'Drug';
  name: string;
  details?: string;
  // New specific fields for Drugs
  dosage?: string;
  route?: string;
  frequency?: string;
  
  status: 'Pending' | 'Completed' | 'Flagged';
  flagReason?: string;
  date: string;
  prescribedBy?: string; // Name of doctor
  completedBy?: string; // Name of nurse
}

export interface ProgressNote {
  id: string;
  date: string;
  note: string;
  author: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  ward: string; 
  diagnosis: string;
  admissionDate: string;
  status: 'Admitted' | 'Discharged';
  
  // Section 1: History
  chiefComplaint: string; 
  presentIllness: string; 
  
  // Histories
  pmh: string[]; 
  psh: string[]; 
  fh: string[];  
  dh: DrugOrder[]; 
  sh: string; 
  
  // ROS
  ros: Record<string, string[]>;
  
  // General & Vitals
  generalAppearance: string;
  vitalSigns: {
    bp: string;
    hr: string;
    rr: string;
    spo2: string;
    temp: string;
    gcs: string;
  };

  // Physical Exam
  physicalExam: Record<string, string>; 

  // Assessment
  problemList: string[];
  differentialDiagnosis: string[];
  primaryDiagnosis: string; 

  // Management
  orders: Order[];
  progressNotes: ProgressNote[];

  // Security
  auditLogs: AuditLogEntry[];

  // Legacy
  history?: string; 
  labData?: string;
  imaging?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; 
  type: 'Meeting' | 'Surgery' | 'Visit' | 'Personal';
}

export interface FinancialRecord {
  id: string;
  title: string;
  amount: number; 
  type: 'Income' | 'Outcome';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
  time: string;
}

export enum Page {
  Home = 'Home',
  Wards = 'Wards',
  Calendar = 'Calendar',
  Financials = 'Financials',
  Messages = 'Messages',
  Records = 'Records'
}