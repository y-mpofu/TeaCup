# TeaCup
**High Quality Tea Served Hot**

TeaCup is your personal AI-powered news companion that serves up the hottest, most relevant news stories tailored just for you. Like a perfectly brewed cup of tea, we deliver news that's fresh, warming, and exactly what you need to start your day right.

*Currently steeping in Zimbabwe, expanding globally.*

---

## Why TeaCup?

TeaCup was born from observing how difficult it is, particularly in parts of Southern Africa, for people to easily access reliable, up-to-date, and locally relevant news. In many of these areas, news ecosystems are algorithmically skewed and poorly structured. This leaves communities disconnected from information that directly impacts their daily lives. And leaves people getting their news from things like unverified posts by people on social media. TeaCup is my direct response to that reality—a platform designed to make personalized, quality news accessible, engaging,  and impactful using artificial intelligence and a thoughtfully engineered system.

**Our Promise**: To bring verified, real-time stories to your doorstep.

---

### **Smart News Curation**
- Location-based stories that matter to your community
- Personalized by your interests and reading habits
- "Daily spills" - essential news to start your day

### **AI-Powered Audio Experience**
- News narrated in the English language
- Podcast-style discussion option on your story of choice, perfect for your commute

### **Trust & Authenticity**
- Built-in source verification
- Clear flagging of questionable content
- Transparency about news origins
- Fake-News predictor, to predict false rumours that may come up for chosen news stories, and verification as to why that would be fake

### **Categories We Serve**
- **Politics** - The decisions shaping your world
- **Weather** - Stay prepared, stay safe
- **Community** - Local stories that connect us
- **Sports** - Victories and highlights
- **Health** - Wellness tips and updates
- **Trends** - What's buzzing in your area

---

## The Tech Behind the Cup

### Frontend (The Beautiful Interface)
```
React with TypeScript - Modern, fast, reliable
TailwindCSS - Clean, responsive design
```

### Backend (The Brewing Process)
```
FastAPI (Python) - Handles all the heavy lifting
Firebase - Secure user accounts and real-time updates
```
*This is our tea kettle - powerful, efficient, always ready*

### AI Engine (The Tea Master)
```
GPT-3.5 Turbo - Intelligent summarization and insights, and text to speech
Google/Bing News APIs - Fresh content from reliable sources
BeautifulSoup - Local news harvesting

```

---

## Development Roadmap

### First version (MVP)
- [ ] **News Harvesting System** - Web scraping for local sources
- [ ] **AI Summarization** - GPT integration for story condensing
- [ ] **User Interface** - Clean, intuitive React frontend
- [ ] **User Accounts** - Firebase authentication system
- [ ] **Audio Narration** - Text-to-speech implementation
- [ ] **Basic Personalization** - Category-based preferences
- [ ] **Source Verification** - Basic credibility checking

### Future Features
- Advanced AI personalization
- Community discussion features
- Offline reading capabilities
- Push notifications for breaking news
- Multi-device synchronization

---

## Project Structure

```
TeaCup/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main application screens
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API communication
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── backend/                 # FastAPI Python server
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data structures
│   │   └── utils/           # Helper functions
│   └── tests/               # Backend testing
└── docs/                    # Documentation and guides
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (for the frontend)
- Python 3.9+ (for the backend)
- A good internet connection (for fresh news)


## Technical Configuration

This project uses **React + TypeScript + Vite** for lightning-fast development and optimal performance.

### Available Vite Plugins
- `@vitejs/plugin-react` - Uses Babel for Fast Refresh
- `@vitejs/plugin-react-swc` - Uses SWC for even faster refresh

### ESLint Configuration for Production
For production
