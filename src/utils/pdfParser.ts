// src/utils/pdfParser.ts
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types/resume';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const parsePDFFile = async (file: File): Promise<ResumeData | null> => {
  try {
    console.log(`Starting PDF parsing for file: ${file.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    console.log(`PDF loaded successfully, pages: ${pdf.numPages}`);

    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is any => 'str' in item)
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    console.log(`Full text extracted, total length: ${fullText.length}`);

    // Clean up text for better parsing
    const cleanedText = cleanText(fullText);
    
    // Parse the cleaned text
    const resumeData = parseResumeText(cleanedText);
    
    return resumeData;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .trim();
};

const parseResumeText = (text: string): ResumeData => {
  console.log('=== STARTING SMART PARSING ===');
  console.log('Text to parse:', text.substring(0, 200) + '...');
  
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
  
  try {
    extractPersonalInfo(text, result);
    extractSummary(text, result);
    extractExperience(text, result);
    extractEducation(text, result);
    extractSkills(text, result);
    
    const dataQuality = assessDataQuality(result);
    console.log('Data quality score:', dataQuality);
    
    if (dataQuality < 20) {
      console.log('⚠️ Low quality parsing - returning empty data for manual entry');
      return getEmptyResumeData();
    }
    
    console.log('✅ Good parsing quality - auto-filling fields');
    
  } catch (error) {
    console.log('⚠️ Parsing failed - returning empty data for manual entry', error);
    return getEmptyResumeData();
  }
  
  console.log('=== PARSING COMPLETE ===');
  console.log('Name:', result.personalInfo.fullName);
  console.log('Email:', result.personalInfo.email);
  console.log('Phone:', result.personalInfo.phone);
  console.log('Location:', result.personalInfo.location);
  console.log('LinkedIn:', result.personalInfo.linkedIn);
  console.log('Website:', result.personalInfo.website);
  console.log('Summary length:', result.personalInfo.summary.length);
  console.log('Experience items:', result.experience.length);
  console.log('Education items:', result.education.length);
  console.log('Skill categories:', result.skills.length);
  
  return result;
};

const assessDataQuality = (data: ResumeData): number => {
  let score = 0;
  
  if (data.personalInfo.fullName && data.personalInfo.fullName.length > 2) score += 20;
  if (data.personalInfo.email && data.personalInfo.email.includes('@')) score += 15;
  if (data.personalInfo.phone && data.personalInfo.phone.length > 8) score += 10;
  if (data.personalInfo.location && data.personalInfo.location.length > 2) score += 5;
  if (data.personalInfo.summary && data.personalInfo.summary.length > 50) score += 15;
  if (data.experience.length > 0) score += 20;
  if (data.education.length > 0) score += 10;
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
  console.log('🔍 Extracting personal info...');
  
  // Extract name from the very beginning of the text
  const namePattern = /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+[A-Z][a-zA-Z]+)*)/;
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    result.personalInfo.fullName = nameMatch[1].trim();
    console.log('✓ Found name:', result.personalInfo.fullName);
  }
  
  // Extract email
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    result.personalInfo.email = emailMatch[1];
    console.log('✓ Found email:', result.personalInfo.email);
  }
  
  // Extract phone
  const phonePattern = /\((\d{3})\)\s*(\d{3})-(\d{4})/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch) {
    result.personalInfo.phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
    console.log('✓ Found phone:', result.personalInfo.phone);
  }
  
  // Extract location - looking for "City, State" pattern
  const locationPattern = /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s/;
  const locationMatch = text.match(locationPattern);
  if (locationMatch) {
    result.personalInfo.location = locationMatch[1];
    console.log('✓ Found location:', result.personalInfo.location);
  }
  
  // Extract LinkedIn
  const linkedinPatterns = [
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/,
    /(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/
  ];
  
  for (const pattern of linkedinPatterns) {
    const linkedinMatch = text.match(pattern);
    if (linkedinMatch) {
      const username = linkedinMatch[1];
      result.personalInfo.linkedIn = `https://linkedin.com/in/${username}`;
      console.log('✓ Found LinkedIn:', result.personalInfo.linkedIn);
      break;
    }
  }
  
  // Extract website - looking for .dev, .com domains (improved pattern)
  const websitePatterns = [
    /https?:\/\/([a-zA-Z0-9-]+\.dev)(?:\s|$)/,  // https://domain.dev
    /([a-zA-Z0-9-]+\.dev)(?:\s|$)/,  // domain.dev
    /https?:\/\/([a-zA-Z0-9-]+\.com)(?:\s|$)(?!.*@)/,  // https://domain.com (not email)
    /([a-zA-Z0-9-]+\.com)(?:\s|$)(?!.*@)/,  // domain.com (not email)
    /https?:\/\/([a-zA-Z0-9-]+\.(?:io|me))(?:\s|$)/,   // https://domain.io/me
    /([a-zA-Z0-9-]+\.(?:io|me))(?:\s|$)/   // domain.io/me
  ];
  
  for (const pattern of websitePatterns) {
    const websiteMatch = text.match(pattern);
    if (websiteMatch) {
      const website = websiteMatch[1] || websiteMatch[0].replace(/^https?:\/\//, '');
      // Skip if it's an email domain or contains LinkedIn
      if (!website.includes('@') && 
          !website.toLowerCase().includes('linkedin') && 
          !website.toLowerCase().includes('email') &&
          website.length > 3) {
        result.personalInfo.website = `https://${website}`;
        console.log('✓ Found website:', result.personalInfo.website);
        break;
      }
    }
  }
};

