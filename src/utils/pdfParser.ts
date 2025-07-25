// src/utils/pdfParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types/resume';

// Set up PDF.js worker - REAL CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const parsePDFFile = async (file: File): Promise<ResumeData | null> => {
  try {
    console.log('Starting PDF parsing for file:', file.name);
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    // Extract text from all pages
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      console.log(`Page ${pageNum} text extracted, length:`, pageText.length);
    }
    
    console.log('Full text extracted, total length:', fullText.length);
    console.log('Text preview:', fullText.substring(0, 200) + '...');
    
    // Parse the extracted text
    const parsedData = parseResumeText(fullText);
    console.log('Parsing completed:', parsedData);
    
    return parsedData;
    
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseResumeText = (text: string): ResumeData => {
  console.log('Starting text parsing...');
  
  // Clean and split text into lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log('Text split into lines:', lines.length);
  
  // Initialize result
  const result: ResumeData = {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: []
  };
  
  // Find name (usually first line)
  if (lines.length > 0) {
    result.personalInfo.fullName = lines[0];
    console.log('Name found:', result.personalInfo.fullName);
  }
  
  // Extract contact information from first few lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Email extraction
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && !result.personalInfo.email) {
      result.personalInfo.email = emailMatch[1];
      console.log('Email found:', result.personalInfo.email);
    }
    
    // Phone extraction
    const phoneMatch = line.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch && !result.personalInfo.phone) {
      result.personalInfo.phone = phoneMatch[1];
      console.log('Phone found:', result.personalInfo.phone);
    }
    
    // LinkedIn extraction
    const linkedInMatch = line.match(/(linkedin\.com\/in\/[^\s]+)/i);
    if (linkedInMatch && !result.personalInfo.linkedIn) {
      result.personalInfo.linkedIn = linkedInMatch[1].startsWith('http') ? linkedInMatch[1] : `https://${linkedInMatch[1]}`;
      console.log('LinkedIn found:', result.personalInfo.linkedIn);
    }
    
    // Website extraction
    const websiteMatch = line.match(/(https?:\/\/[^\s]+)/);
    if (websiteMatch && !websiteMatch[1].includes('linkedin') && !result.personalInfo.website) {
      result.personalInfo.website = websiteMatch[1];
      console.log('Website found:', result.personalInfo.website);
    }
  }
  
  // Extract location (look for city/state patterns)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (!result.personalInfo.location) {
      // Look for patterns like "City, State" or "City, ST"
      const locationMatch = line.match(/([A-Za-z\s]+,\s*[A-Za-z]{2,})/);
      if (locationMatch && !locationMatch[1].includes('@') && !locationMatch[1].includes('http')) {
        result.personalInfo.location = locationMatch[1];
        console.log('Location found:', result.personalInfo.location);
      }
    }
  }
  
  // Find section indices
  const sectionIndices = findSectionIndices(lines);
  console.log('Section indices found:', sectionIndices);
  
  // Parse Professional Summary
  if (sectionIndices.summary !== -1) {
    result.personalInfo.summary = extractSummary(lines, sectionIndices.summary, sectionIndices);
    console.log('Summary extracted:', result.personalInfo.summary.substring(0, 100) + '...');
  }
  
  // Parse Experience
  if (sectionIndices.experience !== -1) {
    result.experience = extractExperience(lines, sectionIndices.experience, sectionIndices);
    console.log('Experience extracted:', result.experience.length, 'items');
  }
  
  // Parse Education
  if (sectionIndices.education !== -1) {
    result.education = extractEducation(lines, sectionIndices.education, sectionIndices);
    console.log('Education extracted:', result.education.length, 'items');
  }
  
  // Parse Skills
  if (sectionIndices.skills !== -1) {
    result.skills = extractSkills(lines, sectionIndices.skills, sectionIndices);
    console.log('Skills extracted:', result.skills.length, 'categories');
  }
  
  return result;
};

const findSectionIndices = (lines: string[]) => {
  const indices = {
    summary: -1,
    experience: -1,
    education: -1,
    skills: -1
  };
  
  lines.forEach((line, index) => {
    const upperLine = line.toUpperCase();
    
    if (upperLine.includes('PROFESSIONAL SUMMARY') || upperLine.includes('SUMMARY')) {
      indices.summary = index;
    }
    if (upperLine.includes('PROFESSIONAL EXPERIENCE') || upperLine.includes('WORK EXPERIENCE') || upperLine.includes('EXPERIENCE')) {
      indices.experience = index;
    }
    if (upperLine.includes('EDUCATION')) {
      indices.education = index;
    }
    if (upperLine.includes('TECHNICAL SKILLS') || upperLine.includes('SKILLS')) {
      indices.skills = index;
    }
  });
  
  return indices;
};

const getNextSectionIndex = (currentIndex: number, sectionIndices: any): number => {
  const indices = Object.values(sectionIndices).filter((idx: any) => idx > currentIndex);
  return indices.length > 0 ? Math.min(...indices as number[]) : -1;
};

