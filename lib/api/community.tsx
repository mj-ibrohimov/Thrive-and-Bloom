// lib/api/community.ts
export interface Thread {
  id: string;
  title: string;
  author: string;
  content: string;
}

export const getThreads = async (): Promise<Thread[]> => {
  // TODO: replace with real API call
  return [
    { id: '1', title: 'Welcome to the Community!', author: 'Admin', content: 'Feel free to introduce yourself.' },
    { id: '2', title: 'Tips for managing stress', author: 'User123', content: 'Here are some tips that helped me...' },
    { id: '3', title: 'Your favorite relaxation techniques', author: 'CalmMind', content: 'I love guided imagery...' },
  ];
};

