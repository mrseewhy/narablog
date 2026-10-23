export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "Politics" | "Sports" | "Technology" | "Religion" | "Science";
  author: string;
  date: string;
  readTime: number;
  image: string;
  likes: number;
};

export const posts: Post[] = [
  {
    id: 1,
    slug: "why-local-elections-shape-daily-life-more-than-national-ones",
    title: "Why local elections shape your daily life more than national ones",
    excerpt:
      "Roads, schools, markets, and water supply are decided closer to home than most people realise. Here is why the smallest ballots often carry the biggest consequences.",
    category: "Politics",
    author: "Amara Okafor",
    date: "2026-10-20",
    readTime: 6,
    image: "/demo-post.png",
    likes: 128,
  },
  {
    id: 2,
    slug: "the-quiet-rise-of-grassroots-football-academies",
    title: "The quiet rise of grassroots football academies",
    excerpt:
      "Away from the big stadiums, small academies are building a new generation of players with almost no funding and a lot of stubborn belief.",
    category: "Sports",
    author: "Tunde Bakare",
    date: "2026-10-18",
    readTime: 5,
    image: "/demo-post.png",
    likes: 94,
  },
  {
    id: 3,
    slug: "what-nobody-tells-you-about-shipping-your-first-saas",
    title: "What nobody tells you about shipping your first SaaS",
    excerpt:
      "Building the product is the easy part. The real work starts with pricing, support, onboarding, and learning to say no to feature requests.",
    category: "Technology",
    author: "Ngozi Eze",
    date: "2026-10-17",
    readTime: 8,
    image: "/demo-post.png",
    likes: 211,
  },
  {
    id: 4,
    slug: "finding-stillness-in-a-noisy-world",
    title: "Finding stillness in a noisy world",
    excerpt:
      "Across traditions, quiet reflection has been treated as a discipline rather than a luxury. A look at what that practice can offer today.",
    category: "Religion",
    author: "Ibrahim Musa",
    date: "2026-10-15",
    readTime: 7,
    image: "/demo-post.png",
    likes: 67,
  },
  {
    id: 5,
    slug: "how-the-deep-ocean-is-rewriting-what-we-know-about-life",
    title: "How the deep ocean is rewriting what we know about life",
    excerpt:
      "Creatures living without sunlight, under crushing pressure, keep forcing scientists to redraw the boundaries of where life can exist.",
    category: "Science",
    author: "Chiamaka Obi",
    date: "2026-10-13",
    readTime: 9,
    image: "/demo-post.png",
    likes: 156,
  },
  {
    id: 6,
    slug: "youth-voter-turnout-and-the-promise-of-change",
    title: "Youth voter turnout and the promise of change",
    excerpt:
      "Young people make up a large share of the population but a smaller share of the vote. What would it take to close that gap?",
    category: "Politics",
    author: "Seyi Adeyemi",
    date: "2026-10-10",
    readTime: 5,
    image: "/demo-post.png",
    likes: 82,
  },
  {
    id: 7,
    slug: "the-mental-game-behind-every-last-minute-goal",
    title: "The mental game behind every last-minute goal",
    excerpt:
      "Late winners are rarely luck. They come from habits of focus, fitness, and nerve that are built long before the final whistle.",
    category: "Sports",
    author: "Funke Alabi",
    date: "2026-10-08",
    readTime: 4,
    image: "/demo-post.png",
    likes: 45,
  },
  {
    id: 8,
    slug: "ai-coding-tools-are-changing-how-juniors-learn",
    title: "AI coding tools are changing how juniors learn to code",
    excerpt:
      "Autocomplete can speed up learning or quietly replace it. The difference comes down to how new developers choose to use it.",
    category: "Technology",
    author: "Emeka Nwosu",
    date: "2026-10-05",
    readTime: 6,
    image: "/demo-post.png",
    likes: 173,
  },
  {
    id: 9,
    slug: "faith-and-community-the-role-of-gathering-together",
    title: "Faith and community: the role of gathering together",
    excerpt:
      "Beyond belief, shared worship builds networks of support, memory, and responsibility that hold neighbourhoods together.",
    category: "Religion",
    author: "Zainab Bello",
    date: "2026-10-02",
    readTime: 6,
    image: "/demo-post.png",
    likes: 59,
  },
  {
    id: 10,
    slug: "why-sleep-is-the-most-underrated-science-of-performance",
    title: "Why sleep is the most underrated science of performance",
    excerpt:
      "Memory, mood, and immunity all depend on it. Recent research makes a strong case for treating sleep as a skill worth training.",
    category: "Science",
    author: "Kelechi Okoro",
    date: "2026-09-29",
    readTime: 7,
    image: "/demo-post.png",
    likes: 120,
  },
];
