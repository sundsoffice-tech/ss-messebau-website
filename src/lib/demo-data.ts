// Barrel re-export for backward compatibility.
// Each data set is in its own file so Vite can create separate chunks.
// Pages that only need references won't load the blog posts and vice versa.
export { DEMO_REFERENCES } from './demo-references'
export { DEMO_BLOG_POSTS } from './demo-blog-posts'
