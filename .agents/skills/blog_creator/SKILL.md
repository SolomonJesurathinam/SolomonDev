---
name: blog_creator
description: Creates trending, production-ready blog posts for Solomon's developer portfolio blog. Knows the exact custom markdown parser syntax, image format, available categories, and content style required for the SolomonDev blog system.
---

# Blog Creator Skill

This skill generates crisp, trending blog posts formatted exactly for the SolomonDev custom blog parser. Always follow these rules precisely when creating blog content.

---

## 1. Blog Parser — Supported Syntax

The blog uses a **custom line-by-line parser** in `BlogPost.jsx`. Only these elements are supported:

### Headers
```
### Section Title    → <h3> (most common, use for sections)
## Major Section     → <h2> (use sparingly for big topic breaks)
# Page Title         → <h1> (avoid — title already shown above content)
```

### Text Formatting (inline, within paragraphs)
```
**bold text**        → bold
*italic text*        → italic
`inline code`        → monospace code pill (purple tint)
[link text](url)     → clickable link (opens in new tab)
```

### Lists
```
- bullet item        → unordered list item
1. numbered item     → ordered list item
```
> Each list item must be on its own line. No nested lists.

### Code Blocks
````
```kotlin
val x = "your code here"
```
````
Supported language labels for syntax highlighting: `kotlin`, `java`, `javascript`, `python`, `bash`, `sql`, `xml`, `json`, `swift`, `dart`, `code`

### Images ← CRITICAL FORMAT
```
![Caption text here](https://full-url-to-image.jpg)
```
- Must be on its **own line** — never inline inside a sentence
- Alt text (inside `[]`) shows as italic caption below the image
- Use **Unsplash** URLs for generic tech images: `https://images.unsplash.com/photo-XXXX?w=1200&q=80`
- Use `/blog/filename.png` for images saved in `public/blog/`
- Full production URL: `https://solomondev.pages.dev/blog/filename.png`

### Blockquotes (Key Takeaways / Callouts)
```
> Your important insight or key takeaway goes here.
```
Renders as a purple left-border callout card. Use 1–2 per post for emphasis.

### YouTube Embeds
```
@[youtube](VIDEO_ID)
```

### Blank Lines
Empty lines render as spacing (`1rem` height spacer). Use them between sections.

---

## 2. Post Metadata

| Field | Options | Notes |
|---|---|---|
| **Title** | Any string | Crisp, 6–10 words. Include a number or strong verb. |
| **Category** | `Android`, `AI`, `Automation` | Pick the most relevant one |
| **Reading Time** | Number (minutes) | Count ~250 words/min. Most posts: 5–8 min |
| **Published** | Toggle on | Always publish immediately unless drafting |

---

## 3. Post Structure Template

Every post should follow this structure:

```
[Hook paragraph — 2-3 sentences, state the problem or insight immediately]

![Descriptive caption](https://images.unsplash.com/photo-XXXX?w=1200&q=80)

### Why This Matters
[Context — why the reader should care]

### [Core Section 1]
[Explanation with bullet points or numbered steps]

### [Core Section 2]
[Code example if relevant]

```kotlin
// Minimal, working, copy-pasteable code
```

### [Core Section 3]
[Practical implications or real-world use]

> [One punchy key takeaway in a blockquote]

### [Closing Section — "What's Next" or "Should You Adopt?"]
[Actionable conclusion — what the reader should do NOW]
```

---

## 4. Content Style Rules

1. **Open strong** — First sentence must hook immediately. No "In today's world..." intros.
2. **Short paragraphs** — Max 3 sentences per paragraph. White space is your friend.
3. **Bold key terms** — First occurrence of a technical term should be `**bolded**`.
4. **Code must be minimal** — Only show the most relevant 5–15 lines. No boilerplate.
5. **One blockquote per post** — Use it for the single most important insight.
6. **Concrete over abstract** — Use real numbers ("200ms", "40% reduction") not vague claims.
7. **End with action** — Last paragraph tells the reader exactly what to do next.

---

## 5. Trending Topic Categories (2026)

### 🤖 AI Category
- Gemini Nano / on-device AI with AICore
- Android AppFunctions (AI agent targets)
- TensorFlow Lite / ML Kit offline inference
- AI-powered Android Studio Agent Mode
- On-device image understanding / RAG

### 📱 Android Category
- Jetpack Compose performance optimizations
- Material 3 Expressive design system
- Android 16 edge-to-edge + predictive back
- Kotlin 2.2 + K2 compiler improvements
- WorkManager + Coroutines background tasks
- Baseline Profiles for app startup speed

### ⚙️ Automation Category
- Selenium + Appium mobile test automation
- GitHub Actions CI/CD for Android
- Gradle build optimization tips
- Firebase Test Lab integration

---

## 6. Unsplash Image URLs by Topic

Use these as starting points — change the photo ID for variety:

| Topic | Unsplash URL |
|---|---|
| AI / Neural Networks | `https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80` |
| Android / Mobile | `https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&q=80` |
| Code / Programming | `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80` |
| Performance / Speed | `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80` |
| Design / UI | `https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80` |
| Testing / Automation | `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80` |
| Kotlin / Multiplatform | `https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&q=80` |

For custom blog images, save `.png` or `.jpg` files to `public/blog/` and reference as:
```
![Caption](https://solomondev.pages.dev/blog/your-image-name.png)
```

---

## 7. How to Request Blog Posts

When asking for blog content, use prompts like:

- *"Create a blog post about [topic] using the blog_creator skill"*
- *"Write 3 trending blog posts for today"*
- *"Create a blog post on [topic] with a code example for [specific API/feature]"*
- *"Write a blog post comparing [X vs Y]"*

The output will always be:
1. **Title, Category, Reading Time** — ready to fill into the Admin form
2. **Full content** — copy-paste ready, no extra wrapping, correct syntax
3. **Image line** — embedded at the right position in the content

---

## 8. Example Complete Post Output Format

```
Title: [Post Title Here]
Category: Android
Reading Time: 6

---CONTENT START---
[hook paragraph]

![Caption for hero image](https://images.unsplash.com/photo-XXXX?w=1200&q=80)

### Why This Matters
[explanation]

### Implementation
[details]

```kotlin
// code here
```

> Key takeaway in a blockquote.

### What You Should Do Now
[actionable conclusion]
---CONTENT END---
```
