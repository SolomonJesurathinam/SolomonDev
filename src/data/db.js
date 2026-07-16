import { supabase } from '../supabaseClient';
import { apps as staticApps } from './apps';

export { supabase };


// Utility to generate/retrieve a persistent voter fingerprint to prevent double-voting
export const getVoterFingerprint = () => {
  let fingerprint = localStorage.getItem('voter_fingerprint');
  if (!fingerprint) {
    fingerprint = 'fp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('voter_fingerprint', fingerprint);
  }
  return fingerprint;
};

// --- AUTO-SEEDING ROUTINE ---
// Seeds initial tables with default content if they are completely empty.
export const seedDatabaseIfEmpty = async () => {
  try {
    // 1. Seed Apps
    const { data: existingApps, error: appError } = await supabase.from('apps').select('id');
    if (!appError && (!existingApps || existingApps.length === 0)) {
      const appsToInsert = staticApps.map(app => ({
        id: app.id,
        name: app.name,
        package_id: app.packageId,
        category: app.category,
        short_desc: app.shortDesc,
        long_desc: app.longDesc,
        features: app.features,
        play_store_url: app.playStoreUrl,
        badge_type: app.badgeType,
        icon_name: app.iconName
      }));
      await supabase.from('apps').insert(appsToInsert);
      console.log('Database: Apps table seeded successfully.');
    }

    // 2. Seed Blog Posts
    const { data: existingBlogs, error: blogError } = await supabase.from('blog_posts').select('id');
    if (!blogError && (!existingBlogs || existingBlogs.length === 0)) {
      const blogsToInsert = [
        {
          title: "Building Offline-First Android Apps with On-Device AI",
          category: "AI",
          content: `In modern mobile development, user expectations have shifted towards instant feedback and robust offline capabilities. Integrating AI features on-device allows developers to meet these demands while fully protecting user privacy.

### Why On-Device AI?
1. **Zero Latency**: No network roundtrips means immediate responses.
2. **Privacy First**: Sensitive user data never leaves the mobile device.
3. **Offline Reliability**: Your app works perfectly in flight mode or areas with poor cellular service.

### Technical Implementation with TensorFlow Lite
To run inference offline, we load compressed models directly in our Kotlin/Java layers.
\`\`\`kotlin
val model = FileUtil.loadMappedFile(context, "mobile_classifier.tflite")
val interpreter = Interpreter(model, options)
// Run inference
interpreter.run(inputBuffer, outputBuffer)
\`\`\`

By utilizing hardware acceleration (NNAPI or GPU delegates), on-device models perform efficiently without draining battery life. We are using these patterns across the SolomonDev portfolio, particularly in our offline-first tools.`,
          reading_time: 5,
          likes: 24,
          views: 142,
          published: true
        },
        {
          title: "Mastering Jupyter Notebooks on Android: Under the Hood of Ipynb Viewer",
          category: "Android",
          content: `Jupyter Notebooks (.ipynb) are the de facto standard for sharing data science workflows. However, rendering their complex JSON structures, embedded images, LaTeX equations, and raw code segments on a mobile screen is a massive engineering hurdle.

In this post, we discuss how the **Ipynb Viewer** renders these files completely offline.

### The Rendering Pipeline
1. **JSON Parser**: The application parses the `.ipynb` file to extract cells (Markdown, Code, Output).
2. **HTML Generation**: Cell outputs, syntax-highlighted code, and Markdown are formatted into a single custom HTML string.
3. **WebView Canvas**: A hardware-accelerated Android WebView renders the output using local CSS files.

### Converting HTML to PDF
To enable seamless PDF sharing, we run a native print manager adapter:
\`\`\`java
PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter("Jupyter_Notebook");
printManager.print("Document_Title", printAdapter, new PrintAttributes.Builder().build());
\`\`\`
This achieves high-quality outputs that preserve all cell margins and code indentations.`,
          reading_time: 6,
          likes: 38,
          views: 289,
          published: true
        },
        {
          title: "Effective QA Automation in Modern CI/CD Pipelines",
          category: "Automation",
          content: `QA Automation is not just about writing scripts; it's about shifting quality checks left in the software release cycle. An automated suite that takes hours to run or yields flaky results does more harm than good.

### Key Tenets of QA Automation
- **Flakiness Mitigation**: Design robust element locators (CSS/XPath) and employ dynamic waits instead of hardcoded thread sleeps.
- **Parallelization**: Break tests into independent suites that run concurrently to reduce pipeline times.
- **Actionable Reports**: Capture screenshots, logs, and trace files on failure.

Implementing automated Appium and Selenium checks has allowed us to deliver software faster with nearly zero critical regressions.`,
          reading_time: 4,
          likes: 15,
          views: 95,
          published: true
        }
      ];
      await supabase.from('blog_posts').insert(blogsToInsert);
      console.log('Database: Blogs table seeded successfully.');
    }

    // 3. Seed Feature Requests
    const { data: existingFeatures, error: featureError } = await supabase.from('feature_requests').select('id');
    if (!featureError && (!existingFeatures || existingFeatures.length === 0)) {
      const featuresToSeed = [
        {
          title: "Google Drive Cloud Sync in Free Version",
          description: "Allow users to automatically back up and sync their notebook configurations and files directly to Google Drive in the standard version of Ipynb Viewer.",
          app_id: "ipynb-viewer",
          category: "Feature",
          status: "Planned",
          votes: 18
        },
        {
          title: "Folder Tree Structuring",
          description: "Add a nested folder sidebar hierarchy in PDFolio so that documents can be categorized inside nested directories.",
          app_id: "pdfolio",
          category: "UI Improvement",
          status: "In Progress",
          votes: 34
        },
        {
          title: "Dark Theme Toggle for Reader Screen",
          description: "Allow toggling between light, dark, and warm-sepia background page colors while reading PDFs in Universal Reader.",
          app_id: "universal-reader",
          category: "Feature",
          status: "Under Review",
          votes: 12
        }
      ];
      await supabase.from('feature_requests').insert(featuresToSeed);
      console.log('Database: Feature Requests table seeded successfully.');
    }

    // 4. Seed Changelogs
    const { data: existingLogs, error: logError } = await supabase.from('changelogs').select('id');
    if (!logError && (!existingLogs || existingLogs.length === 0)) {
      const logsToSeed = [
        {
          app_id: "ipynb-viewer",
          version: "2.1.0",
          release_date: new Date().toISOString().split('T')[0],
          added: ["Google Drive File Sync Beta Integration", "Double tap to zoom on code sections"],
          improved: ["Faster rendering pipeline for notebooks exceeding 10MB", "Enhanced syntax highlighting code blocks"],
          fixed: ["PDF generation crash on Android 14 devices", "Fixed image rendering sizes inside Markdown cells"],
          removed: []
        },
        {
          app_id: "pdfolio",
          version: "1.4.2",
          release_date: new Date().toISOString().split('T')[0],
          added: ["Built-in document scanner with edge detection filter", "Batch export files to ZIP archive"],
          improved: ["Reduced app size by 15% through native image compression"],
          fixed: ["OCR text extraction memory leak"],
          removed: []
        }
      ];
      await supabase.from('changelogs').insert(logsToSeed);
      console.log('Database: Changelogs table seeded successfully.');
    }

    // 5. Seed Resources
    const { data: existingResources, error: resError } = await supabase.from('resources').select('id');
    if (!resError && (!existingResources || existingResources.length === 0)) {
      const resourcesToSeed = [
        {
          title: "Android Jetpack Compose Cheat Sheet",
          description: "A comprehensive reference sheet covering standard compose layout widgets, state management flows, side effects, and visual modifiers.",
          type: "Cheat Sheet",
          url: "https://github.com/SolomonJesurathinam/ComposeCheatSheet",
          category: "Android"
        },
        {
          title: "Selenium + Appium Test Automation Framework Template",
          description: "A complete boiler-plate codebase in Java and Python designed with Page Object Models, configuration managers, and HTML report plugins.",
          type: "Repository",
          url: "https://github.com/SolomonJesurathinam/QA-Automation-Boilerplate",
          category: "Automation"
        },
        {
          title: "Local On-Device AI Inference Template",
          description: "A boilerplate template project showcasing how to load and run quantized LLMs and image classifiers locally using TensorFlow Lite in Android Studio.",
          type: "Template",
          url: "https://github.com/SolomonJesurathinam/Android-TFLite-Boilerplate",
          category: "AI"
        }
      ];
      await supabase.from('resources').insert(resourcesToSeed);
      console.log('Database: Resources table seeded successfully.');
    }

  } catch (err) {
    console.error('Database seeding failed:', err);
  }
};

