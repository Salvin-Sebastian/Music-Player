Building a Pixel-Perfect Spotify Clone with AI: My Journey Using Cursor

In the era of AI-assisted development, building a functional, beautiful web application is faster than ever. For my latest project, I set out to build a Spotify clone using HTML, CSS, JavaScript, and external APIs — all generated entirely through AI prompts using Cursor. No manual coding allowed!

Here is a look at the prompts I used, the challenges I faced, and what I learned along the way.

The Prompts I Used

To stick to the requirement of "no manual coding," I carefully structured my prompts to guide the AI from a basic wireframe to a polished, bug-free application.

Prompt 1: Setting the Baseline
"make the ui same identical no need to work properly but i need the better ui"

Initially, I wanted to see how creative the AI could get. It generated a stunning 'glassmorphism' UI with purple and indigo gradients. While beautiful, it wasn't strictly a Spotify clone.

Prompt 2: Enforcing Strict Design Accuracy
"Requirements: Use Cursor to generate all code via AI prompts (no manual coding). Replicate the chosen website’s layout, style, and design accuracy. Ensure the page is responsive across devices. Target website: Spotify."

This prompt reigned the AI in. It immediately stripped away the custom gradients and implemented Spotify's exact design system: dark backgrounds, the signature green, rounded floating panels, and a responsive mobile layout.

Prompt 3: The Finishing Touches
"add the logo in the spotify to the tab also"

A simple prompt to add the official Spotify favicon to the browser tab for that authentic feel.

Prompt 4: Squashing Bugs
"Mixed Content: The page at [URL] was loaded over HTTPS, but requested an insecure element... Failed to load resource: net::ERR_NAME_NOT_RESOLVED... CORS policy: No 'Access-Control-Allow-Origin' header..."

When I deployed the site, external APIs started breaking. I fed the exact browser console errors into Cursor to have it debug the network issues.

Prompt 5: Dynamic UI Updates
"Also can fix the home page that show the images of the songs card"

The initial home page was a static placeholder. This prompt instructed the AI to fetch real "Top Hits" and render them in a responsive CSS grid, complete with cover art and hover-to-play buttons.

What I Learned and Tweaked

Building an app entirely through AI prompts forces you to become more of an architect and less of a typist. Here are the biggest technical takeaways and tweaks we made:

1. The Realities of CORS and Proxies
When fetching data from the iTunes Search API, the AI initially used a free CORS proxy (allorigins.win). However, free proxies are notoriously unreliable and frequently rate-limit requests, causing our app to crash. 
The Tweak: I learned that the iTunes Search API actually supports native cross-origin requests. We tweaked the JavaScript to bypass the proxy entirely and hit the iTunes API directly, resulting in a much faster and more reliable fetch.

2. Slaying the "Mixed Content" Dragon
Our live radio feature pulled data from a public Radio API. Unfortunately, many of the radio station thumbnails were served over HTTP. Because our site was hosted on HTTPS, the browser blocked the images, throwing "Mixed Content" errors. 
The Tweak: Instead of writing complex regex to rewrite URLs in JavaScript, we used a powerful HTML meta tag: "upgrade-insecure-requests". This single line of code forced the browser to automatically upgrade all HTTP requests to HTTPS, instantly fixing the broken images.

3. CSS Grid & Micro-Animations
To nail the "Spotify feel," layout isn't enough — interaction matters. We spent time tweaking the CSS to include micro-animations. By utilizing CSS Grid for the home page cards, and adding subtle transitions on hover, we successfully recreated the iconic green play button that slides up over the album art.

Conclusion
Building a Spotify clone without typing a single line of code is an incredible exercise in prompt engineering. It teaches you that AI is a powerful pair-programmer, but you still need to understand architecture, network protocols (like CORS), and design systems to guide it to the finish line.
