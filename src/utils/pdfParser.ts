// src/utils/pdfParser.ts - Simple Closed-Loop Parser
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
    console.log('Raw text:', fullText);
    
    const parsedData = parseResumeText(fullText);
    return parsedData;
    
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseResumeText = (text: string): ResumeData => {
  console.log('=== STARTING SIMPLE PARSING ===');
  
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
  
  // Extract all sections
  extractPersonalInfo(text, result);
  extractSummary(text, result);
  extractExperience(text, result);
  extractEducation(text, result);
  extractSkills(text, result);
  
  console.log('=== PARSING COMPLETE ===');
  console.log('Name:', result.personalInfo.fullName);
  console.log('Email:', result.personalInfo.email);
  console.log('Summary length:', result.personalInfo.summary.length);
  console.log('Experience items:', result.experience.length);
  console.log('Education items:', result.education.length);
  console.log('Skill categories:', result.skills.length);
  
  return result;
};

const extractPersonalInfo = (text: string, result: ResumeData) => {
  console.log('--- Extracting Personal Information ---');
  
  // Extract name (first meaningful text before email)
  const nameMatch = text.match(/^([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)/);
  if (nameMatch) {
    result.personalInfo.fullName = nameMatch[1].trim();
    console.log('✓ Name:', result.personalInfo.fullName);
  }
  
  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    result.personalInfo.email = emailMatch[1];
    console.log('✓ Email:', result.personalInfo.email);
  }
  
  // Extract phone
  const phoneMatch = text.match(/(\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
  if (phoneMatch) {
    result.personalInfo.phone = phoneMatch[1];
    console.log('✓ Phone:', result.personalInfo.phone);
  }
  
  // Extract location
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
  if (locationMatch) {
    result.personalInfo.location = locationMatch[1];
    console.log('✓ Location:', result.personalInfo.location);
  }
  
  // Extract LinkedIn
  const linkedInMatch = text.match(/(https?:\/\/)?linkedin\.com\/in\/[^\s]+/i);
  if (linkedInMatch) {
    result.personalInfo.linkedIn = linkedInMatch[0].startsWith('http') 
      ? linkedInMatch[0] 
      : `https://${linkedInMatch[0]}`;
    console.log('✓ LinkedIn:', result.personalInfo.linkedIn);
  }
  
  // Extract website
  const websiteMatch = text.match(/(https?:\/\/)?([a-zA-Z0-9.-]+\.(?:dev|com|net|org|io))/);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('@')) {
    result.personalInfo.website = websiteMatch[0].startsWith('http') 
      ? websiteMatch[0] 
      : `https://${websiteMatch[0]}`;
    console.log('✓ Website:', result.personalInfo.website);
  }
};

const extractSummary = (text: string, result: ResumeData) => {
  console.log('--- Extracting Professional Summary ---');
  
  // Find text between PROFESSIONAL SUMMARY and next section
  const summaryMatch = text.match(/PROFESSIONAL\s+SUMMARY\s+(.+?)(?=PROFESSIONAL\s+EXPERIENCE|TECHNICAL\s+SKILLS|EXPERIENCE|EDUCATION)/is);
  
  if (summaryMatch) {
    result.personalInfo.summary = summaryMatch[1].trim();
    console.log('✓ Summary found, length:', result.personalInfo.summary.length);
  } else {
    console.log('✗ No summary found');
  }
};

const extractExperience = (text: string, result: ResumeData) => {
  console.log('--- Extracting Professional Experience ---');
  
  // Find experience section
  const expMatch = text.match(/PROFESSIONAL\s+EXPERIENCE\s+(.+?)(?=EDUCATION|TECHNICAL\s+SKILLS)/is);
  if (!expMatch) {
    console.log('✗ No experience section found');
    return;
  }
  
  const expText = expMatch[1].trim();
  console.log('Experience section found, length:', expText.length);
  
  // Since your PDF generates this format:
  // "Senior Full Stack Developer Company Name • TechCorp Solutions • San Francisco, CA January 2022 - Present Led development..."
  
  // Look for job title followed by company pattern
  const jobPattern = /([A-Z][a-zA-Z\s]+?)\s+([^•]+•[^•]+•[^•]+)\s+([A-Z][a-z]+\s+\d{4}\s*-\s*(?:Present|[A-Z][a-z]+\s+\d{4}))\s*(.+?)(?=[A-Z][a-zA-Z\s]+?\s+[^•]+•|$)/g;
  
  let match;
  while ((match = jobPattern.exec(expText)) !== null) {
    const position = match[1].trim();
    const companyLine = match[2].trim();
    const dateRange = match[3].trim();
    const responsibilitiesText = match[4].trim();
    
    console.log('Found job:', position);
    console.log('Company line:', companyLine);
    console.log('Date range:', dateRange);
    
    // Parse company line: "Company Name • TechCorp Solutions • San Francisco, CA"
    const companyParts = companyLine.split('•').map(part => part.trim());
    const company = companyParts[1] || companyParts[0];
    const location = companyParts[companyParts.length - 1];
    
    // Parse dates
    const [startDateStr, endDateStr] = dateRange.split(' - ');
    const current = endDateStr.toLowerCase().includes('present');
    const startDate = convertToMonthYear(startDateStr.trim());
    const endDate = current ? '' : convertToMonthYear(endDateStr.trim());
    
    // Parse responsibilities (split by common starting words)
    const responsibilities = responsibilitiesText
      .split(/(?=Led |Architected |Mentored |Optimized |Collaborated |Developed |Managed |Created |Implemented )/i)
      .map(resp => resp.trim())
      .filter(resp => resp.length > 5)
      .slice(0, 10);
    
    if (responsibilities.length === 0) {
      responsibilities.push('');
    }
    
    const experience = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: company,
      position: position,
      location: location,
      startDate: startDate,
      endDate: endDate,
      current: current,
      responsibilities: responsibilities
    };
    
    result.experience.push(experience);
    console.log('✓ Added experience:', position, 'at', company);
  }
  
  console.log(`Total experience items: ${result.experience.length}`);
};