const extractSummary = (lines: string[], startIndex: number, sectionIndices: any): string => {
  const endIndex = getNextSectionIndex(startIndex, sectionIndices);
  const summaryLines = [];
  
  for (let i = startIndex + 1; i < (endIndex === -1 ? lines.length : endIndex); i++) {
    const line = lines[i].trim();
    if (line && !line.toUpperCase().includes('PROFESSIONAL') && !line.toUpperCase().includes('EXPERIENCE')) {
      summaryLines.push(line);
    }
  }
  
  return summaryLines.join(' ');
};

const extractExperience = (lines: string[], startIndex: number, sectionIndices: any): any[] => {
  const endIndex = getNextSectionIndex(startIndex, sectionIndices);
  const experiences = [];
  
  let i = startIndex + 1;
  while (i < (endIndex === -1 ? lines.length : endIndex)) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }
    
    // Check if this looks like a job entry (not a bullet point)
    if (!line.startsWith('•') && !line.startsWith('-') && line.length > 10) {
      const experience = {
        id: `exp_${Date.now()}_${Math.random()}`,
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: [] as string[]
      };
      
      // Try to parse position and company from current line
      if (line.includes(' at ') || line.includes(' • ')) {
        const parts = line.split(/ at | • /);
        experience.position = parts[0].trim();
        experience.company = parts[1].trim();
      } else {
        experience.position = line;
      }
      
      // Look for company in next line if not found
      if (!experience.company && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!nextLine.includes('•') && !nextLine.includes('-') && nextLine.length > 0) {
          experience.company = nextLine;
          i++;
        }
      }
      
      // Look for date range in the next few lines
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const dateLine = lines[j];
        const dateMatch = dateLine.match(/(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|current)/i);
        if (dateMatch) {
          experience.startDate = convertToMonthYear(dateMatch[1]);
          if (dateMatch[2].toLowerCase().includes('present') || dateMatch[2].toLowerCase().includes('current')) {
            experience.current = true;
          } else {
            experience.endDate = convertToMonthYear(dateMatch[2]);
          }
          break;
        }
      }
      
      // Collect responsibilities (bullet points)
      i++;
      while (i < (endIndex === -1 ? lines.length : endIndex)) {
        const respLine = lines[i].trim();
        if (respLine.startsWith('•') || respLine.startsWith('-')) {
          experience.responsibilities.push(respLine.replace(/^[•-]\s*/, ''));
          i++;
        } else if (respLine && !respLine.toUpperCase().includes('EDUCATION') && !respLine.toUpperCase().includes('SKILLS')) {
          // If it's not a bullet point and not a section header, it might be another job
          break;
        } else {
          i++;
          break;
        }
      }
      
      if (experience.position || experience.company) {
        experiences.push(experience);
      }
    } else {
      i++;
    }
  }
  
  return experiences;
};

const extractEducation = (lines: string[], startIndex: number, sectionIndices: any): any[] => {
  const endIndex = getNextSectionIndex(startIndex, sectionIndices);
  const educations = [];
  
  let i = startIndex + 1;
  while (i < (endIndex === -1 ? lines.length : endIndex)) {
    const line = lines[i].trim();
    
    if (line) {
      const education = {
        id: `edu_${Date.now()}_${Math.random()}`,
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: ''
      };
      
      // Check if line contains degree information
      const degreePatterns = /(bachelor|master|phd|b\.s\.|m\.s\.|b\.a\.|m\.a\.|doctorate)/i;
      if (degreePatterns.test(line)) {
        if (line.includes(' in ')) {
          const parts = line.split(' in ');
          education.degree = parts[0].trim();
          education.field = parts[1].trim();
        } else {
          education.degree = line;
        }
        
        // Look for institution in next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (!degreePatterns.test(nextLine)) {
            education.institution = nextLine.split('•')[0].trim();
            
            // Look for graduation date
            const dateMatch = nextLine.match(/(\w+\s+\d{4})/);
            if (dateMatch) {
              education.graduationDate = convertToMonthYear(dateMatch[1]);
            }
            
            // Look for GPA
            const gpaMatch = nextLine.match(/gpa[:\s]*(\d+\.?\d*)/i);
            if (gpaMatch) {
              education.gpa = gpaMatch[1];
            }
            i++;
          }
        }
      } else {
        // Might be institution name
        education.institution = line;
      }
      
      if (education.degree || education.institution) {
        educations.push(education);
      }
    }
    i++;
  }
  
  return educations;
};

const extractSkills = (lines: string[], startIndex: number, sectionIndices: any): any[] => {
  const endIndex = getNextSectionIndex(startIndex, sectionIndices);
  const skills = [];
  
  for (let i = startIndex + 1; i < (endIndex === -1 ? lines.length : endIndex); i++) {
    const line = lines[i].trim();
    
    if (line && line.includes(':')) {
      const [category, skillsText] = line.split(':', 2);
      
      const skillCategory = {
        id: `skill_${Date.now()}_${Math.random()}`,
        category: category.trim(),
        skills: skillsText.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      if (skillCategory.category && skillCategory.skills.length > 0) {
        skills.push(skillCategory);
      }
    }
  }
  
  return skills;
};

const convertToMonthYear = (dateStr: string): string => {
  try {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const [month, year] = dateStr.trim().split(' ');
    const monthIndex = months.findIndex(m => m.toLowerCase().startsWith(month.toLowerCase()));
    
    if (monthIndex !== -1 && year) {
      return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    }
    
    return '';
  } catch {
    return '';
  }
};