// --- PUBLIC DATABASE OPERATIONS ---

// 1. Fetch Apps
export const getApps = async () => {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching apps:', error);
    return staticApps; // Fallback to static
  }
  return data && data.length > 0 ? data : staticApps;
};

// 2. Fetch Single App
export const getAppById = async (id) => {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error(`Error fetching app ${id}:`, error);
    return staticApps.find(a => a.id === id) || null;
  }
  return data;
};

// 3. Fetch Blogs
export const getBlogs = async (includeDrafts = false) => {
  let query = supabase.from('blog_posts').select('*');
  if (!includeDrafts) {
    query = query.eq('published', true);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
  return data || [];
};

// 4. Fetch Single Blog Post
export const getBlogById = async (id) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    return null;
  }
  return data;
};

// 5. Update Blog Views
export const incrementBlogViews = async (id, currentViews) => {
  const { data, error } = await supabase
    .rpc('increment_blog_views', { post_id: id });
  if (error) {
    console.error('Error incrementing views:', error);
    return { data: null, error };
  }
  return { data: { views: (currentViews || 0) + 1 }, error: null };
};

// 6. Upvote/Like Blog Post (Toggled via browser fingerprint, same as feature upvoting)
export const incrementBlogLikes = async (id) => {
  const fingerprint = getVoterFingerprint();
  
  // 1. Check if user already liked this blog
  const { data: existingLike, error: checkError } = await supabase
    .from('blog_likes')
    .select('*')
    .eq('post_id', id)
    .eq('voter_fingerprint', fingerprint)
    .maybeSingle();
    
  if (checkError) return { data: null, error: checkError };

  let isLiked = false;
  if (existingLike) {
    // Toggle off: delete like row
    const { error: deleteError } = await supabase
      .from('blog_likes')
      .delete()
      .eq('id', existingLike.id);
      
    if (deleteError) return { data: null, error: deleteError };
  } else {
    // Toggle on: insert like row
    const { error: insertError } = await supabase
      .from('blog_likes')
      .insert([{ post_id: id, voter_fingerprint: fingerprint }]);
      
    if (insertError) return { data: null, error: insertError };
    isLiked = true;
  }

  // 2. Fetch and return the updated blog post
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (data) {
    return { data: { ...data, userHasLiked: isLiked }, error: null };
  }
  return { data: null, error };
};

