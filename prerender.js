import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { apps } from './src/data/apps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Mock Browser Globals for Server-Side Execution
globalThis.window = {
  scrollTo: () => {},
  location: { href: '', pathname: '', search: '', hash: '', origin: 'https://solomondev.pages.dev', host: 'solomondev.pages.dev', hostname: 'solomondev.pages.dev' },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  localStorage: { getItem: () => null, setItem: () => {} }
};
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  title: ''
};
Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'Googlebot' },
  writable: true,
  configurable: true
});

// Helper to escape HTML tags inside JSON-LD
function sanitizeJsonLdString(str) {
  if (!str) return '';
  return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

// 2. Fetch env variables for Supabase
let supabaseUrl = '';
let supabaseAnonKey = '';
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8');
  supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
  supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';
} catch (e) {
  console.warn('Warning: Could not read .env file, checking process.env instead');
  supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
}

async function runPrerender() {
  console.log('🏁 Starting Static Site Generation (SSG) pipeline...');

  // 3. Build Client & SSR bundles
  console.log('📦 Building Client bundle...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('📦 Building SSR bundle...');
  execSync('npx vite build --config vite.config.ssr.js', { stdio: 'inherit' });

  // Import the render function dynamically from the built server entry point
  const serverBundlePath = path.resolve(__dirname, 'dist-server/entry-server.js');
  const { render } = await import(`file://${serverBundlePath}`);

  // Read the built client index.html as our base template
  const templatePath = path.resolve(__dirname, 'dist/index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // 4. Fetch dynamic blog posts from Supabase (with fallback)
  let blogPosts = [];
  if (supabaseUrl && supabaseAnonKey) {
    try {
      console.log('🌐 Fetching live blog posts from Supabase for static routing...');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, content, category, reading_time')
        .eq('published', true);
      
      if (!error && data) {
        blogPosts = data;
        console.log(`✅ Loaded ${blogPosts.length} published blog posts.`);
      } else {
        console.warn('⚠️ Supabase returned error fetching blogs:', error);
      }
    } catch (err) {
      console.warn('⚠️ Failed to connect to Supabase during build:', err.message);
    }
  } else {
    console.warn('⚠️ Supabase credentials missing. Dynamic blog pages will use fallback values.');
  }

  // 5. Define all route targets
  const routes = [
    { url: '/', title: 'Solomon J | Android App Developer Portfolio', desc: 'Explore the official Android app portfolio of Solomon J. Featuring productivity utilities like Ipynb Viewer, PDFolio, OneGrid, EMI Buddy, and educational quiz games.' },
    { url: '/apps', title: 'Android Applications | Solomon J', desc: 'Explore the collection of premium Android utility, productivity, and educational applications developed by Solomon J. Available on the Google Play Store.' },
    { url: '/blog', title: 'Technical Android & AI Blog | Solomon J', desc: 'Read articles and deep dives on Android development, Jetpack Compose performance, Kotlin Multiplatform, and on-device AI integration.' },
    { url: '/resources', title: 'Developer Resources & Cheat Sheets | Solomon J', desc: 'Get curated cheat sheets, boilerplate templates, and download PDFs for Android development, Kotlin, Appium, and CI/CD pipelines.' },
    { url: '/changelogs', title: 'Application Release Changelogs | Solomon J', desc: 'View the active updates, bug fixes, and feature additions across the SolomonDev application catalog.' },
    { url: '/roadmap', title: 'Android Apps Feature Roadmap | Solomon J', desc: 'Follow our active product pipeline and vote on the next features for Ipynb Viewer, PDFolio, and other utility apps.' },
    { url: '/bugs', title: 'Submit Bug Report | Solomon J', desc: 'Report application issues, crashes, or feedback directly. Help improve Ipynb Viewer, PDFolio, and other Android tools.' },
    { url: '/features', title: 'Suggest Feature Requests | Solomon J', desc: 'Submit and vote on feature ideas for our utility apps. Help shape the product roadmap directly.' },
    { url: '/privacy', title: 'Privacy & Data Safety Compliance Hub | Solomon J', desc: 'Official privacy policies, permissions breakdown, and data safety instructions for all SolomonDev Android applications.' },
    { url: '/contact', title: 'Contact & Developer Support | Solomon J', desc: 'Send support inquiries, feature ideas, or business requests directly to Solomon J.' },
  ];

  // Append dynamic App detail routes
  for (const app of apps) {
    routes.push({
      url: `/apps/${app.id}`,
      title: `${app.name} | Android App Detail — Solomon J`,
      desc: app.shortDesc || `Download ${app.name} for Android. Features, release logs, and developer support.`,
      appData: app
    });
  }

  // Append dynamic Blog post routes
  for (const post of blogPosts) {
    routes.push({
      url: `/blog/${post.id}`,
      title: `${post.title} | Solomon J Developer Blog`,
      desc: post.content ? post.content.replace(/[#*`>]/g, '').substring(0, 155).trim() + '...' : `Read this article on ${post.category || 'Android'} development.`,
      blogData: post
    });
  }

  console.log(`🚀 Prerendering ${routes.length} static routes...`);

  // 6. Generate and save independent HTML files for each route
  for (const route of routes) {
    const fullUrl = `https://solomondev.pages.dev${route.url}`;
    let htmlContent = '';

    try {
      // Render React structure to string
      htmlContent = render(route.url);
    } catch (renderError) {
      console.error(`❌ Error rendering route ${route.url}:`, renderError);
      continue;
    }

    // Build SEO metadata block
    let metaTags = `
    <meta name="description" content="${route.desc}" />
    <link rel="canonical" href="${fullUrl}" />
    <!-- Open Graph Metadata -->
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.desc}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="${route.url.startsWith('/blog/') ? 'article' : 'website'}" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&q=80" />
    <meta property="og:site_name" content="Solomon J Portfolio" />
    <!-- Twitter Card Metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.desc}" />
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&q=80" />
    `;

    // Construct schemas
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Solomon Dev Portfolio",
        "url": "https://solomondev.pages.dev"
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Solomon J",
        "jobTitle": "Android Developer",
        "url": "https://solomondev.pages.dev",
        "sameAs": [
          "https://github.com/SolomonJesurathinam",
          "https://play.google.com/store/apps/developer?id=Solomon+J"
        ]
      }
    ];

    // Page-specific Schemas
    if (route.appData) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": route.appData.name,
        "operatingSystem": "Android",
        "applicationCategory": route.appData.category === 'Productivity' ? 'BusinessApplication' : 'EducationalApplication',
        "installUrl": route.appData.playStoreUrl,
        "description": route.appData.shortDesc,
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD"
        }
      });
    }

    if (route.blogData) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": fullUrl
        },
        "headline": route.blogData.title,
        "description": route.desc,
        "author": {
          "@type": "Person",
          "name": "Solomon J"
        },
        "publisher": {
          "@type": "Person",
          "name": "Solomon J",
          "logo": {
            "@type": "ImageObject",
            "url": "https://solomondev.pages.dev/favicon.svg"
          }
        }
      });
    }

    // Embed schemas in JSON-LD tag
    let schemaJson = '';
    for (const schema of schemas) {
      schemaJson += `\n    <script type="application/ld+json">${sanitizeJsonLdString(JSON.stringify(schema, null, 2))}</script>`;
    }

    // Merge metadata, titles, and rendered HTML into our template
    let outputHtml = template
      .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description" content=".*?" \/>/, '') // remove default
      .replace('</head>', `${metaTags}${schemaJson}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${htmlContent}</div>`);

    // Write file to target output path (creates nested directories if needed)
    const relativeFolder = route.url === '/' ? '.' : route.url.substring(1);
    const targetFolder = path.resolve(__dirname, 'dist', relativeFolder);
    
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    
    const targetFile = path.resolve(targetFolder, 'index.html');
    fs.writeFileSync(targetFile, outputHtml, 'utf-8');
  }

  // Cleanup: Delete the SSR server build directory since it's no longer needed
  try {
    fs.rmSync(path.resolve(__dirname, 'dist-server'), { recursive: true, force: true });
    console.log('🧹 Cleaned up SSR server build directory.');
  } catch (cleanError) {
    console.warn('⚠️ Warning: Failed to delete dist-server directory:', cleanError.message);
  }

  console.log('🎉 Static Site Generation (SSG) completed successfully!');
}

runPrerender().catch(console.error);
