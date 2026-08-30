# PromptVerse Studio

Build a complete production-ready AI Prompt and AI Video Creation Platform called "Prompt Studio AI".

IMPORTANT: This is not just a static website.

Build the complete application including:

Premium frontend UI

Supabase PostgreSQL database

Supabase authentication

Admin authentication and authorization

Hidden admin dashboard

Prompt and tutorial management

Image and video uploads

AI video generation page

Secure API integration architecture

Supabase Edge Functions

Search and filtering

SEO-friendly public pages

Use the reference website only for understanding the general content concept of publishing AI tutorials and prompts.

DO NOT copy its design, branding, content, layout, images, or code.

Create a completely original, premium, modern AI creator platform.

==================================================
TECH STACK

Use:

Frontend:

React

TypeScript

Modern component architecture

Responsive design

Tailwind CSS or the existing styling system

Backend:

Supabase

Use Supabase for:

PostgreSQL database

Authentication

Row Level Security

Storage

Edge Functions

Secure environment secrets

IMPORTANT SECURITY RULE:

Never expose AI provider API keys in frontend code.

All AI API requests that require secret keys must go through Supabase Edge Functions.

Store API keys and secrets securely in Supabase secrets/environment variables.

==================================================
BRANDING

Website Name:

Prompt Studio AI

Tagline:

Create Amazing AI Images and Videos With Powerful Prompts

The website should feel like:

Modern AI platform

Prompt marketplace/library

Professional tutorial website

AI video creation studio

Use a premium modern interface.

Design characteristics:

Clean typography

Modern cards

Smooth animations

Excellent spacing

Premium gradients

Subtle glassmorphism

Professional dark mode

Optional light mode

Fully responsive mobile design

DO NOT create a generic blog website.

==================================================
PUBLIC NAVBAR

Create a responsive sticky navbar.

Show only:

Logo

Home

AI Video Prompts

AI Image Prompts

Tutorials

Trending

Categories

Create Video

Search

Theme Toggle

IMPORTANT:

DO NOT show:

Admin
Dashboard
Create Post
Manage Posts

The admin dashboard must NOT appear in:

Navbar

Mobile navigation

Footer

Public links

The admin pages should only be accessible through a direct route and authentication.

==================================================
PUBLIC ROUTES

Create the following public routes:

/

Home page

/prompts

All prompts

/prompts/ai-video

AI video prompts

/prompts/ai-image

AI image prompts

/tutorials

All tutorials

/trending

Trending content

/categories

All categories

/category/:slug

Individual category

/prompt/:slug

Individual prompt detail page

/tutorial/:slug

Individual tutorial page

/create-video

AI video creation studio

/search

Search results

/login

Admin login page

==================================================
ADMIN ROUTES

Create the following routes.

IMPORTANT:

Do not add these routes to the navbar or footer.

/admin

Admin dashboard

/admin/posts

Manage posts

/admin/posts/new

Create new post

/admin/posts/:id/edit

Edit post

/admin/prompts

Manage prompts

/admin/categories

Manage categories

/admin/media

Manage uploaded images and videos

/admin/video-generations

Manage AI video generation history

Only authenticated admin users can access these routes.

If a non-authenticated user attempts to visit an admin route:

Redirect them to:

/login

If an authenticated normal user attempts to visit admin:

Deny access.

==================================================
AUTHENTICATION

Use Supabase Authentication.

Initially implement:

Email and password authentication.

Create user roles.

Roles:

admin

user

Create a profiles table connected to Supabase auth.users.

The profiles table should contain:

id

full_name

email

role

avatar_url

created_at

updated_at

The role must control access to admin pages.

Use Row Level Security.

Only admin users can:

Create posts

Edit posts

Delete posts

Create prompts

Edit prompts

Delete prompts

Manage categories

Manage media

View all generation records

Regular public visitors should only see published content.

==================================================
DATABASE DESIGN

Create the necessary Supabase tables.

profiles

Fields:

id UUID primary key linked to auth.users

full_name

email

role

avatar_url

created_at

updated_at

==================================================

categories

Fields:

id UUID

name

slug

description

icon

image_url

created_at

updated_at

==================================================

posts

This is the main table for tutorials and articles.

Fields:

id UUID

title

slug

excerpt

content

featured_image_url

featured_video_url

content_type

category_id

author_id

status

featured

published_at

created_at

updated_at

Content type options:

tutorial

article

guide

Status options:

draft

published

archived

==================================================

prompts

Fields:

id UUID

title

slug

short_description

prompt_type

image_prompt

video_prompt

negative_prompt

tool_name

difficulty

estimated_time

featured_image_url

example_video_url

category_id

author_id

status

featured

views

copy_count

created_at

updated_at

Prompt type:

ai_image

ai_video

cinematic

character

birthday

wedding

reels

advertisement

animation

==================================================

prompt_tools

Allow one prompt to support multiple AI tools.

Fields:

id

prompt_id

tool_name

tool_url

