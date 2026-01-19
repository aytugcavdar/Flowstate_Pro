<div align="center">

# 🌊 FlowState

### **Daily Logic Puzzle Game**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Connect the flow. Hack the system. Beat the daily puzzle.**

[🎮 Play Now](https://flowstate.app) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/yourusername/flowstate/issues)

![FlowState Demo](https://via.placeholder.com/800x400/0f172a/22d3ee?text=FlowState+Game+Demo)

</div>

---

## ✨ Features

### 🎮 Game Modes
- **Daily Challenge** - New puzzle every day, compete globally
- **Practice Mode** - Unlimited puzzles to sharpen skills
- **Campaign Mode** - 45+ levels with boss battles
- **Endless Mode** - How far can you go?

### 🏆 Progression System
- **XP & Leveling** - Gain experience and level up
- **Achievements** - 20+ badges to unlock
- **Daily Missions** - Complete tasks for bonus rewards
- **Streak System** - Keep your daily streak alive

### 💎 Premium Features
- **Power-ups** - Hints, Undo, Time Freeze
- **Themes** - Cyberpunk, Matrix, Neon, Retro
- **Shop System** - Spend coins on upgrades
- **Cloud Sync** - Progress saved across devices

### 🔧 Technical
- **PWA Support** - Install as native app
- **Offline Mode** - Play without internet
- **Multi-language** - English & Turkish
- **Haptic Feedback** - Tactile responses on mobile

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/flowstate.git
cd flowstate/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to play!

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, CSS Variables |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| State | React Hooks, LocalStorage |
| Audio | Web Audio API |
| PWA | Service Worker, Web Manifest |

---

## 📁 Project Structure

```
frontend/
├── components/        # React components
│   ├── Tile.tsx       # Game tile with SVG graphics
│   ├── Header.tsx     # Navigation & stats
│   ├── CampaignMenu.tsx
│   └── ...
├── services/          # Business logic
│   ├── levelGenerator.ts
│   ├── campaign.ts
│   ├── cloudSyncService.ts
│   └── ...
├── hooks/             # Custom React hooks
├── contexts/          # Theme, Auth contexts
├── database/          # SQL schemas
└── App.tsx            # Main application
```

---

## 🎯 Game Mechanics

### Tile Types
| Tile | Description |
|------|-------------|
| ⚡ Source | Generates flow (cyan/magenta) |
| □ Sink | Must receive both colors → white |
| ═ Straight | Connects two opposite sides |
| ∟ Elbow | 90-degree turn |
| ⊥ T-Junction | Three-way split |
| ╬ Cross | Four-way intersection |

### Win Condition
Connect **all sources** to the **sink** to combine flows into white light!

---

## 🗃️ Database Schema

```sql
-- Core tables
users, profiles, game_sessions, leaderboard

-- Progression
achievements, daily_missions, campaign_progress

-- Economy
transactions, inventory, purchases

-- Analytics
user_visits, game_events, ab_experiments
```

See [`/database/README.md`](frontend/database/README.md) for full schema.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/flowstate?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/flowstate?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/flowstate)
![GitHub license](https://img.shields.io/github/license/yourusername/flowstate)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ by [Your Name]**

[⬆ Back to top](#-flowstate)

</div>
