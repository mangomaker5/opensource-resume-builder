// src/store/resumeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, Experience, Education, Skill } from '../types/resume';

interface ResumeStore {
  resumeData: ResumeData;
  zoom: number;
  lastSaved: string;
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
  setResumeData: (data: ResumeData) => void;
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

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumeData: initialResumeData,
      zoom: 0.8,
      lastSaved: new Date().toISOString(),
      
      updatePersonalInfo: (info) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            personalInfo: { ...state.resumeData.personalInfo, ...info }
          },
          lastSaved: new Date().toISOString()
        })),

      addExperience: () =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: [
              ...state.resumeData.experience,
              {
                id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                responsibilities: ['']
              }
            ]
          },
          lastSaved: new Date().toISOString()
        })),

      updateExperience: (id, experience) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.map((exp) =>
              exp.id === id ? { ...exp, ...experience } : exp
            )
          },
          lastSaved: new Date().toISOString()
        })),

      deleteExperience: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.filter((exp) => exp.id !== id)
          },
          lastSaved: new Date().toISOString()
        })),

      addEducation: () =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: [
              ...state.resumeData.education,
              {
                id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                institution: '',
                degree: '',
                field: '',
                graduationDate: '',
                gpa: ''
              }
            ]
          },
          lastSaved: new Date().toISOString()
        })),

      updateEducation: (id, education) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.map((edu) =>
              edu.id === id ? { ...edu, ...education } : edu
            )
          },
          lastSaved: new Date().toISOString()
        })),

      deleteEducation: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.filter((edu) => edu.id !== id)
          },
          lastSaved: new Date().toISOString()
        })),

      addSkill: () =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: [
              ...state.resumeData.skills,
              {
                id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                category: '',
                skills: ['']
              }
            ]
          },
          lastSaved: new Date().toISOString()
        })),

      updateSkill: (id, skill) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.map((s) =>
              s.id === id ? { ...s, ...skill } : s
            )
          },
          lastSaved: new Date().toISOString()
        })),

      deleteSkill: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.filter((s) => s.id !== id)
          },
          lastSaved: new Date().toISOString()
        })),

      setZoom: (zoom) => set({ zoom }),
      
      resetZoom: () => set({ zoom: 0.8 }),
      
      resetResume: () => set({ 
        resumeData: initialResumeData, 
        zoom: 0.8,
        lastSaved: new Date().toISOString()
      }),

      setResumeData: (data) => set({ 
        resumeData: data,
        lastSaved: new Date().toISOString()
      })
    }),
    {
      name: 'resume-storage',
      version: 1,
      partialize: (state) => ({
        resumeData: state.resumeData,
        zoom: state.zoom
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.lastSaved = new Date().toISOString();
        }
      },
    }
  )
);