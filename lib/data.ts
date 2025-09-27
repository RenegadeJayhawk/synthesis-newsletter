import { Article, Author, Category, Tag } from '@/types'

// Authors
export const authors: Author[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    bio: 'AI Research Scientist at Stanford University, specializing in neural networks and machine learning architectures. Published over 50 papers in top-tier conferences.',
    avatar: {
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      alt: 'Dr. Sarah Chen'
    },
    expertise: ['Machine Learning', 'Neural Networks', 'Deep Learning', 'Computer Vision'],
    socialLinks: {
      twitter: 'https://twitter.com/sarahchen_ai',
      linkedin: 'https://linkedin.com/in/sarahchen',
      website: 'https://sarahchen.ai'
    }
  },
  {
    id: '2',
    name: 'Prof. Michael Rodriguez',
    bio: 'Professor of Computer Science at MIT, focusing on AI ethics and responsible machine learning. Author of "The Ethical AI Framework".',
    avatar: {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      alt: 'Prof. Michael Rodriguez'
    },
    expertise: ['AI Ethics', 'Machine Learning', 'Philosophy of AI', 'Policy'],
    socialLinks: {
      twitter: 'https://twitter.com/profrodriguez',
      linkedin: 'https://linkedin.com/in/michaelrodriguez'
    }
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    bio: 'Robotics Engineer and researcher at Boston Dynamics, pioneering advances in humanoid robotics and autonomous systems.',
    avatar: {
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      alt: 'Dr. Emily Watson'
    },
    expertise: ['Robotics', 'Autonomous Systems', 'Mechanical Engineering', 'AI'],
    socialLinks: {
      twitter: 'https://twitter.com/emilywatson_rob',
      linkedin: 'https://linkedin.com/in/emilywatson'
    }
  },
  {
    id: '4',
    name: 'Alex Kim',
    bio: 'Senior AI Engineer at OpenAI, working on large language models and generative AI systems. Former Google Brain researcher.',
    avatar: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      alt: 'Alex Kim'
    },
    expertise: ['Large Language Models', 'Generative AI', 'NLP', 'Transformers'],
    socialLinks: {
      twitter: 'https://twitter.com/alexkim_ai',
      linkedin: 'https://linkedin.com/in/alexkim'
    }
  }
]

// Categories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Artificial Intelligence',
    slug: 'ai',
    description: 'Latest developments in AI research and applications',
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Machine Learning',
    slug: 'ml',
    description: 'Machine learning algorithms, techniques, and breakthroughs',
    color: '#8B5CF6'
  },
  {
    id: '3',
    name: 'Robotics',
    slug: 'robotics',
    description: 'Advances in robotics and autonomous systems',
    color: '#10B981'
  },
  {
    id: '4',
    name: 'Ethics',
    slug: 'ethics',
    description: 'AI ethics, responsible AI, and societal implications',
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Research',
    slug: 'research',
    description: 'Cutting-edge research papers and academic insights',
    color: '#EF4444'
  }
]

// Tags
export const tags: Tag[] = [
  { id: '1', name: 'Reasoning', slug: 'reasoning' },
  { id: '2', name: 'LLMs', slug: 'llms' },
  { id: '3', name: 'Neural Networks', slug: 'neural-networks' },
  { id: '4', name: 'Ethics', slug: 'ethics' },
  { id: '5', name: 'Bias', slug: 'bias' },
  { id: '6', name: 'Fairness', slug: 'fairness' },
  { id: '7', name: 'Humanoid', slug: 'humanoid' },
  { id: '8', name: 'Automation', slug: 'automation' },
  { id: '9', name: 'Workforce', slug: 'workforce' },
  { id: '10', name: 'Creative AI', slug: 'creative-ai' },
  { id: '11', name: 'Art', slug: 'art' },
  { id: '12', name: 'Innovation', slug: 'innovation' }
]

// Articles
export const articles: Article[] = [
  {
    id: '1',
    title: 'The Future of AI Reasoning: Beyond Large Language Models',
    slug: 'future-of-ai-reasoning',
    excerpt: 'Exploring the next generation of AI systems that can reason, plan, and solve complex problems with human-like intelligence.',
    content: 'The field of artificial intelligence is experiencing a paradigm shift. While large language models (LLMs) have demonstrated remarkable capabilities in natural language processing, the next frontier lies in developing AI systems that can truly reason, plan, and solve complex problems with human-like intelligence.',
    author: authors[0],
    category: categories[0],
    tags: [tags[0], tags[1], tags[2]],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      alt: 'AI Neural Network Visualization',
      width: 800,
      height: 400
    },
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    readingTime: 8,
    isPublished: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Navigating the Ethical Landscape of Machine Learning',
    slug: 'machine-learning-ethics',
    excerpt: 'A comprehensive guide to understanding and implementing ethical AI practices in modern machine learning systems.',
    content: 'As machine learning systems become increasingly prevalent in our daily lives, the importance of ethical considerations in AI development has never been more critical.',
    author: authors[1],
    category: categories[3],
    tags: [tags[3], tags[4], tags[5]],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
      alt: 'Digital Ethics Concept',
      width: 800,
      height: 400
    },
    publishedAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    readingTime: 6,
    isPublished: true,
    isFeatured: false
  },
  {
    id: '3',
    title: 'Robotics Breakthrough: Humanoid Robots Enter the Workforce',
    slug: 'robotics-breakthrough-2024',
    excerpt: 'The latest developments in humanoid robotics and their potential impact on various industries.',
    content: '2024 marks a pivotal year in robotics as humanoid robots transition from research laboratories to real-world applications.',
    author: authors[2],
    category: categories[2],
    tags: [tags[6], tags[7], tags[8]],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
      alt: 'Humanoid Robot in Workplace',
      width: 800,
      height: 400
    },
    publishedAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    readingTime: 5,
    isPublished: true,
    isFeatured: false
  },
  {
    id: '4',
    title: 'Generative AI Transforms Creative Industries',
    slug: 'generative-ai-creative-industries',
    excerpt: 'How AI-powered tools are revolutionizing art, design, music, and content creation across creative fields.',
    content: 'The creative industries are experiencing a seismic shift as generative artificial intelligence tools become increasingly sophisticated and accessible.',
    author: authors[3],
    category: categories[0],
    tags: [tags[9], tags[10], tags[11]],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
      alt: 'AI Generated Art Concept',
      width: 800,
      height: 400
    },
    publishedAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    readingTime: 7,
    isPublished: true,
    isFeatured: false
  }
]

