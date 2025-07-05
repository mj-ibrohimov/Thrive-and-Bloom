// lib/api/meditation.ts

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // duration in seconds
}

export const getMeditationSessions = async (): Promise<MeditationSession[]> => {
  // TODO: replace with real API endpoint
  return [
    {
      id: '1',
      title: '5-Minute Breath',
      description: 'A short guided breathing exercise to center yourself.',
      audioUrl: require('../../assets/audio/1.mp3'),
      duration: 300,
    },
    {
      id: '2',
      title: 'Body Scan',
      description: 'A full body awareness meditation to release tension.',
      audioUrl: require('../../assets/audio/2.mp3'),
      duration: 600,
    },
    {
      id: '3',
      title: 'Mindful Walking',
      description: 'Ground yourself with a mindful walking practice.',
      audioUrl: require('../../assets/audio/3.mp3'),
      duration: 420,
    },
    {
      id: '4',
      title: 'Meditate',
      description: 'Meditate using this sound.',
      audioUrl: require('../../assets/audio/4.mp3'),
      duration: 420,
    },
  ];
};
