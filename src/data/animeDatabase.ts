import { Anime } from '../types/anime';

export const comprehensiveAnimeDatabase: Anime[] = [
  // Top Shonen Anime
  {
    id: 1,
    title: "Attack on Titan",
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    rating: 9.0,
    year: 2013,
    episodes: 87,
    status: 'Completed',
    genre: ['Action', 'Drama', 'Fantasy', 'Military'],
    description: "Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.",
    views: "15.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Mappa",
    malId: 16498
  },
  {
    id: 2,
    title: "Demon Slayer: Kimetsu no Yaiba",
    image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    rating: 8.7,
    year: 2019,
    episodes: 44,
    status: 'Ongoing',
    genre: ['Action', 'Historical', 'Supernatural'],
    description: "A young boy becomes a demon slayer to save his sister and avenge his family.",
    views: "12.8M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Ufotable",
    malId: 38000
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    rating: 8.6,
    year: 2020,
    episodes: 24,
    status: 'Ongoing',
    genre: ['Action', 'School', 'Supernatural'],
    description: "Students battle cursed spirits in modern-day Japan using cursed energy.",
    views: "11.5M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Mappa",
    malId: 40748
  },
  {
    id: 4,
    title: "One Piece",
    image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    rating: 9.0,
    year: 1999,
    episodes: 1000,
    status: 'Ongoing',
    genre: ['Action', 'Adventure', 'Comedy', 'Drama'],
    description: "Monkey D. Luffy and his pirate crew search for the ultimate treasure known as One Piece.",
    views: "18.7M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Toei Animation",
    malId: 21
  },
  {
    id: 5,
    title: "Naruto",
    image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    rating: 8.4,
    year: 2002,
    episodes: 720,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Martial Arts'],
    description: "A young ninja's journey to become the strongest in his village and gain recognition.",
    views: "16.3M",
    type: 'TV',
    duration: "23 min per ep",
    studio: "Pierrot",
    malId: 20
  },
  {
    id: 6,
    title: "My Hero Academia",
    image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    rating: 8.5,
    year: 2016,
    episodes: 138,
    status: 'Ongoing',
    genre: ['Action', 'School', 'Super Power'],
    description: "Students train to become professional superheroes in a world where superpowers are common.",
    views: "13.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Bones",
    malId: 31964
  },
  {
    id: 7,
    title: "Dragon Ball Z",
    image: "https://cdn.myanimelist.net/images/anime/1277/142600.jpg",
    rating: 8.7,
    year: 1989,
    episodes: 291,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Martial Arts'],
    description: "Goku and friends defend Earth from increasingly powerful enemies.",
    views: "19.1M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Toei Animation",
    malId: 813
  },
  {
    id: 8,
    title: "Hunter x Hunter (2011)",
    image: "https://cdn.myanimelist.net/images/anime/11/33657.jpg",
    rating: 9.0,
    year: 2011,
    episodes: 148,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Fantasy'],
    description: "A young boy searches for his father who is a legendary Hunter.",
    views: "10.8M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Madhouse",
    malId: 11061
  },
  {
    id: 9,
    title: "Fullmetal Alchemist: Brotherhood",
    image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    rating: 9.1,
    year: 2009,
    episodes: 64,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    description: "Two brothers search for the Philosopher's Stone to restore their bodies.",
    views: "12.4M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Bones",
    malId: 5114
  },
  {
    id: 10,
    title: "Death Note",
    image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    rating: 9.0,
    year: 2006,
    episodes: 37,
    status: 'Completed',
    genre: ['Supernatural', 'Thriller', 'Psychological'],
    description: "A high school student discovers a supernatural notebook that kills anyone whose name is written in it.",
    views: "14.7M",
    type: 'TV',
    duration: "23 min per ep",
    studio: "Madhouse",
    malId: 1535
  },

  // Popular Movies
  {
    id: 11,
    title: "Spirited Away",
    image: "https://cdn.myanimelist.net/images/anime/6/79597.jpg",
    rating: 9.3,
    year: 2001,
    episodes: 1,
    status: 'Completed',
    genre: ['Adventure', 'Family', 'Fantasy'],
    description: "A girl enters a world ruled by gods and witches where humans are changed into beasts.",
    views: "8.9M",
    type: 'Movie',
    duration: "125 min",
    studio: "Studio Ghibli",
    malId: 199
  },
  {
    id: 12,
    title: "Your Name",
    image: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
    rating: 8.4,
    year: 2016,
    episodes: 1,
    status: 'Completed',
    genre: ['Romance', 'Drama', 'Supernatural'],
    description: "Two teenagers share a profound, magical connection upon discovering they are swapping bodies.",
    views: "7.2M",
    type: 'Movie',
    duration: "106 min",
    studio: "CoMix Wave Films",
    malId: 32281
  },
  {
    id: 13,
    title: "Princess Mononoke",
    image: "https://cdn.myanimelist.net/images/anime/7/75919.jpg",
    rating: 8.7,
    year: 1997,
    episodes: 1,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Drama'],
    description: "A prince becomes involved in the struggle between forest gods and humans.",
    views: "6.8M",
    type: 'Movie',
    duration: "134 min",
    studio: "Studio Ghibli",
    malId: 164
  },

  // Seinen & Mature
  {
    id: 14,
    title: "Tokyo Ghoul",
    image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
    rating: 8.0,
    year: 2014,
    episodes: 48,
    status: 'Completed',
    genre: ['Action', 'Horror', 'Supernatural'],
    description: "A college student becomes a half-ghoul after a deadly encounter.",
    views: "11.3M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Pierrot",
    malId: 22319
  },
  {
    id: 15,
    title: "Berserk",
    image: "https://cdn.myanimelist.net/images/anime/1384/119476.jpg",
    rating: 8.7,
    year: 1997,
    episodes: 25,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Drama', 'Horror'],
    description: "A lone mercenary fights demons in a dark medieval world.",
    views: "5.4M",
    type: 'TV',
    duration: "25 min per ep",
    studio: "OLM",
    malId: 33
  },
  {
    id: 16,
    title: "Monster",
    image: "https://cdn.myanimelist.net/images/anime/10/18793.jpg",
    rating: 9.0,
    year: 2004,
    episodes: 74,
    status: 'Completed',
    genre: ['Drama', 'Horror', 'Mystery', 'Psychological'],
    description: "A doctor pursues a former patient who has become a serial killer.",
    views: "4.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Madhouse",
    malId: 19
  },

  // Romance & Slice of Life
  {
    id: 17,
    title: "Violet Evergarden",
    image: "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    rating: 8.5,
    year: 2018,
    episodes: 13,
    status: 'Completed',
    genre: ['Drama', 'Fantasy', 'Slice of Life'],
    description: "A former soldier works as an Auto Memory Doll, writing letters for others.",
    views: "6.7M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Kyoto Animation",
    malId: 33352
  },
  {
    id: 18,
    title: "Clannad: After Story",
    image: "https://cdn.myanimelist.net/images/anime/1299/110774.jpg",
    rating: 9.0,
    year: 2008,
    episodes: 24,
    status: 'Completed',
    genre: ['Drama', 'Romance', 'Slice of Life'],
    description: "The continuation of Tomoya and Nagisa's story as they face adult life.",
    views: "5.1M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Kyoto Animation",
    malId: 4181
  },
  {
    id: 19,
    title: "A Silent Voice",
    image: "https://cdn.myanimelist.net/images/anime/1122/96435.jpg",
    rating: 8.9,
    year: 2016,
    episodes: 1,
    status: 'Completed',
    genre: ['Drama', 'Romance', 'School'],
    description: "A former bully seeks redemption by reconnecting with a deaf girl he once tormented.",
    views: "7.8M",
    type: 'Movie',
    duration: "130 min",
    studio: "Kyoto Animation",
    malId: 28851
  },

  // Comedy & Parody
  {
    id: 20,
    title: "One Punch Man",
    image: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
    rating: 8.8,
    year: 2015,
    episodes: 24,
    status: 'Ongoing',
    genre: ['Action', 'Comedy', 'Parody', 'Super Power'],
    description: "A superhero who can defeat any enemy with a single punch struggles with boredom.",
    views: "13.6M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Madhouse",
    malId: 30276
  },
  {
    id: 21,
    title: "Mob Psycho 100",
    image: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
    rating: 8.6,
    year: 2016,
    episodes: 37,
    status: 'Completed',
    genre: ['Action', 'Comedy', 'Supernatural'],
    description: "A psychic middle schooler tries to live a normal life while controlling his powers.",
    views: "8.9M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Bones",
    malId: 32182
  },
  {
    id: 22,
    title: "Gintama",
    image: "https://cdn.myanimelist.net/images/anime/10/73274.jpg",
    rating: 9.0,
    year: 2006,
    episodes: 367,
    status: 'Completed',
    genre: ['Action', 'Comedy', 'Historical', 'Parody'],
    description: "In an alternate Edo period, samurai fight aliens in comedic adventures.",
    views: "7.3M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Sunrise",
    malId: 918
  },

  // Sci-Fi & Mecha
  {
    id: 23,
    title: "Neon Genesis Evangelion",
    image: "https://cdn.myanimelist.net/images/anime/1314/108941.jpg",
    rating: 8.5,
    year: 1995,
    episodes: 26,
    status: 'Completed',
    genre: ['Action', 'Drama', 'Mecha', 'Psychological'],
    description: "Teenagers pilot giant mechs to fight mysterious beings called Angels.",
    views: "9.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Gainax",
    malId: 30
  },
  {
    id: 24,
    title: "Cowboy Bebop",
    image: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    rating: 8.8,
    year: 1998,
    episodes: 26,
    status: 'Completed',
    genre: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
    description: "Bounty hunters travel through space in 2071, each with their own past to confront.",
    views: "8.1M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Sunrise",
    malId: 1
  },
  {
    id: 25,
    title: "Akira",
    image: "https://cdn.myanimelist.net/images/anime/1184/90935.jpg",
    rating: 8.0,
    year: 1988,
    episodes: 1,
    status: 'Completed',
    genre: ['Action', 'Military', 'Sci-Fi', 'Supernatural'],
    description: "In post-apocalyptic Neo-Tokyo, a biker gang member gains telekinetic powers.",
    views: "6.4M",
    type: 'Movie',
    duration: "124 min",
    studio: "Akira Committee",
    malId: 47
  },

  // Sports
  {
    id: 26,
    title: "Haikyuu!!",
    image: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    rating: 8.7,
    year: 2014,
    episodes: 85,
    status: 'Completed',
    genre: ['Comedy', 'Drama', 'School', 'Sports'],
    description: "A short boy joins his high school volleyball team and aims for nationals.",
    views: "9.8M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Production I.G",
    malId: 20583
  },
  {
    id: 27,
    title: "Kuroko no Basket",
    image: "https://cdn.myanimelist.net/images/anime/11/50453.jpg",
    rating: 8.2,
    year: 2012,
    episodes: 75,
    status: 'Completed',
    genre: ['Comedy', 'School', 'Sports'],
    description: "A phantom sixth man helps his high school basketball team reach the top.",
    views: "7.6M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Production I.G",
    malId: 11771
  },

  // Isekai
  {
    id: 28,
    title: "Re:Zero - Starting Life in Another World",
    image: "https://cdn.myanimelist.net/images/anime/1522/128039.jpg",
    rating: 8.2,
    year: 2016,
    episodes: 50,
    status: 'Ongoing',
    genre: ['Drama', 'Fantasy', 'Psychological', 'Thriller'],
    description: "A young man is transported to a fantasy world where he can return from death.",
    views: "10.4M",
    type: 'TV',
    duration: "25 min per ep",
    studio: "White Fox",
    malId: 31240
  },
  {
    id: 29,
    title: "That Time I Got Reincarnated as a Slime",
    image: "https://cdn.myanimelist.net/images/anime/1694/93337.jpg",
    rating: 8.1,
    year: 2018,
    episodes: 48,
    status: 'Ongoing',
    genre: ['Adventure', 'Comedy', 'Fantasy'],
    description: "A man reincarnated as a slime builds a nation of monsters.",
    views: "8.7M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "8bit",
    malId: 37430
  },
  {
    id: 30,
    title: "Overlord",
    image: "https://cdn.myanimelist.net/images/anime/7/88019.jpg",
    rating: 7.9,
    year: 2015,
    episodes: 52,
    status: 'Ongoing',
    genre: ['Action', 'Adventure', 'Fantasy'],
    description: "A player becomes trapped in a virtual reality game as his character, an undead overlord.",
    views: "9.1M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Madhouse",
    malId: 29803
  },

  // Horror & Thriller
  {
    id: 31,
    title: "Another",
    image: "https://cdn.myanimelist.net/images/anime/5/33271.jpg",
    rating: 7.8,
    year: 2012,
    episodes: 12,
    status: 'Completed',
    genre: ['Horror', 'Mystery', 'School', 'Thriller'],
    description: "A transfer student uncovers a deadly curse affecting his new class.",
    views: "6.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "P.A. Works",
    malId: 11111
  },
  {
    id: 32,
    title: "Parasyte",
    image: "https://cdn.myanimelist.net/images/anime/3/73178.jpg",
    rating: 8.3,
    year: 2014,
    episodes: 24,
    status: 'Completed',
    genre: ['Action', 'Drama', 'Horror', 'Psychological'],
    description: "A high school student's hand is infected by an alien parasite.",
    views: "8.5M",
    type: 'TV',
    duration: "23 min per ep",
    studio: "Madhouse",
    malId: 22535
  },

  // Music & Idol
  {
    id: 33,
    title: "Your Lie in April",
    image: "https://cdn.myanimelist.net/images/anime/3/67177.jpg",
    rating: 8.6,
    year: 2014,
    episodes: 22,
    status: 'Completed',
    genre: ['Drama', 'Music', 'Romance', 'School'],
    description: "A piano prodigy who lost his ability to hear music meets a free-spirited violinist.",
    views: "7.9M",
    type: 'TV',
    duration: "23 min per ep",
    studio: "A-1 Pictures",
    malId: 23273
  },
  {
    id: 34,
    title: "K-On!",
    image: "https://cdn.myanimelist.net/images/anime/10/76121.jpg",
    rating: 8.0,
    year: 2009,
    episodes: 39,
    status: 'Completed',
    genre: ['Comedy', 'Music', 'School', 'Slice of Life'],
    description: "Four high school girls form a light music club and learn to play instruments.",
    views: "6.1M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Kyoto Animation",
    malId: 5680
  },

  // Recent Popular
  {
    id: 35,
    title: "Chainsaw Man",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    rating: 8.8,
    year: 2022,
    episodes: 12,
    status: 'Ongoing',
    genre: ['Action', 'Gore', 'Supernatural'],
    description: "A young man merges with a chainsaw devil to become a devil hunter.",
    views: "11.7M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Mappa",
    malId: 44511
  },
  {
    id: 36,
    title: "Spy x Family",
    image: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    rating: 8.5,
    year: 2022,
    episodes: 25,
    status: 'Ongoing',
    genre: ['Action', 'Comedy', 'Family'],
    description: "A spy, an assassin, and a telepath form a fake family for their respective missions.",
    views: "14.3M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Wit Studio",
    malId: 50265
  },
  {
    id: 37,
    title: "Cyberpunk: Edgerunners",
    image: "https://cdn.myanimelist.net/images/anime/1818/126435.jpg",
    rating: 8.6,
    year: 2022,
    episodes: 10,
    status: 'Completed',
    genre: ['Action', 'Drama', 'Sci-Fi'],
    description: "A street kid tries to survive in a technology and body modification-obsessed city.",
    views: "9.4M",
    type: 'ONA',
    duration: "25 min per ep",
    studio: "Trigger",
    malId: 42310
  },

  // Classic Shoujo
  {
    id: 38,
    title: "Sailor Moon",
    image: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    rating: 7.8,
    year: 1992,
    episodes: 200,
    status: 'Completed',
    genre: ['Magic', 'Romance', 'Shoujo'],
    description: "A schoolgirl transforms into a magical warrior to fight evil forces.",
    views: "8.2M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "Toei Animation",
    malId: 530
  },
  {
    id: 39,
    title: "Fruits Basket (2019)",
    image: "https://cdn.myanimelist.net/images/anime/1447/99827.jpg",
    rating: 8.7,
    year: 2019,
    episodes: 63,
    status: 'Completed',
    genre: ['Drama', 'Romance', 'Shoujo', 'Supernatural'],
    description: "A girl lives with a family cursed to turn into zodiac animals when hugged.",
    views: "6.8M",
    type: 'TV',
    duration: "24 min per ep",
    studio: "TMS Entertainment",
    malId: 38680
  },

  // Adventure & Fantasy
  {
    id: 40,
    title: "Made in Abyss",
    image: "https://cdn.myanimelist.net/images/anime/6/86733.jpg",
    rating: 8.7,
    year: 2017,
    episodes: 25,
    status: 'Ongoing',
    genre: ['Adventure', 'Drama', 'Fantasy', 'Mystery'],
    description: "A girl and a robot boy explore the dangerous depths of a mysterious abyss.",
    views: "7.1M",
    type: 'TV',
    duration: "25 min per ep",
    studio: "Kinema Citrus",
    malId: 34599
  }
];

