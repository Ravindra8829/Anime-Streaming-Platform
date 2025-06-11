export interface Anime {
  id: number;
  title: string;
  image: string;
  rating: number;
  year: number;
  episodes: number;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  genre: string[];
  description: string;
  views: string;
  type: 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA';
  duration?: string;
  studio?: string;
  source?: string;
  malId?: number;
  trailer?: string;
}

export interface ApiAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number;
  year: number;
  episodes: number;
  status: string;
  genres: Array<{ name: string }>;
  synopsis: string;
  type: string;
  duration?: string;
  studios: Array<{ name: string }>;
  source?: string;
  trailer?: {
    url: string;
  };
}

export interface SearchFilters {
  query: string;
  genre: string;
  status: string;
  type: string;
  year: string;
  sortBy: string;
}