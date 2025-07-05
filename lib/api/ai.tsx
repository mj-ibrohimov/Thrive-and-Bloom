

// lib/api/ai.tsx

export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
}

/**
 * Mock function to get a personalized learning path for a given user.
 * Returns an array of LearningPathStep.
 */
export async function getPersonalizedPath(userId: string): Promise<LearningPathStep[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return a mock 5-step learning path
  return [
    {
      id: 'step1',
      title: 'Introduction to Neurodiversity',
      description: 'Learn about neurodiversity concepts and terminology.',
      duration: 30,
    },
    {
      id: 'step2',
      title: 'Understanding Your Learning Style',
      description: 'Identify and leverage your unique learning preferences.',
      duration: 45,
    },
    {
      id: 'step3',
      title: 'Building Focus Strategies',
      description: 'Techniques to maintain attention and manage distractions.',
      duration: 40,
    },
    {
      id: 'step4',
      title: 'Practical AI Tools for Learning',
      description: 'Explore AI-driven tools that can aid your study.',
      duration: 50,
    },
    {
      id: 'step5',
      title: 'Review and Next Steps',
      description: 'Summarize your progress and plan future learning goals.',
      duration: 35,
    },
  ];
}