# Eaglercraft Launcher

A web-based launcher for playing Eaglercraft in your browser. Comes pre-loaded with 15 clients and 52 servers.

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher

### Installation

```bash
npm install
```

### Running

```bash
npm start
```

The launcher will be available at http://localhost:3000

## Features

- **Home** - Dashboard with featured servers, stats, and recent activity
- **Clients** - 15 pre-loaded Eaglercraft clients (1.8.8, 1.12.2, 1.5.2, Beta, Indev) with search and filters
- **Server Browser** - 52 pre-loaded multiplayer servers (Survival, PvP, SMP, Anarchy, Lifesteal, etc.)
- **Quick Play** - Select a client and server to jump straight in
- **Favorites** - Save your favorite clients and servers
- **Custom** - Add your own clients and servers

## Pre-loaded Clients

| Client | Version | Type |
|--------|---------|------|
| EaglercraftX 1.8.8 | 1.8.8 | JS |
| EaglercraftX 1.8.8 WASM | 1.8.8 | WASM |
| EaglercraftX 1.12.2 | 1.12.2 | JS |
| EaglercraftX 1.12.2 WASM | 1.12.2 | WASM |
| EaglercraftX 1.5.2 | 1.5.2 | JS |
| PixelClient 1.12 | 1.12.2 | JS |
| AstraClient 1.8 | 1.8.8 | JS |
| AstraClient 1.8 WASM | 1.8.8 | WASM |
| Shadow Client 1.8 | 1.8.8 | JS |
| Resent Client 4.0 | 1.8.8 | JS |
| Precision Beta | 1.5.2 | JS |
| Precision Beta 2 | 1.5.2 | JS |
| EaglercraftX 1.5.2 WASM | 1.5.2 | WASM |
| Eaglercraft Beta 1.3 | Beta 1.3 | JS |
| Eaglercraft Indev | Indev | JS |

## Server List (52 servers)

Includes KrypticMC, Pixel Craft, Voidsent MC, Archyverse, BagelSMP, Clever Teaching, HeartSMP, WanderwoodSMP, WebMC, and 43 more across Survival, PvP, SMP, Anarchy, Lifesteal, Minigames, OneBlock, and Network game modes.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Add custom client |
| DELETE | `/api/clients/:id` | Delete custom client |
| GET | `/api/servers` | List all servers |
| POST | `/api/servers` | Add custom server |
| DELETE | `/api/servers/:id` | Delete custom server |
| POST | `/api/favorites` | Toggle favorite |
| GET | `/api/activity` | Get activity log |
| GET | `/api/stats` | Get stats |

## Data

All custom data stored in `data/`:
- `custom_clients.json` - User-added clients
- `custom_servers.json` - User-added servers
- `favorites.json` - Favorites
- `activity.json` - Activity log
