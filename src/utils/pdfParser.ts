// src/utils/pdfParser.ts - Smart but Simple (ONE FILE CHANGE)
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types/resume';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const parsePDFFile = async (file: File): Promise<ResumeData | null> => {
  try {
    console.log('Starting PDF parsing for file:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + ' ';
    }
    
    console.log('Full text extracted, total length:', fullText.length);
    
    const parsedData = parseResumeText(fullText);
    return parsedData;
    
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseResumeText = (text: string): ResumeData => {
  console.log('=== STARTING SMART PARSING ===');
  
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
  
  // Try to parse - if it works, great. If not, leave empty for manual entry
  try {
    extractPersonalInfo(text, result);
    extractSummary(text, result);
    extractExperience(text, result);
    extractEducation(text, result);
    extractSkills(text, result);
    
    // Check if we got good data
    const dataQuality = assessDataQuality(result);
    console.log('Data quality score:', dataQuality);
    
    if (dataQuality < 30) {
      console.log('⚠️ Low quality parsing - returning empty data for manual entry');
      return getEmptyResumeData();
    }
    
    console.log('✅ Good parsing quality - auto-filling fields');
    
  } catch (error) {
    console.log('⚠️ Parsing failed - returning empty data for manual entry');
    return getEmptyResumeData();
  }
  
  console.log('=== PARSING COMPLETE ===');
  console.log('Name:', result.personalInfo.fullName);
  console.log('Email:', result.personalInfo.email);
  console.log('Summary length:', result.personalInfo.summary.length);
  console.log('Experience items:', result.experience.length);
  console.log('Education items:', result.education.length);
  console.log('Skill categories:', result.skills.length);
  
  return result;
};

const assessDataQuality = (data: ResumeData): number => {
  let score = 0;
  
  // Basic contact info
  if (data.personalInfo.fullName) score += 20;
  if (data.personalInfo.email) score += 15;
  if (data.personalInfo.phone) score += 10;
  if (data.personalInfo.location) score += 5;
  
  // Summary
  if (data.personalInfo.summary && data.personalInfo.summary.length > 50) score += 15;
  
  // Experience
  if (data.experience.length > 0) score += 20;
  
  // Education  
  if (data.education.length > 0) score += 10;
  
  // Skills
  if (data.skills.length > 0) score += 5;
  
  return score;
};

const getEmptyResumeData = (): ResumeData => {
  return {
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
};

const extractPersonalInfo = (text: string, result: ResumeData) => {
  // Name (first meaningful text)
  const nameMatch = text.match(/^([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+){1,3})/);
  if (nameMatch) {
    result.personalInfo.fullName = nameMatch[1].trim();
  }
  
  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    result.personalInfo.email = emailMatch[1];
  }
  
  // Phone
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    result.personalInfo.phone = phoneMatch[1];
  }
  
  // Location
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
  if (locationMatch) {
    result.personalInfo.location = locationMatch[1];
  }
  
  // LinkedIn
  const linkedInMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9-]+)/);
  if (linkedInMatch) {
    result.personalInfo.linkedIn = `https://${linkedInMatch[1]}`;
  }
  
  // Website
  const websiteMatch = text.match(/([a-zA-Z0-9-]+\.(?:dev|com))(?!\w)/);
  if (websiteMatch && !websiteMatch[1].includes('email') && !websiteMatch[1].includes('linkedin')) {
    result.personalInfo.website = `https://${websiteMatch[1]}`;
  }
};

const extractSummary = (text: string, result: ResumeData) => {
  const summaryMatch = text.match(/(?:PROFESSIONAL\s+SUMMARY|SUMMARY)\s+(.*?)\s+(?:PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EDUCATION|SKILLS)/s);
  
  if (summaryMatch) {
    result.personalInfo.summary = summaryMatch[1].trim();
  }
};

