# 🐱 Memomiau

Eine moderne Lernkarten-Webanwendung mit AI-Unterstützung – spielerisch lernen mit einer motivierenden Katzen-KI und Community-Features.

<img width="1240" height="764" alt="memomiau_start" src="https://github.com/user-attachments/assets/13220609-560a-49c1-b82a-691dafbb5c39" />


#### 🔗 [MemoMiau Live Demo](https://memomiau.netlify.app/)

---

## 📋 Über das Projekt

Memomiau ist eine Flashcard-Webapp für Desktop und Mobile, die das Lernen mit einem verspielten, katzenthematischen Ansatz neu interpretiert. Mit Unterstützung der sympathischen und motivierenden MemoMiau-KI können Nutzer eigene Lerndecks erstellen, Karten lernen, öffentliche Community-Decks durchsuchen und ihre Fortschritte in einem Achievement-System verfolgen.

Die Besonderheit: Neben Dark- und Light-Mode gibt es einen besonderen Cat-Mode mit integriertem Minigame – für wahre Katzenliebhaber. Unser Übungsprojekt wurde mit Next.js, TypeScript und Supabase entwickelt und bietet AI-gestützte Kartengenerierung und ein durchdachtes Lernstatus-System mit personalisierten Wiederholungszyklen.

---

## 🛠️ Technologien

- **Next.js** - App Router mit React für moderne SSR/CSR
- **TypeScript** - Typsichere Entwicklung
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Utility-First CSS Framework
- **Lucide React** - Icon-Bibliothek
- **AI SDK React** - LLM-Integration für Chat und Kartengenerierung
- **XYFlow React** - Visuelle AI-Workflows

---

## ✨ Features

### Lernkarten-System
- ✅ **Decks erstellen** - Eigene Lerndecks mit Name und Beschreibung
- ✅ **Flashcards** - Vorder- und Rückseite, optionale Bilder
- ✅ **Lernstatus-Tracking** - Personalisierte Wiederholungslogik
- ✅ **AI-Kartengenerierung** - Automatische Erstellung von Karten über KI
- ✅ **PDF-Import** - Upload von PDFs mit AI-gestützter Flashcard-Extraktion

### Community & Sharing
- ✅ **Community-Decks** - Öffentliche Decks durchsuchen und kopieren
- ✅ **Public/Private Toggle** - Decks öffentlich oder privat teilen
- ✅ **Deck-Kopieren** - Community-Decks ins eigene Dashboard hinzufügen

### Gamification
- ✅ **Achievement-System** - Tracking von gelernten Karten, Streaks, erstellten Decks
- ✅ **Cat-Mode** - Beosnderer Modus mit integriertem Minigame
- ✅ **Cartoon-Avatare** - 8 vorgegebene Katzen-Profilbilder zur Auswahl

### AI-Integration
- ✅ **MemoMiau-KI** - Sympathischer AI-Chatbot als Lernbegleiter
- ✅ **Multi-Provider-Support** - OpenAI, Anthropic, Google Vertex, Hugging Face, GitHub Copilot
- ✅ **AI-Chat-UI** - Conversation-Komponenten mit Reasoning und Chain-of-Thought
- ✅ **Chatbot FAB** - Floating Action Button für schnellen AI-Zugriff

### Design & UX
- ✅ **Dark/Light/Cat-Mode** - Drei Theme-Varianten
- ✅ **Mobile-First** - Responsive Design für alle Geräte
- ✅ **Custom UI-Primitives** - Konsistente Design-Komponenten

---

## 📚 Was wir gelernt haben

- **Next.js App Router**: Moderne File-based Routing mit Server/Client Components
- **Supabase Integration**: Auth (Email/Password + Google OAuth), PostgreSQL, Storage und Row Level Security
- **Typisierte Datenbank**: `database.types.ts` für vollständige TypeScript-Typsicherheit bei DB-Calls
- **AI-Integration**: Multi-Provider LLM-Setup mit Model-Selector und Chat-UI
- **Variable Fonts**: `font-variation-settings` für präzise Font-Gewichte (z.B. h1 = 800)
- **Custom CSS Utilities**: `.heading-outline` mit Cross-Browser-Fallbacks
- **Lernstatus-System**: Personalisierte Card-Wiederholung mit weight-basierter Logik
- **Realtime-Features**: Quiz-Mode mit Supabase Realtime für Multiplayer-Synchronisation

---

## 📸 Screenshots

### Dashboard mit Decks
<img width="1240" height="721" alt="memomiau_dashboard" src="https://github.com/user-attachments/assets/a3799dbb-4e69-4222-a74c-a42a51c5402e" />

### Responsive Design
<img width="1240" height="764" alt="memomiau_tablet" src="https://github.com/user-attachments/assets/0e7fb861-e1dd-4a5e-98c0-841264d661ff" />
<img width="1240" height="658" alt="memomiau_mobile" src="https://github.com/user-attachments/assets/e0364b1d-452e-41bf-b9fd-a63414f67c93" />

---

## 🗄️ Datenbank-Aufbau
- **Row Level Security (RLS)**: Nutzer sehen nur eigene Decks/Status, öffentliche Decks für alle lesbar
- **Typisierung**: `database.types.ts` generiert TypeScript-Typen für alle Tabellen
- **Auth**: Supabase Auth mit Email/Password
- **Lernstatus**: Separate Tabelle für User-spezifischen Fortschritt

---

## 🤖 AI-Features

### Unterstützte Provider
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google Vertex AI
- Hugging Face
- GitHub Copilot

### AI-Komponenten
- **Chatbot Modal**: Floating Action Button + Modal für AI-Chat
- **Conversation UI**: Message-Komponenten mit Reasoning-Display
- **AI-Generate**: Automatische Kartenerstellung aus Prompts

### API-Routes
- `/api/chat` - Chat-Requests an LLM-Provider
- `/api/flashcards` - AI-Kartengenerierung
- `/api/topics` - Topic-Extraktion für Quiz

---

## 🧩 Mögliche Erweiterungen

- [ ] **PDF-Import** - Upload von PDFs mit AI-gestützter Flashcard-Extraktion
- [ ] **Quiz-Mode** - Realtime-Multiplayer-Quiz gegen andere Nutzer
- [ ] **Spaced Repetition Algorithm** - Optimierte Wiederholungszyklen (z.B. SM-2)
- [ ] **Mobile App** - React Native Version
