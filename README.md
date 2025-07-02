# TeaCup
**High Quality Tea Served Hot**

TeaCup is your personal AI-powered news companion that serves up the hottest, most relevant news stories tailored just for you. Like a perfectly brewed cup of tea, we deliver news that's fresh, warming, and exactly what you need to start your day right.

*Currently steeping in Zimbabwe, expanding globally.*

---

## Why TeaCup?

Just like tea brings people together and energizes communities, TeaCup connects you to the stories that matter most. We believe everyone deserves access to reliable, engaging news that fits their taste - whether you prefer it strong and bold or light and informative.

**Our Promise**: No bitter aftertaste from fake news, just pure, authentic stories served at the perfect temperature.

---

## What's Brewing

### **Smart News Curation**
- Location-based stories that matter to your community
- Personalized by your interests and reading habits
- Daily "Morning Brew" - essential news to start your day

### **AI-Powered Audio Experience**
- News narrated in multiple languages (English, Shona, Ndebele)
- Podcast-style delivery perfect for your commute
- Adjustable pace and tone preferences

### **Trust & Authenticity**
- Built-in source verification
- Clear flagging of questionable content
- Transparency about news origins

### **Categories We Serve**
- **Politics** - The decisions shaping your world
- **Weather** - Stay prepared, stay safe
- **Community** - Local stories that connect us
- **Sports** - Victories and highlights
- **Health** - Wellness tips and updates
- **Trends** - What's buzzing in your area

---

## The Tech Behind Your Cup

### Frontend (The Beautiful Interface)
```
React with TypeScript - Modern, fast, reliable
TailwindCSS - Clean, responsive design
```
*Think of this as your tea cup - elegant, functional, comfortable to hold*

### Backend (The Brewing Process)
```
FastAPI (Python) - Handles all the heavy lifting
Firebase - Secure user accounts and real-time updates
```
*This is our tea kettle - powerful, efficient, always ready*

### AI Engine (The Tea Master)
```
GPT-3.5 Turbo - Intelligent summarization and insights
Google/Bing News APIs - Fresh content from reliable sources
BeautifulSoup - Local news harvesting
Text-to-Speech - Multiple provider options for quality audio
```
*Our master tea blender - knows exactly how to mix the perfect cup*

---

## Brewing Schedule (Development Roadmap)

### First Steep (MVP)
- [ ] **News Harvesting System** - Web scraping for local sources
- [ ] **AI Summarization** - GPT integration for story condensing
- [ ] **User Interface** - Clean, intuitive React frontend
- [ ] **User Accounts** - Firebase authentication system
- [ ] **Audio Narration** - Text-to-speech implementation
- [ ] **Basic Personalization** - Category-based preferences
- [ ] **Source Verification** - Basic credibility checking

### Full Roast (Future Features)
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

## Getting Started (Setting Up Your Tea Station)

### Prerequisites
- Node.js 18+ (for the frontend)
- Python 3.9+ (for the backend)
- A good internet connection (for fresh news)

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/teacup

# Install frontend dependencies
cd teacup/frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Start brewing (development mode)
npm run dev  # Frontend
python main.py  # Backend
```

---

## Contributing to TeaCup

We welcome contributors who share our passion for accessible, reliable news! Whether you're fixing bugs, adding features, or improving documentation - every contribution helps brew a better experience.

**How to Contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Technical Configuration

This project uses **React + TypeScript + Vite** for lightning-fast development and optimal performance.

### Available Vite Plugins
- `@vitejs/plugin-react` - Uses Babel for Fast Refresh
- `@vitejs/plugin-react-swc` - Uses SWC for even faster refresh

### ESLint Configuration for Production
For production