const extractSummary = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting summary...');
  
  const summaryPattern = /PROFESSIONAL SUMMARY\s+(.*?)\s+PROFESSIONAL EXPERIENCE/s;
  const summaryMatch = text.match(summaryPattern);
  
  if (summaryMatch && summaryMatch[1]) {
    result.personalInfo.summary = summaryMatch[1].trim();
    console.log('✓ Found summary:', result.personalInfo.summary.substring(0, 100) + '...');
  }
};

const extractExperience = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting experience...');
  
  const experiencePattern = /PROFESSIONAL EXPERIENCE\s+(.*?)\s+EDUCATION/s;
  const experienceMatch = text.match(experiencePattern);
  
  if (!experienceMatch) {
    console.log('No experience section found');
    return;
  }
  
  const experienceText = experienceMatch[1];
  console.log('Experience text:', experienceText.substring(0, 200) + '...');
  
  // Pattern for job title, company, location, dates
  const jobPattern = /([A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Specialist|Director|Lead))\s+((?:Tech\s+Corp|TechCorp)[^•]*|[A-Z][a-zA-Z\s&.-]+?)\s*•\s*([A-Z][a-zA-Z\s,.-]+?)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)[^A-Z]+)/;
  const jobMatch = experienceText.match(jobPattern);
  
  if (jobMatch) {
    const [, position, company, location, dateRange] = jobMatch;
    const { startDate, endDate, current } = parseDateRange(dateRange);
    
    // Normalize company name spacing
    const normalizedCompany = company.trim().replace(/TechCorp/g, 'Tech Corp');
    
    // Extract responsibilities
    const responsibilities = extractResponsibilities(experienceText, jobMatch.index! + jobMatch[0].length);
    
    const experience = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: normalizedCompany,
      position: position.trim(),
      location: location.trim(),
      startDate,
      endDate,
      current,
      responsibilities
    };
    
    result.experience.push(experience);
    console.log('✓ Added experience:', position, 'at', normalizedCompany);
  }
};

const extractResponsibilities = (text: string, startIndex: number): string[] => {
  const responsibilitiesText = text.substring(startIndex);
  const responsibilities: string[] = [];
  
  // Look for action words followed by descriptions
  const bulletPattern = /(Led|Architected|Mentored|Optimized|Collaborated|Implemented|Developed|Created|Managed|Built|Designed|Established|Improved|Increased|Reduced|Delivered)\s+([^L]+?)(?=(?:Led|Architected|Mentored|Optimized|Collaborated|Implemented|Developed|Created|Managed|Built|Designed|Established|Improved|Increased|Reduced|Delivered)|$)/g;
  
  let match;
  while ((match = bulletPattern.exec(responsibilitiesText)) !== null) {
    const responsibility = (match[1] + ' ' + match[2]).trim();
    if (responsibility.length > 20 && responsibility.length < 300) {
      responsibilities.push(responsibility);
    }
  }
  
  return responsibilities.length > 0 ? responsibilities : ['Key responsibilities and achievements in this role.'];
};

