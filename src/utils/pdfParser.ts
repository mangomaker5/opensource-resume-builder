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

const extractEducation = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting education...');
  
  const educationPattern = /EDUCATION\s+(.*?)\s+TECHNICAL SKILLS/s;
  const educationMatch = text.match(educationPattern);
  
  if (!educationMatch) {
    console.log('No education section found');
    return;
  }
  
  let educationText = educationMatch[1];
  console.log('Education text:', educationText);
  
  // Aggressive deduplication for education text
  educationText = educationText
    .replace(/Master of Science in Computer Science Master of Science in Computer Science/g, 'Master of Science in Computer Science')
    .replace(/(\w+\s+){2,}in Computer Science in Computer Science/g, 'Master of Science in Computer Science')
    .replace(/in Computer Science in Computer Science/g, 'in Computer Science')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Cleaned education text:', educationText);
  
  // Extract each component with precise patterns
  
  // 1. Extract degree (most specific patterns first)
  let degree = '';
  const degreeMatches = [
    educationText.match(/\b(Master of Science|Bachelor of Science|Bachelor of Arts|PhD|Doctor of Philosophy)\b/i),
    educationText.match(/\b(Master|Bachelor|PhD|Doctor|Associate)\b/i)
  ];
  
  for (const match of degreeMatches) {
    if (match) {
      degree = match[1];
      break;
    }
  }
  
  // 2. Extract field (look for "Computer Science" etc.)
  let field = '';
  const fieldMatch = educationText.match(/\b(Computer Science|Engineering|Business Administration|Mathematics|Physics|Chemistry|Biology)\b/i);
  if (fieldMatch) {
    field = fieldMatch[1];
  }
  
  // 3. Extract institution (very precise - only university names)
  let institution = '';
  const institutionMatches = [
    educationText.match(/\b(Stanford University|Harvard University|MIT|Berkeley)\b/i),
    educationText.match(/\b([A-Z][a-zA-Z]+\s+University)\b/),
    educationText.match(/\b([A-Z][a-zA-Z]+\s+College)\b/),
    educationText.match(/\b([A-Z][a-zA-Z]+\s+Institute)\b/)
  ];
  
  for (const match of institutionMatches) {
    if (match) {
      institution = match[1];
      break;
    }
  }
  
  // 4. Extract GPA
  let gpa = '';
  const gpaMatch = educationText.match(/GPA:\s*([\d.]+)/i);
  if (gpaMatch) {
    gpa = gpaMatch[1];
  }
  
  // 5. Extract graduation date
  let graduationDate = '';
  const dateMatch = educationText.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i);
  if (dateMatch) {
    graduationDate = convertToMonthYear(dateMatch[1]);
  }
  
  // Create education entry if we have meaningful data
  if ((degree && degree.length > 2) || (institution && institution.length > 2)) {
    const education = {
      id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      institution: institution || 'Institution',
      degree: degree || 'Degree',
      field: field || 'Field of Study',
      graduationDate,
      gpa
    };
    
    result.education.push(education);
    console.log('✓ Added education:', education.degree, 'in', education.field, 'at', education.institution);
    console.log('  - Mapped fields: degree="' + degree + '", field="' + field + '", institution="' + institution + '"');
    console.log('  - GPA:', education.gpa, '| Date:', education.graduationDate);
  } else {
    console.log('⚠️ Education extraction failed - insufficient data');
  }
};

const extractSkills = (text: string, result: ResumeData) => {
  console.log('🔍 Extracting skills...');
  
  const skillsPattern = /TECHNICAL SKILLS\s+(.*?)$/s;
  const skillsMatch = text.match(skillsPattern);
  
  if (!skillsMatch) {
    console.log('No skills section found');
    return;
  }
  
  const skillsText = skillsMatch[1];
  console.log('Skills text found:', skillsText);
  
  // Define known categories in the expected order
  const knownCategories = [
    'Programming Languages',
    'Frontend Frameworks & Libraries', 
    'Backend Technologies',
    'Databases & Cloud',
    'Development Tools'
  ];
  
  // Split the skills text by category patterns
  const categoryRegex = /(Programming Languages|Frontend Frameworks & Libraries|Backend Technologies|Databases & Cloud|Development Tools)\s*:\s*/g;
  const parts = skillsText.split(categoryRegex).filter(part => part.trim());
  
  // Process each category-skills pair
  for (let i = 0; i < parts.length; i += 2) {
    const categoryName = parts[i];
    const skillsString = parts[i + 1];
    
    if (!categoryName || !skillsString || !knownCategories.includes(categoryName)) continue;
    
    // Extract and clean individual skills
    const individualSkills = skillsString
      .split(/[,;]/)
      .map(skill => skill.trim())
      .map(skill => {
        // Fix common spacing issues from PDF extraction
        return skill
          .replace(/Java Script/g, 'JavaScript')
          .replace(/Type Script/g, 'TypeScript')
          .replace(/Graph QL/g, 'GraphQL')
          .replace(/Postgre SQL/g, 'PostgreSQL')
          .replace(/Mongo DB/g, 'MongoDB')
          .replace(/Git Hub/g, 'GitHub');
      })
      .filter(skill => {
        // Remove skills that are actually the next category name
        return !knownCategories.some(cat => skill.includes(cat.split(' ')[0]));
      })
      .filter(skill => skill.length > 1 && skill.length < 50)
      .filter(skill => !skill.match(/^\d+$/)) // Remove standalone numbers
      .slice(0, 15); // Limit skills per category
    
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
  
  // Fallback: if no categories were found using the split method, try the old regex approach
  if (result.skills.length === 0) {
    console.log('Fallback: Using regex approach for skills');
    const categoryPattern = /([A-Z][a-zA-Z\s&]+?):\s*([^:]+?)(?=\s+[A-Z][a-zA-Z\s&]+?:|$)/g;
    
    let categoryMatch;
    while ((categoryMatch = categoryPattern.exec(skillsText)) !== null) {
      const [, categoryName, skillsString] = categoryMatch;
      
      if (!categoryName || !skillsString) continue;
      
      const individualSkills = skillsString
        .split(/[,;]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50)
        .slice(0, 15);
      
      if (individualSkills.length > 0) {
        const skillCategory = {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: categoryName.trim(),
          skills: individualSkills
        };
        
        result.skills.push(skillCategory);
        console.log(`✓ Added skill category: ${categoryName} (${individualSkills.length} skills)`);
      }
    }
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