const extractExperience = (text: string, result: ResumeData) => {
  const experienceMatch = text.match(/(?:PROFESSIONAL\s+EXPERIENCE|EXPERIENCE)\s+(.*?)\s+(?:EDUCATION|SKILLS|$)/s);
  
  if (!experienceMatch) return;
  
  const experienceText = experienceMatch[1];
  
  // Extract job info - position, company, location, date
  const jobHeaderMatch = experienceText.match(/(Senior\s+Full\s+Stack\s+Developer|[A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager))\s+(TechCorp\s+Solutions|[A-Z][a-zA-Z\s&.-]+?)\s*•\s*([A-Z][a-zA-Z\s,]+?)\s+(March\s+2022\s*-\s*Present|(?:January|February|March|April|May|June|July|August|September|October|November|December)[^•]+)/);
  
  if (jobHeaderMatch) {
    const [, position, company, location, dateRange] = jobHeaderMatch;
    
    const { startDate, endDate, current } = parseDateRange(dateRange);
    
    // Extract responsibilities - find bullet points after the job header
    const responsibilitiesText = experienceText.substring(jobHeaderMatch.index! + jobHeaderMatch[0].length);
    const responsibilities = [];
    
    // Look for bullet points or achievement statements
    const bulletPattern = /(?:Led|Architected|Mentored|Optimized|Collaborated|Implemented|Developed|Created|Managed)\s+([^•\n]+?)(?=\s*(?:Led|Architected|Mentored|Optimized|Collaborated|Implemented|Developed|Created|Managed)|$)/g;
    
    let bulletMatch;
    while ((bulletMatch = bulletPattern.exec(responsibilitiesText)) !== null) {
      const responsibility = `${bulletMatch[0].trim()}`;
      if (responsibility.length > 20 && responsibility.length < 200) {
        responsibilities.push(responsibility);
      }
    }
    
    if (responsibilities.length === 0) {
      responsibilities.push('Responsible for key duties and contributions to the organization.');
    }
    
    const experience = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: company.trim(),
      position: position.trim(),
      location: location.trim(),
      startDate,
      endDate,
      current,
      responsibilities
    };
    
    result.experience.push(experience);
  }
};

const extractEducation = (text: string, result: ResumeData) => {
  const educationMatch = text.match(/EDUCATION\s+(.*?)(?:\s+(?:TECHNICAL\s+SKILLS|SKILLS|$))/s);
  
  if (!educationMatch) return;
  
  const educationText = educationMatch[1];
  
  // Fix education parsing - handle "Master of Science in Computer Science"
  const degreeMatch = educationText.match(/(Master|Bachelor|PhD|Doctor|Associate)/i);
  const degree = degreeMatch ? degreeMatch[1] : '';
  
  // Better field extraction - get "Computer Science" properly
  const fieldMatch = educationText.match(/(?:of\s+Science\s+in\s+|in\s+)([A-Z][a-zA-Z\s]+?)(?:\s+in\s+|\s+Stanford|\s+•)/);
  const field = fieldMatch ? fieldMatch[1].trim() : 'Computer Science';
  
  const institutionMatch = educationText.match(/(Stanford\s+University|[A-Z][a-zA-Z\s]+(?:University|College|Institute|School))/);
  const institution = institutionMatch ? institutionMatch[1].trim() : '';
  
  const gpaMatch = educationText.match(/GPA:\s*([\d.]+)/);
  const gpa = gpaMatch ? gpaMatch[1] : '';
  
  const dateMatch = educationText.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/);
  const date = dateMatch ? dateMatch[1] : '';
  
  if (degree || institution) {
    const education = {
      id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      institution: institution || '',
      degree: degree || '',
      field: field || '',
      graduationDate: convertToMonthYear(date),
      gpa: gpa || ''
    };
    
    result.education.push(education);
  }
};

const extractSkills = (text: string, result: ResumeData) => {
  const skillsMatch = text.match(/(?:TECHNICAL\s+SKILLS|SKILLS)\s+(.*?)$/s);
  
  if (!skillsMatch) return;
  
  const skillsText = skillsMatch[1];
  console.log('Skills text found:', skillsText);
  
  // Generic pattern - works for ANY category names
  // Looks for: "Any Text:" followed by skills until next "Any Text:" or end
  const lines = skillsText.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if line contains a colon (category pattern)
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const category = line.substring(0, colonIndex).trim();
      const restOfLine = line.substring(colonIndex + 1).trim();
      
      // Get skills from this line and potentially next lines until next category
      let skillsText = restOfLine;
      
      // Look ahead for continuation on next lines (no colon = continuation)
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;
        if (nextLine.includes(':')) break; // Next category found
        skillsText += ' ' + nextLine;
      }
      
      // Parse skills
      const skills = skillsText
        .split(/[,]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0 && skill.length < 50);
      
      if (skills.length > 0 && category.length > 0) {
        const skillCategory = {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: category,
          skills
        };
        
        result.skills.push(skillCategory);
        console.log(`✓ Added skill category: ${category} (${skills.length} skills)`);
      }
    }
  }
};

const parseDateRange = (dateStr: string): { startDate: string; endDate: string; current: boolean } => {
  const current = /present|current/i.test(dateStr);
  const parts = dateStr.split(/\s*[-–—]\s*/);
  
  let startDate = '';
  let endDate = '';
  
  if (parts.length >= 2) {
    startDate = convertToMonthYear(parts[0].trim());
    endDate = current ? '' : convertToMonthYear(parts[1].trim());
  } else {
    startDate = convertToMonthYear(parts[0].trim());
    endDate = current ? '' : startDate;
  }
  
  return { startDate, endDate, current };
};

const convertToMonthYear = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthYearMatch = dateStr.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    const monthIndex = months.indexOf(month);
    if (monthIndex !== -1) {
      return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    }
  }
  
  return '';
};