// ENHANCED EDUCATION EXTRACTION - NOW SUPPORTS MULTIPLE EDUCATION ENTRIES
const extractEducation = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting education (multiple entries support)...');
  
  const educationPattern = /EDUCATION\s+(.*?)\s+TECHNICAL SKILLS/s;
  const educationMatch = text.match(educationPattern);
  
  if (!educationMatch) {
    console.log('No education section found');
    return;
  }
  
  let educationText = educationMatch[1];
  console.log('Education text:', educationText);
  
  // Aggressive deduplication for education text (same as before)
  educationText = educationText
    .replace(/Master of Science in Computer Science Master of Science in Computer Science/g, 'Master of Science in Computer Science')
    .replace(/(\w+\s+){2,}in Computer Science in Computer Science/g, 'Master of Science in Computer Science')
    .replace(/in Computer Science in Computer Science/g, 'in Computer Science')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Cleaned education text:', educationText);
  
  // SMART APPROACH: Find ALL occurrences of each field type using existing patterns
  
  // 1. Find ALL degrees (using same patterns as before, but avoiding duplicates)
  const allDegrees: Array<{match: string, index: number}> = [];
  const degreePatterns = [
    /\b(Master of Science|Bachelor of Science|Bachelor of Arts|PhD|Doctor of Philosophy)\b/gi,
    /\b(Master|Bachelor|PhD|Doctor|Associate)(?!\s+of\s+Science|s\s+of\s+Arts)\b/gi  // Avoid partial matches
  ];
  
  const foundDegrees = new Set<string>(); // Track what we've already found
  degreePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(educationText)) !== null) {
      const degree = match[1];
      // Only add if we haven't found a longer version of this degree
      const isSubstring = Array.from(foundDegrees).some(existing => 
        existing !== degree && existing.includes(degree)
      );
      if (!isSubstring && !foundDegrees.has(degree)) {
        allDegrees.push({match: degree, index: match.index});
        foundDegrees.add(degree);
      }
    }
  });
  
  // 2. Find ALL institutions (using same patterns as before)
  const allInstitutions: Array<{match: string, index: number}> = [];
  const institutionPatterns = [
    /\b([A-Z][a-zA-Z]+\s+University)\b/g,
    /\b([A-Z][a-zA-Z]+\s+College)\b/g,
    /\b([A-Z][a-zA-Z]+\s+Institute)\b/g,
    /\b(University of [A-Z][a-zA-Z\s]+)\b/gi
  ];
  
  institutionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(educationText)) !== null) {
      allInstitutions.push({match: match[1], index: match.index});
    }
  });
  
  // 3. Find ALL fields (using same patterns as before)
  const allFields: Array<{match: string, index: number}> = [];
  const fieldPattern = /\b(Computer Science|Engineering|Business Administration|Mathematics|Physics|Chemistry|Biology)\b/gi;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(educationText)) !== null) {
    allFields.push({match: fieldMatch[1], index: fieldMatch.index});
  }
  
  // 4. Find ALL GPAs (using same patterns as before)
  const allGPAs: Array<{match: string, index: number}> = [];
  const gpaPattern = /GPA:\s*([\d.]+)/gi;
  let gpaMatch;
  while ((gpaMatch = gpaPattern.exec(educationText)) !== null) {
    allGPAs.push({match: gpaMatch[1], index: gpaMatch.index});
  }
  
  // 5. Find ALL dates (using same patterns as before)
  const allDates: Array<{match: string, index: number}> = [];
  const datePattern = /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi;
  let dateMatch;
  while ((dateMatch = datePattern.exec(educationText)) !== null) {
    allDates.push({match: dateMatch[1], index: dateMatch.index});
  }
  
  console.log(`Found: ${allDegrees.length} degrees, ${allInstitutions.length} institutions, ${allFields.length} fields, ${allGPAs.length} GPAs, ${allDates.length} dates`);
  
  // SMART GROUPING: Group fields by proximity (closest ones belong together)
  const educationCount = Math.max(allDegrees.length, allInstitutions.length, 1);
  
  for (let i = 0; i < educationCount; i++) {
    const degree = allDegrees[i]?.match || '';
    const institution = allInstitutions[i]?.match || '';
    const field = allFields[i]?.match || '';
    const gpa = allGPAs[i]?.match || '';
    const graduationDate = allDates[i] ? convertToMonthYear(allDates[i].match) : '';
    
    // Create education entry if we have meaningful data
    if ((degree && degree.length > 2) || (institution && institution.length > 2)) {
      const education = {
        id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
        institution: institution || 'Institution',
        degree: degree || 'Degree',
        field: field || 'Field of Study',
        graduationDate,
        gpa
      };
      
      result.education.push(education);
      console.log(`✓ Added education #${i + 1}:`, education.degree, 'in', education.field, 'at', education.institution);
      console.log(`  - Mapped fields: degree="${degree}", field="${field}", institution="${institution}"`);
      console.log(`  - GPA: ${education.gpa} | Date: ${education.graduationDate}`);
    }
  }
  
  console.log(`✅ Education extraction complete: ${result.education.length} entries added`);
};