const extractEducation = (text: string, result: ResumeData) => {
  console.log('--- Extracting Education ---');
  
  // Find education section
  const eduMatch = text.match(/EDUCATION\s+(.+?)(?=TECHNICAL\s+SKILLS|$)/is);
  if (!eduMatch) {
    console.log('✗ No education section found');
    return;
  }
  
  const eduText = eduMatch[1].trim();
  console.log('Education section found, length:', eduText.length);
  console.log('Education text:', eduText);
  
  // Your format: "Master of Science in Computer Science in Computer Science Stanford University • GPA: 3.8 December 2016"
  const eduPattern = /(Master|Bachelor|PhD|M\.S\.|B\.S\.|MBA|Associate)[^•]+?([A-Z][^•]+University[^•]*?)(?:•\s*GPA[:\s]*([0-9.]+))?\s*([A-Z][a-z]+\s+\d{4})/gi;
  
  let match;
  while ((match = eduPattern.exec(eduText)) !== null) {
    const degreeFull = match[1] + match[0].substring(match[1].length, match[0].indexOf(match[2]));
    const institution = match[2].trim();
    const gpa = match[3] || '';
    const graduationDate = match[4];
    
    // Extract field from degree
    const fieldMatch = degreeFull.match(/(?:in|of)\s+([^in]+?)(?:\s+in\s+|$)/i);
    const field = fieldMatch ? fieldMatch[1].trim() : '';
    
    const education = {
      id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      institution: institution,
      degree: match[1], // Just the degree type
      field: field,
      graduationDate: convertToMonthYear(graduationDate),
      gpa: gpa
    };
    
    result.education.push(education);
    console.log('✓ Added education:', match[1], 'from', institution);
  }
  
  console.log(`Total education items: ${result.education.length}`);
};

const extractSkills = (text: string, result: ResumeData) => {
  console.log('--- Extracting Technical Skills ---');
  
  // Find skills section
  const skillsMatch = text.match(/TECHNICAL\s+SKILLS\s+(.+?)$/is);
  if (!skillsMatch) {
    console.log('✗ No skills section found');
    return;
  }
  
  const skillsText = skillsMatch[1];
  console.log('Skills section found, length:', skillsText.length);
  
  // Extract skill categories
  const categoryPattern = /([A-Za-z\s&]+?):\s*([^:]+?)(?=\s*[A-Za-z\s&]+:|$)/g;
  
  let match;
  while ((match = categoryPattern.exec(skillsText)) !== null) {
    const category = match[1].trim();
    const skillsList = match[2].trim();
    
    const skills = skillsList
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 15);
    
    if (skills.length > 0) {
      const skillCategory = {
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: category,
        skills: skills
      };
      
      result.skills.push(skillCategory);
      console.log(`✓ Added skill category: ${category} (${skills.length} skills)`);
    }
  }
  
  console.log(`Total skill categories: ${result.skills.length}`);
};

const convertToMonthYear = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const cleanDate = dateStr.trim();
    const monthYearMatch = cleanDate.match(/^([A-Za-z]+)\s+(\d{4})$/);
    
    if (monthYearMatch) {
      const month = monthYearMatch[1];
      const year = monthYearMatch[2];
      
      const monthIndex = months.findIndex(m => 
        m.toLowerCase().startsWith(month.toLowerCase().substring(0, 3))
      );
      
      if (monthIndex !== -1) {
        return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Date conversion error:', error);
    return '';
  }
};