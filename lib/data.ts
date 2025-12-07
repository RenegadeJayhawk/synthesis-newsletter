// Simple article data structure for the newsletter
export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured?: boolean;
}

// Articles data
export const articles: Article[] = [
  {
    slug: 'future-of-ai-reasoning',
    title: 'The Future of AI Reasoning: Beyond Large Language Models',
    excerpt: 'Exploring the next generation of AI systems that can reason, plan, and solve complex problems with human-like intelligence.',
    author: 'Dr. Sarah Chen',
    date: 'January 15, 2024',
    readTime: '8 min read',
    category: 'Artificial Intelligence',
    tags: ['Reasoning', 'LLMs', 'Neural Networks'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    featured: true
  },
  {
    slug: 'machine-learning-ethics',
    title: 'Navigating the Ethical Landscape of Machine Learning',
    excerpt: 'A comprehensive guide to understanding and implementing ethical AI practices in modern machine learning systems.',
    author: 'Prof. Michael Rodriguez',
    date: 'January 12, 2024',
    readTime: '6 min read',
    category: 'Ethics',
    tags: ['Ethics', 'Bias', 'Fairness'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'
  },
  {
    slug: 'robotics-breakthrough-2024',
    title: 'Robotics Breakthrough: Humanoid Robots Enter the Workforce',
    excerpt: 'The latest developments in humanoid robotics and their potential impact on various industries.',
    author: 'Dr. Emily Watson',
    date: 'January 10, 2024',
    readTime: '5 min read',
    category: 'Robotics',
    tags: ['Humanoid', 'Automation', 'Workforce'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  },
  {
    slug: 'generative-ai-creative-industries',
    title: 'Generative AI Transforms Creative Industries',
    excerpt: 'How AI-powered tools are revolutionizing art, design, music, and content creation across creative fields.',
    author: 'Alex Kim',
    date: 'January 8, 2024',
    readTime: '7 min read',
    category: 'Artificial Intelligence',
    tags: ['Creative AI', 'Art', 'Innovation'],
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop'
  }
]