// Check if user has liked the blog post
export const checkIfUserLikedBlog = async (postId) => {
  const fingerprint = getVoterFingerprint();
  const { data, error } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('voter_fingerprint', fingerprint)
    .maybeSingle();
    
  if (error) return false;
  return !!data;
};

// 7. Fetch Feature Requests
export const getFeatureRequests = async (appId = '', status = '', sortBy = 'votes') => {
  let query = supabase.from('feature_requests').select('*, apps(name)');
  
  if (appId) query = query.eq('app_id', appId);
  if (status) query = query.eq('status', status);
  
  if (sortBy === 'votes') {
    query = query.order('votes', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching features:', error);
    return [];
  }
  return data || [];
};

// 8. Submit Feature Request
export const addFeatureRequest = async (feature) => {
  const { data, error } = await supabase
    .from('feature_requests')
    .insert([feature])
    .select()
    .single();
    
  if (!error && data) {
    const fingerprint = getVoterFingerprint();
    // Insert initial vote into feature_votes so the creator's vote is registered in the DB
    await supabase
      .from('feature_votes')
      .insert([{ request_id: data.id, voter_fingerprint: fingerprint, vote_type: 'up' }]);
  }
  
  return { data, error };
};

// 9. Upvote/Downvote Feature Request
export const voteFeature = async (requestId, voteType = 'up') => {
  const fingerprint = getVoterFingerprint();
  
  // 1. Check if user already voted on this feature
  const { data: existingVote, error: checkError } = await supabase
    .from('feature_votes')
    .select('*')
    .eq('request_id', requestId)
    .eq('voter_fingerprint', fingerprint)
    .maybeSingle();
    
  if (checkError) return { error: checkError };

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // If clicking same vote type, toggle off (delete vote)
      const { error: deleteError } = await supabase
        .from('feature_votes')
        .delete()
        .eq('id', existingVote.id);
        
      if (deleteError) return { error: deleteError };
    } else {
      // If changing vote type, update it
      const { error: updateVoteError } = await supabase
        .from('feature_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
        
      if (updateVoteError) return { error: updateVoteError };
    }
  } else {
    // New vote: insert to feature_votes
    const { error: insertVoteError } = await supabase
      .from('feature_votes')
      .insert([{ request_id: requestId, voter_fingerprint: fingerprint, vote_type: voteType }]);
      
    if (insertVoteError) return { error: insertVoteError };
  }

  // 2. Fetch and return the updated feature request (updated by DB trigger)
  const { data, error } = await supabase
    .from('feature_requests')
    .select('*, apps(name)')
    .eq('id', requestId)
    .single();
    
  return { data, error };
};

