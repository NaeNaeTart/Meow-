# Meow! Discord Bot 🐾

A simple Discord bot built with `discord.js`.

## Setup

1.  **Clone/Open the project**: You're already here!
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    - Rename `.env.example` to `.env`.
    - Fill in your `DISCORD_TOKEN`. You can get this from the [Discord Developer Portal](https://discord.com/developers/applications).
4.  **Invite the bot**:
    - Go to the Discord Developer Portal.
    - Create an application.
    - Go to the **Bot** tab and click **Reset Token** to get your token.
    - Under **Privileged Gateway Intents**, enable **Presence Intent**, **Server Members Intent**, and **Message Content Intent**.
    - Go to **OAuth2** -> **URL Generator**.
    - Select `bot` and `applications.commands`.
    - Select the permissions you need (e.g., `Send Messages`, `Read Message History`).
    - Copy the generated URL and paste it into your browser to invite the bot to your server.

## Running the bot

- **Development mode** (with auto-restart):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

## Features

- Responds to `ping` with `Pong!`.
- Responds to `meow` with `Meow! 🐾`.
