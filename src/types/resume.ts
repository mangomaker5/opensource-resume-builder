// src/types/resume.ts
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  website?: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  category: string;
  skills: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

// New types for PDF import
export interface PDFParseResult {
  success: boolean;
  data?: ResumeData;
  error?: string;
}

export interface ParsedSection {
  startIndex: number;
  endIndex?: number;
  content: string[];
}

export interface ParsingProgress {
  stage: 'extracting' | 'parsing' | 'populating' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
}