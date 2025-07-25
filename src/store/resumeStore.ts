// src/store/resumeStore.ts
import { create } from 'zustand';
import { ResumeData, Experience, Education, Skill } from '../types/resume';

interface ResumeStore {
  resumeData: ResumeData;
  zoom: number;
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  addExperience: () => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
  resetResume: () => void;
  setResumeData: (data: ResumeData) => void; // New method for PDF import
}

const initialResumeData: ResumeData = {
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

export const useResumeStore = create<ResumeStore>((set) => ({
  resumeData: initialResumeData,
  zoom: 0.8,
  
  updatePersonalInfo: (info) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        personalInfo: { ...state.resumeData.personalInfo, ...info }
      }
    })),

  addExperience: () =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: [
          ...state.resumeData.experience,
          {
            id: Date.now().toString(),
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: ['']
          }
        ]
      }
    })),

  updateExperience: (id, experience) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: state.resumeData.experience.map((exp) =>
          exp.id === id ? { ...exp, ...experience } : exp
        )
      }
    })),

  deleteExperience: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: state.resumeData.experience.filter((exp) => exp.id !== id)
      }
    })),

  addEducation: () =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: [
          ...state.resumeData.education,
          {
            id: Date.now().toString(),
            institution: '',
            degree: '',
            field: '',
            graduationDate: '',
            gpa: ''
          }
        ]
      }
    })),

  updateEducation: (id, education) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.map((edu) =>
          edu.id === id ? { ...edu, ...education } : edu
        )
      }
    })),

  deleteEducation: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.filter((edu) => edu.id !== id)
      }
    })),

  addSkill: () =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: [
          ...state.resumeData.skills,
          {
            id: Date.now().toString(),
            category: '',
            skills: ['']
          }
        ]
      }
    })),

  updateSkill: (id, skill) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.map((s) =>
          s.id === id ? { ...s, ...skill } : s
        )
      }
    })),

  deleteSkill: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.filter((s) => s.id !== id)
      }
    })),

  setZoom: (zoom) => set({ zoom }),
  
  resetZoom: () => set({ zoom: 0.8 }),
  
  resetResume: () => set({ resumeData: initialResumeData, zoom: 0.8 }),

  // New method to set complete resume data (for PDF import)
  setResumeData: (data) => set({ resumeData: data })
}));