// 10. Fetch Bug Reports
export const getBugReports = async (appId = '') => {
  let query = supabase.from('bug_reports').select('*, apps(name)');
  if (appId) {
    query = query.eq('app_id', appId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching bugs:', error);
    return [];
  }
  return data || [];
};

// 11. Submit Bug Report
export const addBugReport = async (bug) => {
  const { data, error } = await supabase
    .from('bug_reports')
    .insert([bug])
    .select()
    .single();
  return { data, error };
};

// 12. Fetch Changelogs
export const getChangelogs = async (appId = '') => {
  let query = supabase.from('changelogs').select('*, apps(name)');
  if (appId) {
    query = query.eq('app_id', appId);
  }
  const { data, error } = await query.order('release_date', { ascending: false });
  if (error) {
    console.error('Error fetching changelogs:', error);
    return [];
  }
  return data || [];
};

// 13. Fetch Resources
export const getResources = async () => {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
  return data || [];
};

// 14. Submit Contact Message
export const addContactMessage = async (msg) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([msg])
    .select()
    .single();
  return { data, error };
};

// --- ADMIN DASHBOARD OPERATIONS ---

// 1. Add Blog
export const addBlog = async (blog) => {
  const { data, error } = await supabase.from('blog_posts').insert([blog]).select().single();
  return { data, error };
};

// 2. Update Blog
export const updateBlog = async (id, blog) => {
  const { data, error } = await supabase.from('blog_posts').update(blog).eq('id', id).select().single();
  return { data, error };
};

// 3. Delete Blog
export const deleteBlog = async (id) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  return { error };
};

// 4. Update App
export const updateAppDetails = async (id, appUpdates) => {
  const { data, error } = await supabase.from('apps').update(appUpdates).eq('id', id).select().single();
  return { data, error };
};

// 5. Update Feature Request Status
export const updateFeatureStatus = async (id, status) => {
  const { data, error } = await supabase.from('feature_requests').update({ status }).eq('id', id).select().single();
  return { data, error };
};

// 6. Delete Feature Request
export const deleteFeatureRequest = async (id) => {
  const { error } = await supabase.from('feature_requests').delete().eq('id', id);
  return { error };
};

// 7. Update Bug Report Status
export const updateBugStatus = async (id, status) => {
  const { data, error } = await supabase.from('bug_reports').update({ status }).eq('id', id).select().single();
  return { data, error };
};

// 8. Delete Bug Report
export const deleteBugReport = async (id) => {
  const { error } = await supabase.from('bug_reports').delete().eq('id', id);
  return { error };
};

// 9. Add Changelog
export const addChangelog = async (changelog) => {
  const { data, error } = await supabase.from('changelogs').insert([changelog]).select().single();
  return { data, error };
};

// 10. Delete Changelog
export const deleteChangelog = async (id) => {
  const { error } = await supabase.from('changelogs').delete().eq('id', id);
  return { error };
};

// 11. Update Changelog
export const updateChangelog = async (id, changelog) => {
  const { data, error } = await supabase.from('changelogs').update(changelog).eq('id', id).select().single();
  return { data, error };
};

// 12. Fetch Messages for Admin
export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

// 12. Mark Message as Read
export const markMessageRead = async (id, isRead = true) => {
  const { data, error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id).select().single();
  return { data, error };
};

// 13. Delete Message
export const deleteContactMessage = async (id) => {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  return { error };
};

// 14. Add Resource
export const addResource = async (resource) => {
  const { data, error } = await supabase.from('resources').insert([resource]).select().single();
  return { data, error };
};

// 15. Update Resource
export const updateResource = async (id, resource) => {
  const { data, error } = await supabase.from('resources').update(resource).eq('id', id).select().single();
  return { data, error };
};

// 16. Delete Resource
export const deleteResource = async (id) => {
  const { error } = await supabase.from('resources').delete().eq('id', id);
  return { error };
};
