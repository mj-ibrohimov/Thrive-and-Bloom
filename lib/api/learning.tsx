// lib/api/learning.tsx

export interface LearningModule {
  id: string;
  title: string;
  description: string;
}

export const getLearningModules = async (): Promise<LearningModule[]> => {
  // Simulated API call - replace with real endpoint logic
  return [
    {
      id: '1',
      title: 'Introduction to Neurodiversity',
      description: 'An overview of neurodiversity concepts and terminology.',
    },
    {
      id: '2',
      title: 'Understanding Your Learning Style',
      description: 'Identify your personal learning preferences and strategies.',
    },
    {
      id: '3',
      title: 'Building Effective Study Habits',
      description: 'Techniques for organizing study sessions and retaining information.',
    },
  ];
};
