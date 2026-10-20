// Public tool metadata. Shared by the browser (renders the forms) and the
// server (validates inputs). Prompts live server-side in api/_tools.js.
const L = 20000;
export const TOOLS = [
  {
    id: 'content-writer', name: 'AI Content Writer', glyph: 'Aa',
    desc: 'Draft blog posts, emails, product copy and more.',
    fields: [
      { name: 'format', label: 'Format', type: 'select', options: ['Blog post', 'Email', 'Product description', 'Social post', 'Essay', 'Press release'] },
      { name: 'topic', label: 'Topic', type: 'textarea', required: true, placeholder: 'What should it be about?', max: 2000 },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Persuasive', 'Playful', 'Formal'] },
      { name: 'details', label: 'Extra details (optional)', type: 'textarea', placeholder: 'Audience, key points, length…', max: 2000 },
    ],
  },
  {
    id: 'summarizer', name: 'Text Summarizer', glyph: '∑',
    desc: 'Condense long text into the points that matter.',
    fields: [
      { name: 'text', label: 'Text to summarize', type: 'textarea', required: true, placeholder: 'Paste an article, notes or a document…', max: L },
      { name: 'length', label: 'Length', type: 'select', options: ['Short', 'Medium', 'Detailed'] },
      { name: 'style', label: 'Style', type: 'select', options: ['Bullet points', 'Paragraph'] },
    ],
  },
  {
    id: 'code-explainer', name: 'Code Explainer', glyph: '</>',
    desc: 'Understand any snippet, line by line.',
    fields: [
      { name: 'code', label: 'Code', type: 'textarea', required: true, placeholder: 'Paste your code…', max: L, mono: true },
      { name: 'language', label: 'Language (optional)', type: 'text', placeholder: 'e.g. JavaScript', max: 60 },
      { name: 'level', label: 'Explain for', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    ],
  },
  {
    id: 'website-ideas', name: 'Website Idea Generator', glyph: '◇',
    desc: 'Get concrete website concepts for any niche.',
    fields: [
      { name: 'niche', label: 'Niche or industry', type: 'text', required: true, placeholder: 'e.g. local bakery, indie game studio', max: 200 },
      { name: 'audience', label: 'Target audience (optional)', type: 'text', placeholder: 'Who is it for?', max: 200 },
      { name: 'goal', label: 'Main goal', type: 'select', options: ['Get customers', 'Show a portfolio', 'Sell products', 'Share information', 'Build a community'] },
    ],
  },
  {
    id: 'html-css-helper', name: 'HTML and CSS Helper', glyph: '{ }',
    desc: 'Write, fix and explain HTML and CSS.',
    fields: [
      { name: 'mode', label: 'What do you need?', type: 'select', options: ['Write new code', 'Fix a bug', 'Explain code', 'Make it responsive'] },
      { name: 'task', label: 'Describe it', type: 'textarea', required: true, placeholder: 'e.g. A pricing card with a hover glow', max: 3000 },
      { name: 'code', label: 'Your code (optional)', type: 'textarea', placeholder: 'Paste existing HTML/CSS…', max: L, mono: true },
    ],
  },
  {
    id: 'study-assistant', name: 'AI Study Assistant', glyph: '?',
    desc: 'Explanations, quizzes, flashcards and study plans.',
    fields: [
      { name: 'topic', label: 'Topic or question', type: 'textarea', required: true, placeholder: 'e.g. How does photosynthesis work?', max: 3000 },
      { name: 'mode', label: 'Help me with', type: 'select', options: ['Explain simply', 'Quiz me', 'Make flashcards', 'Build a study plan'] },
      { name: 'level', label: 'My level', type: 'select', options: ['School', 'High school', 'College', 'Professional'] },
    ],
  },
  {
    id: 'caption-generator', name: 'Caption Generator', glyph: '#',
    desc: 'Scroll-stopping captions with optional hashtags.',
    fields: [
      { name: 'description', label: 'What is the post about?', type: 'textarea', required: true, placeholder: 'Describe the photo, video or announcement…', max: 2000 },
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'LinkedIn', 'X (Twitter)', 'YouTube'] },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Casual', 'Funny', 'Inspiring', 'Professional', 'Bold'] },
      { name: 'hashtags', label: 'Hashtags', type: 'select', options: ['Include hashtags', 'No hashtags'] },
    ],
  },
  {
    id: 'prompt-generator', name: 'Prompt Generator', glyph: '✦',
    desc: 'Turn a rough goal into a well-structured prompt.',
    fields: [
      { name: 'goal', label: 'What do you want to achieve?', type: 'textarea', required: true, placeholder: 'e.g. Plan a week of meals for a student on a budget', max: 3000 },
      { name: 'target', label: 'Prompt is for', type: 'select', options: ['Chat assistant', 'Image generator', 'Coding assistant', 'Research assistant'] },
    ],
  },
];
