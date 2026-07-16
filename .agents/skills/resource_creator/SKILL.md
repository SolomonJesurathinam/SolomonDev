---
name: resource_creator
description: Generates high-quality, verified developer resource items for Solomon's portfolio platform. Knows the exact categories, types, constraints, and database fields required by the SolomonDev resources system.
---

# Resource Creator Skill

This skill guides the creation and update of developer resources for the SolomonDev platform. Always use this structure and follow these rules.

---

## 1. Resource Data Schema

A resource item has the following properties:

| Field | Required | Type | Validation Rules |
|---|---|---|---|
| **Title** | Yes | Text | Under 60 characters. Active verbs, clear naming. |
| **Description** | Yes | Text | 150-250 characters. Detail the value of the reference, its tools/libraries, and target audience. |
| **Type** | Yes | Enum | Must be exactly: `Cheat Sheet`, `Repository`, `Template`, or `PDF`. |
| **Category** | Yes | Enum | Must be exactly: `Android`, `AI`, `Automation`, or `Other`. |
| **URL** | Yes | Text (URL) | Must be a verified, public, active link (HTTPS). |

---

## 2. Resource Type Definitions

- **`Cheat Sheet`**: Quick-lookup references, API guides, syntax charts, or command catalogs.
- **`Repository`**: Live open-source codebases, demo applications, or SDK wrappers.
- **`Template`**: Boilerplate starters, config blueprints, or setup architectures.
- **`PDF`**: Static documents, downloadable cheatsheets, or official whitepapers.

---

## 3. Resource Category Guidelines

### 🤖 AI (Artificial Intelligence)
- Focus: On-device models, ML Kit integrations, TensorFlow Lite, Gemini Nano SDKs, and local inference pipelines.

### 📱 Android
- Focus: Kotlin syntax, Jetpack Compose UI patterns, Material 3 Expressive, system-level APIs, modern architecture (MVI/MVVM), and optimization.

### ⚙️ Automation
- Focus: Appium framework config, Selenium test grids, Gradle automation, CI/CD pipelines (GitHub Actions/Bitrise), and testing libraries (JUnit/TestNG).

### 🌐 Other
- Focus: General developer tools, backend integrations, databases (e.g. Supabase tips), or design files.

---

## 4. Content Style Rules

1. **Descriptions are professional & concise** — Write in the third person. Don't say "I built this..." or "This is a great...". Say: *"A structured reference covering..."* or *"A production-grade boilerplate using..."*.
2. **Capitalize components correctly** — Use correct syntax for technologies: `Jetpack Compose` (not compose), `Kotlin` (not kotlin), `TensorFlow Lite` (not tflite), `Appium` (not appium).
3. **Always use verified URLs** — Never guess or input placeholder links. Use official GitHub domains (`github.com/org/repo`), official documentation portals (`developer.android.com`), or active guides.
4. **Link to personal projects where possible** — Highlighting the user's own repositories drives engagement and profile traffic.

---

## 5. Output Format

When generating new resources, the AI must output them in this format:

```
Title: [Clean Resource Title]
Description: [Value-driven explanation of the resource]
Type: [Cheat Sheet / Repository / Template / PDF]
Category: [Android / AI / Automation / Other]
URL: [Verified URL Link]
```

---

## 6. How to Request Resource Creation

When asking for resources, you can use prompts like:

- *"Create a resources list for [topic] using the resource_creator skill"*
- *"Draft 3 new resources for the AI category"*
- *"Suggest some high-quality Appium/Selenium testing templates to add"*
