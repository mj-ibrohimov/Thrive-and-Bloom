

// lib/api/motivational.tsx

/**
 * Returns a list of motivational phrases for the Home screen.
 */
export const getMotivationalPhrases = async (): Promise<string[]> => {
  // Mocked data; replace with a real API call as needed
  return [
    "Believe in yourself and all that you are.",
    "Your potential is endless.",
    "Take a deep breath and start again.",
    "Small steps every day lead to big changes.",
    "You are stronger than you think.",
    "Embrace the journey, not just the destination.",
    "Every day is a new opportunity to grow.",
    "You are capable of more than you know.",
  ];
};