==================================================

prompt_steps

Store step-by-step instructions.

Fields:

id

prompt_id

step_number

title

description

image_url

video_url

created_at

==================================================

media

Fields:

id

file_name

file_type

file_url

storage_path

alt_text

uploaded_by

created_at

==================================================

video_generations

Store AI video generation history.

Fields:

id

user_id

prompt

provider

model

input_image_url

input_video_url

generated_video_url

status

provider_job_id

error_message

duration

aspect_ratio

created_at

updated_at

Status:

queued

processing

completed

failed

==================================================

ai_providers

Create a configuration table.

Fields:

id

name

slug

enabled

description

created_at

Examples:

Google Flow

Veo

Kling

Runway

Other future providers

IMPORTANT:

Do not store secret API keys directly in this table.

Secrets must be stored securely in Supabase environment secrets.

==================================================
SUPABASE STORAGE

Create storage buckets.

public-images

For:

Post thumbnails

Prompt images

Category images

Public images

videos

For:

Generated videos

Tutorial videos

Example videos

uploads

For:

Admin uploads

Temporary user uploads

Configure storage access policies correctly.

Public published media can be viewed publicly.

Only authenticated admins can upload and manage website content.

==================================================
HOME PAGE

Create a premium homepage.

HERO SECTION

Large heading:

"Create Amazing AI Videos With Powerful Prompts"

Description:

"Discover ready-to-use AI prompts, cinematic video ideas, AI image prompts and step-by-step tutorials."

Add a search bar.

Placeholder:

"Search AI prompts, tutorials and video ideas..."

Buttons:

Explore Prompts

Create AI Video

TRENDING CONTENT

Display dynamic content from Supabase.

Show:

Trending prompts

Popular tutorials

Featured AI creations

PROMPT CATEGORIES

Display category cards dynamically from the categories table.

Categories:

AI Video

AI Image

Cinematic

Character

Birthday

Wedding

Instagram Reels

Cartoon Stories

Business Ads

Travel

Logo Animation

LATEST TUTORIALS

Fetch published tutorials from Supabase.

Each card should show:

Thumbnail

Category

Title

Description

Tools used

Published date

View Tutorial

FEATURED PROMPTS

Display featured prompts.

Each card should include:

Image

Title

Description

Tool badges

Difficulty

Estimated creation time

Copy Prompt button

View Prompt button

==================================================
PROMPT DETAIL PAGE

Route:

/prompt/:slug

Fetch data dynamically from Supabase.

Display:

Title

Featured image or example video

Description

Category

AI tools used

Difficulty

Estimated time

IMAGE PROMPT

Display inside a premium prompt box.

Add a working button:

Copy Image Prompt

When clicked:

Copy text to clipboard.

Show a small success message.

VIDEO PROMPT

Display inside another prompt box.

Button:

Copy Video Prompt

NEGATIVE PROMPT

Display only when available.

Button:

Copy Negative Prompt

STEP BY STEP GUIDE

Fetch prompt steps from Supabase.

Display:

Step number

Title

Description

Optional image

Optional video

RELATED PROMPTS

Automatically display related prompts from the same category.

==================================================
TUTORIAL PAGE

Route:

/tutorial/:slug

Display:

Title

Featured image

Video if available

Author

Published date

Category

Full tutorial content

AI tools used

Prompt sections

Step-by-step instructions

Related tutorials

==================================================
AI VIDEO CREATION PAGE

Route:

/create-video

This is a major feature.

Create a professional AI Video Creation Studio.

Layout:

Left side:

Input controls

Right side:

Preview and generation status

Allow users to:

Enter a video prompt

Choose an AI provider

Choose a model

Select:

Duration

Aspect ratio

Quality

Camera style

Motion style

Optional:

Upload an input image

Optional:

Upload an input video

VIDEO PROMPT FIELD

Large textarea.

Placeholder:

"Describe the AI video you want to create..."

AI PROVIDER SELECTOR

Display enabled providers dynamically.

Do not expose secret keys.

Each provider integration must use a secure backend Edge Function.

GENERATE VIDEO BUTTON

When clicked:

Validate user input.

Upload input media if provided.

Create a record in video_generations.

Set status to queued.

Call a Supabase Edge Function.

Edge Function securely calls the selected AI provider API.

Save the provider job ID.

Update status to processing.

Check provider status using a secure Edge Function or webhook architecture.

When completed:

Save generated video URL.

Update database status to completed.

Display generated video in the UI.

Allow download if the provider permits it.

==================================================
AI API ARCHITECTURE

Create a provider adapter architecture.

Do not hard-code the frontend specifically for one provider.

Use a common interface.

Example architecture:

generate-video Edge Function

Receives:

prompt

provider

model

duration

aspect_ratio

input_image_url

input_video_url

generation_id

The function should:

Validate authentication.

Validate input.

Check the selected provider is enabled.

Read provider secret securely.

Call the appropriate provider adapter.

Save the provider job ID.

