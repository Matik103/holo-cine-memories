import OpenAI from 'openai';
import { Movie } from '@/components/MovieCard';

// This would ideally be in environment variables
// For demo purposes, we'll use a placeholder
let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes
  });
};

export const identifyMovie = async (description: string): Promise<Movie | null> => {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized. Please provide your API key.');
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CineMind, an expert movie identification AI. When given a description of a movie (even vague or partial memories), identify the exact movie and return detailed information in JSON format.

Return ONLY a JSON object with this exact structure:
{
  "title": "Movie Title",
  "year": 2023,
  "director": "Director Name", 
  "genre": ["Genre1", "Genre2"],
  "plot": "Detailed plot summary",
  "imdbRating": 8.5,
  "runtime": 120,
  "cast": ["Actor 1", "Actor 2", "Actor 3"],
  "poster": "https://image-url-if-available"
}

If you cannot identify a movie with confidence, return null.`
        },
        {
          role: "user",
          content: description
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return null;

    try {
      const movieData = JSON.parse(response);
      return movieData;
    } catch (parseError) {
      console.error('Failed to parse movie data:', parseError);
      return null;
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to identify movie. Please check your API key and try again.');
  }
};

export const explainMovie = async (movieTitle: string): Promise<{
  simple: string;
  detailed: string;
  symbolism: string;
} | null> => {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized. Please provide your API key.');
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are CineMind, an expert film analyst. Explain movies at different depth levels.

Return ONLY a JSON object with this structure:
{
  "simple": "Explanation suitable for a 12-year-old, focusing on basic plot and themes",
  "detailed": "Deep academic analysis covering themes, cinematography, cultural context, and psychological elements", 
  "symbolism": "Analysis of hidden meanings, metaphors, allegories, and symbolic elements in the film"
}

Keep explanations engaging and insightful.`
        },
        {
          role: "user",
          content: `Explain the movie "${movieTitle}" at three different levels of depth.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return null;

    try {
      const explanationData = JSON.parse(response);
      return explanationData;
    } catch (parseError) {
      console.error('Failed to parse explanation data:', parseError);
      return null;
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to explain movie. Please try again.');
  }
};

// Mock streaming availability data for demo
export const getStreamingOptions = async (movieTitle: string) => {
  // In a real app, this would query actual streaming APIs
  return [
    {
      platform: "Netflix",
      type: 'subscription' as const,
      url: `https://netflix.com/search?q=${encodeURIComponent(movieTitle)}`,
      quality: "4K"
    },
    {
      platform: "Tubi",
      type: 'free' as const,
      url: `https://tubi.tv/search/${encodeURIComponent(movieTitle)}`,
      quality: "HD"
    },
    {
      platform: "Amazon Prime Video",
      type: 'rent' as const,
      price: "$3.99",
      url: `https://amazon.com/gp/video/search/?phrase=${encodeURIComponent(movieTitle)}`,
      quality: "4K"
    }
  ];
};