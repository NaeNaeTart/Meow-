# Meow! Discord Bot 🐾

A high-performance, feature-rich Discord bot built with `discord.js` v14, prioritizing non-blocking asynchronous operations and a premium user experience.
<a href="https://top.gg/bot/1497845203153977454">
  <img src="https://top.gg/api/widget/1497845203153977454.svg">
</a>

## 🚀 Core Features

### 💰 Economy & Games
- **Paws & Scratches:** Earn and spend virtual currency.
- **Games:** `/slots`, `/rps` (Rock Paper Scissors), and `/trivia`.
- **Social Economy:** `/daily`, `/work`, `/pay`, and `/rob` (risky but rewarding!).
- **Leaderboards:** Track the wealthiest users in the server.

### 🎭 Social & Fun
- **Interactions:** `/hug`, `/bite`, and `/boop` using a high-quality local image stash.
- **Animals:** `/axolotl` and `/dogfact` with smart fallback logic.
- **Avatars:** `/avatar-meow` to generate customized cat avatars.

### 🛠️ Utility & Tools
- **Image Compression:** `/compress` using the high-performance `sharp` library (supports resizing and format conversion).
- **Link Shortener:** `/shorten` with support for CleanURI, Is.gd, TinyURL, and Da.gd.
- **Dictionary:** `/dictionary` with both Standard and Urban Dictionary (slang) support.
- **Gaming:** `/freegame` to discover random free-to-play titles.

### 🛡️ Moderation & Management
- **Warning System:** `/warn` and `/warnhistory` for server moderation.
- **Voice Control:** `/vcmute`, `/vcunmute`, `/vcdeafen`, and `/vcundeafen` with persistent state tracking.
- **AFK System:** `/afk` to let others know when you're away.

### 🌐 Scratch API (Equicord)
- Built-in HTTP server (Port 2444) providing a public API for external plugins.
- Automatically creates a secure tunnel via `localtunnel` for remote access.

## 🏗️ Architecture

- **Centralized Database Manager (`db.js`):** Uses an in-memory cache and an asynchronous, queue-based disk writing system to eliminate event-loop blocking.
- **Modular Commands:** Cleanly organized into `fun`, `useful`, and `economy` categories.
- **Hybrid Deployment:** Supports both Global and Guild-specific command registration.

## ⚙️ Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure environment variables**:
    - Rename `.env.example` to `.env`.
    - Fill in your `DISCORD_TOKEN`.
3.  **Deploy Commands**:
    ```bash
    npm run deploy
    ```
4.  **Run the bot**:
    - **Development:** `npm run dev`
    - **Production:** `npm run start`

## 📦 Requirements
- Node.js 18.x or higher
- C++ Build Tools (for `canvas` and `sharp` binaries)

---
*Created with 🐾 by the Meow! Team.*