Return a safe response to the frontend.

Create another Edge Function:

check-video-status

This function should:

Receive generation ID.

Read provider job ID.

Securely call the provider API.

Update generation status.

Save generated video URL when complete.

Return current status.

Prepare the architecture for future integrations.

Example providers:

Provider A

Provider B

Provider C

Do not claim an AI provider API is available unless the integration credentials and API access are actually configured.

If no provider API is configured:

Show the provider as:

"Coming Soon"

or

"API Not Connected"

Do not fake video generation.

==================================================
VIDEO GENERATION HISTORY

Create a generation history section.

For users:

Show only their own video generations.

For admins:

Show all generations.

Display:

Prompt

Provider

Status

Created date

Generated video

Error message if failed

Use Supabase Row Level Security so users cannot access other users' generation records.

==================================================
SEARCH

Create a full search system.

Search across:

Prompt titles

Tutorial titles

Descriptions

Categories

AI tools

Keywords

Create route:

/search?q=

Display:

Prompts

Tutorials

Categories

Add filters:

Content Type

Category

AI Tool

Difficulty

Latest

Popular

==================================================
ADMIN DASHBOARD

Route:

/admin

IMPORTANT:

Do not link this page anywhere publicly.

Dashboard should include:

Total Posts

Total Prompts

Total Categories

Total Media

Total Video Generations

Recent Posts

Recent Generations

Quick Actions:

Create New Post

Create New Prompt

Upload Media

==================================================
CREATE NEW POST PAGE

Route:

/admin/posts/new

Create a professional content editor.

Fields:

Title

Slug

Short Description

Category

Content Type

Featured Image

Featured Video

Full Content

AI Tools Used

Status

Featured Toggle

Published Date

Create a rich content editor.

Allow adding sections.

Allow adding prompt boxes.

Allow adding:

Image Prompt

Video Prompt

Negative Prompt

Allow adding:

Step-by-step instructions.

Each step can include:

Title

Description

Image

Video

Buttons:

Save Draft

Preview

Publish

When Publish is clicked:

Save to Supabase.

Set status to published.

Set published_at timestamp.

==================================================
EDIT POST

Route:

/admin/posts/:id/edit

Allow admins to:

Edit content

Replace images

Replace videos

Update prompts

Update categories

Change status

Save draft

Publish

Delete post with confirmation

==================================================
CREATE PROMPT

Create an admin prompt creation form.

Fields:

Title

Slug

Short description

Prompt type

Category

AI tools

Image prompt

Video prompt

Negative prompt

Difficulty

Estimated creation time

Featured image

Example video

Featured toggle

Status

Step-by-step instructions

Allow admin to save as draft or publish.

==================================================
ROW LEVEL SECURITY

Enable RLS on all sensitive tables.

Rules:

profiles:

Users can view and update only their own profile.

Admins can manage all profiles where necessary.

posts:

Public users can only read published posts.

Admins can create, update and delete.

prompts:

Public users can only read published prompts.

Admins can create, update and delete.

categories:

Public can read.

Admins can manage.

media:

Admins can manage.

Public access only to intended public media.

video_generations:

Users can only access their own generations.

Admins can access all.

==================================================
UI REQUIREMENTS

Create:

Responsive desktop UI

Tablet UI

Mobile UI

Loading states

Skeleton loaders

Empty states

Error states

Success notifications

Confirmation dialogs

Form validation

Professional toast notifications

==================================================
SEO

For every public page generate:

SEO title

Meta description

Open Graph image

Canonical-friendly URL structure

Dynamic page metadata where supported.

Use clean readable URLs.

==================================================
SAMPLE CONTENT

Create sample database content for at least:

12 prompts

8 tutorials

10 categories

Example prompt categories:

Cinematic AI Video

AI Birthday Video

AI Wedding Video

AI Character Creation

AI Story Video

AI Product Advertisement

Instagram AI Reel

Travel Cinematic Video

AI Cartoon Story

Logo Animation

==================================================
FINAL REQUIREMENTS

Build the complete frontend and backend integration.

Do not create fake static data as the final production architecture.

Connect public content pages to Supabase.

Connect admin content creation pages to Supabase.

Connect authentication to Supabase.

Use Supabase Storage for media.

Use Supabase Edge Functions for secure AI API integrations.

Use Row Level Security.

Do not expose API keys.

The admin route must remain hidden from all public navigation.

The website should look premium, modern and production-ready.

Make the code modular and scalable.

Build reusable components.

Make it easy to add future AI providers without redesigning the frontend.

First establish the Supabase schema and authentication architecture, then connect the UI components to real Supabase data.

Do not remove existing functionality unless necessary.

Preserve the public content-focused concept while upgrading the website into a complete AI Prompt + AI Video Creation platform.

dont use lot of images just use little bit imag and use those replty so it will use less points to complete the website with super base ok make it proeplry and upfate it ok

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4720267f-a0f4-4871-963d-7593ded9b0e6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
