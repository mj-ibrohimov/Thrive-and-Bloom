

// lib/api/marketplace.tsx

export interface Profile {
  id: string;
  name: string;
  skill: string;
}

/**
 * Returns a list of mock profiles for the freelance marketplace.
 */
export const getProfiles = async (): Promise<Profile[]> => {
  // TODO: replace with real API call
  return [
    {
      id: '1',
      name: 'Alice Rossi',
      skill: 'Graphic Design',
    },
    {
      id: '2',
      name: 'Marco Bianchi',
      skill: 'Web Development',
    },
    {
      id: '3',
      name: 'Luca Verdi',
      skill: 'Copywriting',
    },
    {
      id: '4',
      name: 'Sofia Neri',
      skill: 'Illustration',
    },
    {
      id: '5',
      name: 'Giulia Bruno',
      skill: 'Digital Marketing',
    },
  ];
};