// Helper functions for search and filtering
export const searchAnime = (query: string): Anime[] => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return comprehensiveAnimeDatabase.filter(anime =>
    anime.title.toLowerCase().includes(lowercaseQuery) ||
    anime.genre.some(g => g.toLowerCase().includes(lowercaseQuery)) ||
    anime.studio?.toLowerCase().includes(lowercaseQuery)
  );
};

export const getAnimeByGenre = (genre: string): Anime[] => {
  if (genre === 'All') return comprehensiveAnimeDatabase;
  return comprehensiveAnimeDatabase.filter(anime =>
    anime.genre.includes(genre)
  );
};

export const getTopRatedAnime = (limit: number = 10): Anime[] => {
  return [...comprehensiveAnimeDatabase]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getRecentAnime = (limit: number = 10): Anime[] => {
  return [...comprehensiveAnimeDatabase]
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
};

export const getPopularAnime = (limit: number = 10): Anime[] => {
  return [...comprehensiveAnimeDatabase]
    .sort((a, b) => parseFloat(b.views.replace('M', '')) - parseFloat(a.views.replace('M', '')))
    .slice(0, limit);
};

export const getAllGenres = (): string[] => {
  const genres = new Set<string>();
  comprehensiveAnimeDatabase.forEach(anime => {
    anime.genre.forEach(g => genres.add(g));
  });
  return Array.from(genres).sort();
};

export const getAllStudios = (): string[] => {
  const studios = new Set<string>();
  comprehensiveAnimeDatabase.forEach(anime => {
    if (anime.studio) studios.add(anime.studio);
  });
  return Array.from(studios).sort();
};

export const getAnimeByYear = (year: number): Anime[] => {
  return comprehensiveAnimeDatabase.filter(anime => anime.year === year);
};

export const getAnimeByStatus = (status: string): Anime[] => {
  if (status === 'All') return comprehensiveAnimeDatabase;
  return comprehensiveAnimeDatabase.filter(anime => anime.status === status);
};

export const getAnimeByType = (type: string): Anime[] => {
  if (type === 'All') return comprehensiveAnimeDatabase;
  return comprehensiveAnimeDatabase.filter(anime => anime.type === type);
};