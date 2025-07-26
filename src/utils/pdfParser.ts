// src/utils/pdfParser.ts - Simple Working Parser
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
      
      fullText += pageText + '\n';
    }
    
    console.log('Full text extracted, total length:', fullText.length);
    console.log('Raw text preview:', fullText.substring(0, 300));
    
    const parsedData = parseResumeText(fullText);
    return parsedData;
    
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseResumeText = (text: string): ResumeData => {
  console.log('=== STARTING SIMPLE PARSING ===');
  
  // Clean text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('Cleaned text length:', cleanText.length);
  
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
  
  // 1. Extract Contact Info (this seems to work)
  extractBasicInfo(cleanText, result);
  
  // 2. Extract Summary (simple approach)
  extractSummary(cleanText, result);
  
  // 3. Extract Experience (simple approach)  
  extractExperience(cleanText, result);
  
  // 4. Extract Education (simple approach)
  extractEducation(cleanText, result);
  
  // 5. Extract Skills (simple approach)
  extractSkills(cleanText, result);
  
  console.log('=== PARSING RESULTS ===');
  console.log('Name:', result.personalInfo.fullName);
  console.log('Email:', result.personalInfo.email);
  console.log('Summary length:', result.personalInfo.summary.length);
  console.log('Experience items:', result.experience.length);
  console.log('Education items:', result.education.length);
  console.log('Skill categories:', result.skills.length);
  
  return result;
};

const extractBasicInfo = (text: string, result: ResumeData) => {
  console.log('--- Extracting Basic Info ---');
  
  // Name - look for the pattern at the start
  const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatch) {
    result.personalInfo.fullName = nameMatch[1];
    console.log('✓ Name found:', result.personalInfo.fullName);
  }
  
  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    result.personalInfo.email = emailMatch[1];
    console.log('✓ Email found:', result.personalInfo.email);
  }
  
  // Phone  
  const phoneMatch = text.match(/(\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
  if (phoneMatch) {
    result.personalInfo.phone = phoneMatch[1];
    console.log('✓ Phone found:', result.personalInfo.phone);
  }
  
  // Location
  const locationMatch = text.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
  if (locationMatch) {
    result.personalInfo.location = locationMatch[1];
    console.log('✓ Location found:', result.personalInfo.location);
  }
  
  // LinkedIn
  const linkedInMatch = text.match(/(linkedin\.com\/in\/[^\s]+)/i);
  if (linkedInMatch) {
    result.personalInfo.linkedIn = `https://${linkedInMatch[1]}`;
    console.log('✓ LinkedIn found:', result.personalInfo.linkedIn);
  }
  
  // Website
  const websiteMatch = text.match(/([a-zA-Z0-9.-]+\.(?:dev|com|net|org|io))/);
  if (websiteMatch && !websiteMatch[1].includes('linkedin') && !websiteMatch[1].includes('email')) {
    result.personalInfo.website = `https://${websiteMatch[1]}`;
    console.log('✓ Website found:', result.personalInfo.website);
  }
};

const extractSummary = (text: string, result: ResumeData) => {
  console.log('--- Extracting Summary ---');
  
  // Look for summary section with flexible matching
  const summaryPatterns = [
    /(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE)\s*([^A-Z]{50,500}?)(?=[A-Z]{2,}\s+[A-Z]|$)/i,
    /SUMMARY\s+(.{50,500}?)(?=EXPERIENCE|EDUCATION|SKILLS)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.personalInfo.summary = match[1].trim();
      console.log('✓ Summary found, length:', result.personalInfo.summary.length);
      break;
    }
  }
  
  if (!result.personalInfo.summary) {
    console.log('✗ No summary found');
  }
};