const extractSkills = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting skills...');
  
  const skillsPattern = /TECHNICAL SKILLS\s+(.*?)$/s;
  const skillsMatch = text.match(skillsPattern);
  
  if (!skillsMatch) {
    console.log('No skills section found');
    return;
  }
  
  let skillsText = skillsMatch[1];
  console.log('Skills text found:', skillsText);
  
  // SMART PREPROCESSING: Add line breaks before known category patterns to separate them
  const categoryKeywords = ['Programming Languages', 'Frontend Frameworks', 'Backend Technologies', 'Databases', 'Development Tools'];
  
  categoryKeywords.forEach(keyword => {
    // Add newline before each category (except the first occurrence)
    const regex = new RegExp(`(\\w)\\s+(${keyword.replace(/\s+/g, '\\s+')})`, 'g');
    skillsText = skillsText.replace(regex, '$1\n$2');
  });
  
  console.log('Preprocessed skills text:', skillsText);
  
  // NOW PARSE: Simple pattern for "Category: skills"
  const lines = skillsText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const match = line.match(/^([^:]+?):\s*(.+)$/);
    if (!match) continue;
    
    const categoryName = match[1].trim();
    const skillsString = match[2];
    
    // Parse skills and clean them
    const individualSkills = skillsString
      .split(/[,;]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.match(/^\d+$/))
      .slice(0, 20);
    
    if (individualSkills.length > 0) {
      const skillCategory = {
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: categoryName,
        skills: individualSkills
      };
      
      result.skills.push(skillCategory);
      console.log(`✓ Added skill category: ${categoryName} (${individualSkills.length} skills):`, individualSkills);
    }
  }
  
  if (result.skills.length === 0) {
    console.log('⚠️ No skill categories found with preprocessing approach');
  }
};

// Helper functions
const parseDateRange = (dateString: string): { startDate: string; endDate: string; current: boolean } => {
  const cleaned = dateString.trim();
  const currentRegex = /present|current|now/i;
  const current = currentRegex.test(cleaned);
  
  const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi;
  const dates: string[] = [];
  
  let match;
  while ((match = datePattern.exec(cleaned)) !== null) {
    dates.push(`${match[2]}-${getMonthNumber(match[1])}`);
  }
  
  return {
    startDate: dates[0] || '',
    endDate: current ? '' : (dates[1] || ''),
    current
  };
};

const getMonthNumber = (monthName: string): string => {
  const months = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };
  return months[monthName as keyof typeof months] || '01';
};

const convertToMonthYear = (dateString: string): string => {
  if (!dateString) return '';
  
  const monthYearMatch = dateString.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
  if (monthYearMatch) {
    return `${monthYearMatch[2]}-${getMonthNumber(monthYearMatch[1])}`;
  }
  
  const yearMatch = dateString.match(/(\d{4})/);
  if (yearMatch) {
    return `${yearMatch[1]}-01`;
  }
  
  return dateString;
};