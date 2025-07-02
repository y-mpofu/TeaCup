# TeaCup-WebApp

# TeaCup – AI-Powered News Agent for the Global South

**TeaCup** is a personalized, AI-powered news platform designed for developing countries (Zimbabwe for now) where access to reliable and credible news is limited. It delivers high-quality news on politics, weather, crime, sports, and more—summarized, narrated, and tailored to the user.

---

## Project Vision

To empower communities in the Global South with **authentic, localized, and accessible news**, using natural language processing, text-to-speech, and smart curation.

---

## Tech Stack

### Frontend

- **React** (JavaScript, HTML, CSS)
- Optional: TailwindCSS / Material UI for styling

### Backend

- **FastAPI** (Python)
- **Firebase** (Authentication & Realtime Database)

### AI & Data Pipeline

- **GPT-3.5 Turbo**: Summarization & keyword extraction
- **Google/Bing News API**: Real-time news fetching
- **BeautifulSoup**: News scraping from local sources
- (Optional) **TTS API**: ElevenLabs / Google TTS / Coqui

---

## Core Features

- **Smart News Curation**:

  - By location and interest
  - Includes “must-know” daily briefings

- **AI-Powered Narration**:
- Multilingual news podcast output (English, Shona, Ndebele)

- **Fake News Detection**:
- Early version flags low-reputation sources

- **News Categories**:
- Politics, Weather, Crime, Sports, Local Trends, Health

---

## MVP Goals

- [ ] Build initial web scraper (BeautifulSoup)
- [ ] Integrate GPT-3.5 summarization
- [ ] Design basic React UI
- [ ] Add Firebase auth
- [ ] Add TTS narration
- [ ] Basic personalization (category-based)
- [ ] Fake news warning (rule-based)

---

## Folder Structure (Planned)


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