const extractExperience = (text: string, result: ResumeData) => {
  console.log('--- Extracting Experience ---');
  
  // Find experience section
  const expMatch = text.match(/(?:PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|WORK\s+EXPERIENCE)\s+(.+?)(?=EDUCATION|SKILLS|$)/is);
  if (!expMatch) {
    console.log('✗ No experience section found');
    return;
  }
  
  const expText = expMatch[1];
  console.log('Experience section found, length:', expText.length);
  
  // Look for job entries with dates
  const jobPattern = /([A-Z][A-Za-z\s]+?)\s+([A-Z][A-Za-z\s&.]+?)\s*•\s*([A-Za-z\s,]+?)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*-\s*(?:Present|\w+\s+\d{4}))/g;
  
  let match;
  while ((match = jobPattern.exec(expText)) !== null) {
    const position = match[1].trim();
    const company = match[2].trim();
    const location = match[3].trim();
    const dateRange = match[4].trim();
    
    console.log(`Found job: ${position} at ${company}`);
    
    // Parse dates
    const [startDate, endDate] = dateRange.split(' - ');
    const isCurrent = endDate.toLowerCase().includes('present');
    
    // Find responsibilities (text after this job until next job or section end)
    const jobStart = expText.indexOf(match[0]) + match[0].length;
    const nextJobMatch = jobPattern.exec(expText);
    const jobEnd = nextJobMatch ? nextJobMatch.index : expText.length;
    
    const responsibilitiesText = expText.substring(jobStart, jobEnd);
    
    // Extract bullet points
    const responsibilities = responsibilitiesText
      .split(/Led|Architected|Mentored|Optimized|Collaborated|Developed|Managed|Created|Implemented/)
      .filter(r => r.trim().length > 20)
      .map(r => r.trim().replace(/^[^\w]*/, ''))
      .slice(0, 5);
    
    const experience = {
      id: `exp_${Date.now()}_${Math.random()}`,
      company: company,
      position: position,
      location: location,
      startDate: convertToMonthYear(startDate),
      endDate: isCurrent ? '' : convertToMonthYear(endDate),
      current: isCurrent,
      responsibilities: responsibilities.length > 0 ? responsibilities : ['']
    };
    
    result.experience.push(experience);
    console.log('✓ Added experience:', position);
    
    // Reset regex
    jobPattern.lastIndex = nextJobMatch ? nextJobMatch.index : expText.length;
  }
  
  console.log(`Total experience items: ${result.experience.length}`);
};

const extractEducation = (text: string, result: ResumeData) => {
  console.log('--- Extracting Education ---');
  
  // Find education section
  const eduMatch = text.match(/EDUCATION\s+(.+?)(?=TECHNICAL\s+SKILLS|SKILLS|$)/is);
  if (!eduMatch) {
    console.log('✗ No education section found');
    return;
  }
  
  const eduText = eduMatch[1];
  console.log('Education section found, length:', eduText.length);
  
  // Look for degree patterns
  const degreePattern = /(Master|Bachelor|PhD|M\.S\.|B\.S\.|MBA)\s+[^•]*?([A-Za-z\s&]+University[^•]*?)(?:GPA[:\s]*([0-9.]+))?\s*([A-Z][a-z]+\s+\d{4})/gi;
  
  let match;
  while ((match = degreePattern.exec(eduText)) !== null) {
    const degreeInfo = match[1];
    const institution = match[2].trim();
    const gpa = match[3] || '';
    const graduationDate = match[4];
    
    // Extract field from degree info
    const fieldMatch = degreeInfo.match(/(?:in|of)\s+([A-Za-z\s]+)/i);
    const field = fieldMatch ? fieldMatch[1].trim() : '';
    
    const education = {
      id: `edu_${Date.now()}_${Math.random()}`,
      institution: institution.replace(/\s*•.*$/, ''),
      degree: degreeInfo,
      field: field,
      graduationDate: convertToMonthYear(graduationDate),
      gpa: gpa
    };
    
    result.education.push(education);
    console.log('✓ Added education:', education.degree);
  }
  
  console.log(`Total education items: ${result.education.length}`);
};

const extractSkills = (text: string, result: ResumeData) => {
  console.log('--- Extracting Skills ---');
  
  // Find skills section
  const skillsMatch = text.match(/(?:TECHNICAL\s+SKILLS|SKILLS)\s+(.+?)$/is);
  if (!skillsMatch) {
    console.log('✗ No skills section found');
    return;
  }
  
  const skillsText = skillsMatch[1];
  console.log('Skills section found, length:', skillsText.length);
  
  // Extract skill categories
  const categoryPattern = /([A-Za-z\s&]+?):\s*([^:]+?)(?=[A-Z][A-Za-z\s&]*:|$)/g;
  
  let match;
  while ((match = categoryPattern.exec(skillsText)) !== null) {
    const category = match[1].trim();
    const skillsList = match[2].trim();
    
    const skills = skillsList
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 10);
    
    if (skills.length > 0) {
      const skillCategory = {
        id: `skill_${Date.now()}_${Math.random()}`,
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
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const [month, year] = dateStr.trim().split(' ');
    const monthIndex = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
    
    if (monthIndex !== -1 && year) {
      return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    }
    
    return '';
  } catch {
    return '';
  }
};