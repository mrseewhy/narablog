export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: 1,
    slug: "politics",
    name: "Politics",
    description: "Elections, policy, and the decisions shaping how we live.",
  },
  {
    id: 2,
    slug: "sports",
    name: "Sports",
    description: "Football, athletics, and the stories behind the scores.",
  },
  {
    id: 3,
    slug: "technology",
    name: "Technology",
    description: "Software, startups, and the tools changing how we work.",
  },
  {
    id: 4,
    slug: "religion",
    name: "Religion",
    description: "Faith, belief, and the communities built around them.",
  },
  {
    id: 5,
    slug: "science",
    name: "Science",
    description: "Discoveries and ideas that explain the world around us.",
  },
];
