// src/components/ResumePDFDocument.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '../types/resume';

interface ResumePDFDocumentProps {
  resumeData: ResumeData;
}

// Create styles that match your current resume design
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 30,
    lineHeight: 1.4,
    color: '#333333',
  },
  
  // Header Section
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#666666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Section Headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Professional Summary
  summary: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  
  // Experience Section
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  positionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  companyInfo: {
    fontSize: 9,
    color: '#4a4a4a',
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 9,
    color: '#666666',
  },
  responsibilities: {
    marginTop: 4,
    marginLeft: 8,
  },
  responsibility: {
    fontSize: 9,
    color: '#4a4a4a',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
    marginRight: 6,
    marginTop: 4,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Education Section
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  degreeInfo: {
    flex: 1,
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  institution: {
    fontSize: 9,
    color: '#4a4a4a',
  },
  graduationDate: {
    fontSize: 9,
    color: '#666666',
  },
  
  // Skills Section
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  skillCategoryName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    minWidth: 120,
    marginRight: 8,
  },
  skillsList: {
    fontSize: 9,
    color: '#4a4a4a',
    flex: 1,
  },
});

const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ resumeData }) => {
  const { personalInfo, experience, education, skills } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.fullName || 'Your Name'}
          </Text>
          
          <View style={styles.contactInfo}>
            {personalInfo.email && (
              <View style={styles.contactItem}>
                <Text>{personalInfo.email}</Text>
              </View>
            )}
            {personalInfo.phone && (
              <View style={styles.contactItem}>
                <Text>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo.location && (
              <View style={styles.contactItem}>
                <Text>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.linkedIn && (
              <View style={styles.contactItem}>
                <Link src={personalInfo.linkedIn}>
                  <Text>{personalInfo.linkedIn}</Text>
                </Link>
              </View>
            )}
            {personalInfo.website && (
              <View style={styles.contactItem}>
                <Link src={personalInfo.website}>
                  <Text>{personalInfo.website}</Text>
                </Link>
              </View>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.positionTitle}>
                      {exp.position || 'Position Title'}
                    </Text>
                    <Text style={styles.companyInfo}>
                      {exp.company || 'Company Name'}
                      {exp.location && ` • ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                
                {exp.responsibilities.some(r => r.trim()) && (
                  <View style={styles.responsibilities}>
                    {exp.responsibilities
                      .filter(r => r.trim())
                      .map((responsibility, index) => (
                        <View key={index} style={styles.bulletContainer}>
                          <View style={styles.bullet} />
                          <Text style={styles.responsibility}>
                            {responsibility}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.degreeInfo}>
                  <Text style={styles.degree}>
                    {edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}
                  </Text>
                  <Text style={styles.institution}>
                    {edu.institution || 'Institution'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </Text>
                </View>
                <Text style={styles.graduationDate}>
                  {formatDate(edu.graduationDate)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Technical Skills</Text>
            {skills.map((skill) => (
              <View key={skill.id}>
                {skill.category && (
                  <View style={styles.skillCategory}>
                    <Text style={styles.skillCategoryName}>
                      {skill.category}:
                    </Text>
                    <Text style={styles.skillsList}>
                      {skill.skills.filter(s => s.trim()).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDFDocument;