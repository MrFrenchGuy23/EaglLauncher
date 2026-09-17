const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CLIENTS_DIR = path.join(DATA_DIR, 'clients');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(CLIENTS_DIR)) fs.mkdirSync(CLIENTS_DIR, { recursive: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const BUILT_IN_CLIENTS = [
  // === 1.8.8 OFFICIAL ===
  { id: 'ex-1.8.8', name: 'EaglercraftX 1.8.8', version: '1.8.8', type: 'js', category: 'official', description: 'The most stable and widely used Eaglercraft client. Works in all browsers.', author: 'lax1dude', url: 'https://g.deev.is/eaglercraft/', icon: 'pickaxe', builtIn: true, size: '8.2 MB' },
  { id: 'ex-1.8.8-wasm', name: 'EaglercraftX 1.8.8 WASM', version: '1.8.8', type: 'wasm', category: 'official', description: 'WebAssembly build — up to 50% faster. Chrome/Edge only.', author: 'lax1dude', url: 'https://g.deev.is/eaglercraft/', icon: 'pickaxe', builtIn: true, size: '8.6 MB' },

  // === 1.8.8 CUSTOM CLIENTS ===
  { id: 'astra-1.8', name: 'Astra Client 1.8', version: '1.8.8', type: 'js', category: 'custom', description: 'High-performance client with FPS optimizations and clean UI.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/AstraClient/index.html', icon: 'star', builtIn: true, size: '8.5 MB' },
  { id: 'astra-1.8-wasm', name: 'Astra Client 1.8 WASM', version: '1.8.8', type: 'wasm', category: 'custom', description: 'AstraClient with WebAssembly for maximum performance.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.8/AstraClient/index.html', icon: 'star', builtIn: true, size: '8.9 MB' },
  { id: 'astra-1.6', name: 'Astra Client 1.6.0', version: '1.8.8', type: 'js', category: 'custom', description: 'Astra Client version 1.6.0 base build.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/AstraClient/index.html', icon: 'star', builtIn: true, size: '8.3 MB' },
  { id: 'shadow-1.8', name: 'Shadow Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Stealth-themed custom client with unique features and dark UI.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Shadow_Client_en_US.html', icon: 'shield', builtIn: true, size: '8.4 MB' },
  { id: 'shadow-v25', name: 'Shadow Client v2.5', version: '1.8.8', type: 'js', category: 'custom', description: 'Legacy Shadow Client v2.5 with classic features.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Shadow_Client_en_US.html', icon: 'shield', builtIn: true, size: '8.2 MB' },
  { id: 'shadow-v4', name: 'Shadow Client v4', version: '1.8.8', type: 'js', category: 'custom', description: 'Latest Shadow Client v4 with enhanced stealth features.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Shadow_Client_en_US.html', icon: 'shield', builtIn: true, size: '8.6 MB' },
  { id: 'resent-4.0', name: 'Resent Client 4.0', version: '1.8.8', type: 'js', category: 'custom', description: 'Feature-rich competitive client. Polished and actively used.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/resent4.0/index.html', icon: 'bolt', builtIn: true, size: '8.7 MB' },
  { id: 'resent-5.0', name: 'Resent Client 5.0', version: '1.8.8', type: 'js', category: 'custom', description: 'Latest Resent with modded features, hacks, and utilities.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/resent4.0/index.html', icon: 'bolt', builtIn: true, size: '9.0 MB' },
  { id: 'resent-5.0-wasm', name: 'Resent Client 5.0 WASM', version: '1.8.8', type: 'wasm', category: 'custom', description: 'Resent 5.0 WebAssembly build for speed.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.8/resent4.0/index.html', icon: 'bolt', builtIn: true, size: '9.3 MB' },
  { id: 'dragonx-v2', name: 'DragonX V2', version: '1.8.8', type: 'js', category: 'custom', description: 'International DragonX client v2. Clean PvP-focused design.', author: 'Community', url: 'https://burnedpopcorn.github.io/DragonX_V2_International.html', icon: 'fire', builtIn: true, size: '8.4 MB' },
  { id: 'dragonx-v3', name: 'DragonX V3', version: '1.8.8', type: 'js', category: 'custom', description: 'DragonX V3 with improved performance and new features.', author: 'Community', url: 'https://burnedpopcorn.github.io/DragonX_V2_International.html', icon: 'fire', builtIn: true, size: '8.6 MB' },
  { id: 'dragonx-v4', name: 'DragonX V4', version: '1.8.8', type: 'js', category: 'custom', description: 'DragonX V4 — latest iteration with full mod support.', author: 'Community', url: 'https://burnedpopcorn.github.io/DragonX_V2_International.html', icon: 'fire', builtIn: true, size: '8.8 MB' },
  { id: 'dragonx-v5', name: 'DragonX V5 Beta', version: '1.8.8', type: 'js', category: 'custom', description: 'DragonX V5 beta — newest experimental build.', author: 'Community', url: 'https://burnedpopcorn.github.io/DragonX_V2_International.html', icon: 'fire', builtIn: true, size: '9.0 MB' },
  { id: 'dragonx-lite', name: 'DragonX Lite', version: '1.8.8', type: 'js', category: 'custom', description: 'Lightweight DragonX for low-end devices.', author: 'Community', url: 'https://burnedpopcorn.github.io/DragonX_V2_International.html', icon: 'fire', builtIn: true, size: '6.2 MB' },
  { id: 'reborn', name: 'Eagler Reborn', version: '1.8.8', type: 'js', category: 'custom', description: 'Reborn client — refreshed classic with modern touches.', author: 'Community', url: 'https://github.com/SpeedSlicer/Eclipse-Launcher/raw/main/versions/reborn/index.html', icon: 'crystal', builtIn: true, size: '8.1 MB' },
  { id: 'pi-client', name: 'Pi Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Minimalist Pi-themed client with clean interface.', author: 'Community', url: 'https://burnedpopcorn.github.io/PiClient-v1%20(1).1-20230123-intl.html', icon: 'puzzle', builtIn: true, size: '7.8 MB' },
  { id: 'kone', name: 'Kone Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Clean UI client popular in the community.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'target', builtIn: true, size: '8.0 MB' },
  { id: 'uwu-v1', name: 'UwU Client v1', version: '1.8.8', type: 'js', category: 'custom', description: 'Anime-themed UwU client. Distinctive style.', author: 'Community', url: 'https://mendbp.itch.io/eaglercraft-uwuclient', icon: 'star', builtIn: true, size: '8.2 MB' },
  { id: 'uwu-v2', name: 'UwU Client Beta v2', version: '1.8.8', type: 'js', category: 'custom', description: 'Updated UwU client with beta features.', author: 'Community', url: 'https://mendbp.itch.io/eaglercraft-uwuclient', icon: 'star', builtIn: true, size: '8.4 MB' },
  { id: 'uwu-lite', name: 'UwU Lite v2', version: '1.8.8', type: 'js', category: 'custom', description: 'Lightweight UwU client for better performance.', author: 'Community', url: 'https://mendbp.itch.io/eaglercraft-uwuclient', icon: 'star', builtIn: true, size: '6.5 MB' },
  { id: 'n0va', name: 'N0VA Client', version: '1.8.8', type: 'js', category: 'custom', description: 'N0VA client with combat and utility features.', author: 'Community', url: 'https://burnedpopcorn.github.io/N0VA_CLIENT.html', icon: 'sword', builtIn: true, size: '8.3 MB' },
  { id: 'kerosene', name: 'Kerosene Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Kerosene — smooth client with unique aesthetic.', author: 'Community', url: 'https://burnedpopcorn.github.io/Kerosene_Client.html', icon: 'fire', builtIn: true, size: '8.1 MB' },
  { id: 'solar', name: 'Solar Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Solar 3.5 — bright-themed client with FPS boost.', author: 'Community', url: 'https://burnedpopcorn.github.io/Solar_3.5.html', icon: 'star', builtIn: true, size: '8.0 MB' },
  { id: 'oddfuture', name: 'OddFuture Client', version: '1.8.8', type: 'js', category: 'custom', description: 'OddFuture — unique community client.', author: 'Community', url: 'https://burnedpopcorn.github.io/OddFuture_Client.html', icon: 'gem', builtIn: true, size: '7.9 MB' },
  { id: 'nebula', name: 'Nebula Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Nebula — space-themed client with combat features.', author: 'Community', url: 'https://burnedpopcorn.github.io/Nebula.html', icon: 'ender', builtIn: true, size: '8.2 MB' },
  { id: 'nit', name: 'NitClient', version: '1.8.8', type: 'js', category: 'custom', description: 'NitClient — fast and lightweight.', author: 'Community', url: 'https://burnedpopcorn.github.io/NitClient.html', icon: 'bolt', builtIn: true, size: '7.5 MB' },
  { id: 'nit-2.0', name: 'NitClient 2.0', version: '1.8.8', type: 'js', category: 'custom', description: 'NitClient 2.0 — improved version with more features.', author: 'Community', url: 'https://burnedpopcorn.github.io/NitClient.html', icon: 'bolt', builtIn: true, size: '7.8 MB' },
  { id: 'mega', name: 'Mega Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Mega — feature-packed client.', author: 'Community', url: 'https://selenite.is-a.dev/semag/mega/index.html', icon: 'crown', builtIn: true, size: '8.5 MB' },
  { id: 'demon', name: 'Demon Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Demon — dark themed hacked client.', author: 'Community', url: 'https://selenite.is-a.dev/semag/demon/index.html', icon: 'skull', builtIn: true, size: '8.3 MB' },
  { id: 'moonlight', name: 'MoonLight Client', version: '1.8.8', type: 'js', category: 'custom', description: 'MoonLight — elegant client with smooth performance.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'star', builtIn: true, size: '8.0 MB' },
  { id: 'meteor', name: 'Meteor Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Meteor — utility and hack client.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'bolt', builtIn: true, size: '8.4 MB' },
  { id: 'flame', name: 'FlameClient v3.7', version: '1.8.8', type: 'js', category: 'custom', description: 'FlameClient — fire-themed modded client.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'fire', builtIn: true, size: '8.6 MB' },
  { id: 'daniel', name: 'Daniel Client v1', version: '1.8.8', type: 'js', category: 'custom', description: 'Daniel Client — community-built client.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'puzzle', builtIn: true, size: '7.9 MB' },
  { id: 'justin', name: 'Justin Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Justin Client — hacked client with full features.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'skull', builtIn: true, size: '8.5 MB' },
  { id: 'wurstx', name: 'WurstX Client Beta', version: '1.8.8', type: 'js', category: 'custom', description: 'WurstX — port of Wurst to Eaglercraft.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'skull', builtIn: true, size: '8.7 MB' },
  { id: 'archimedes', name: 'Archimedes Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Archimedes — creative-focused client.', author: 'Community', url: 'https://archimedesclient.vercel.app/', icon: 'compass', builtIn: true, size: '8.1 MB' },
  { id: 'prism', name: 'Prism Client', version: '1.8.8', type: 'js', category: 'custom', description: 'Prism — colorful client with unique visuals.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/modded/1.8/prism-client.html', icon: 'gem', builtIn: true, size: '8.3 MB' },
  { id: 'eaglerforge', name: 'EaglerForge', version: '1.8.8', type: 'js', category: 'custom', description: 'EaglerForge — modding support for Eaglercraft. Forge mods in browser.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/modded/1.8/EaglerForge/index.html', icon: 'fire', builtIn: true, size: '9.2 MB' },
  { id: 'eaglymc-1.8', name: 'EaglyMC 1.8', version: '1.8.8', type: 'js', category: 'custom', description: 'EaglyMC client for 1.8 with modern features.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/modded/1.8/EaglyMC/index.html', icon: 'crown', builtIn: true, size: '8.8 MB' },
  { id: 'eaglymc-1.8-wasm', name: 'EaglyMC 1.8 WASM', version: '1.8.8', type: 'wasm', category: 'custom', description: 'EaglyMC 1.8 WebAssembly build.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/modded/wasm/1.8/EaglyMC/index.html', icon: 'crown', builtIn: true, size: '9.1 MB' },
  { id: 'shader-1.8', name: 'Shader Client 1.8', version: '1.8.8', type: 'js', category: 'custom', description: 'Shader-enabled client with enhanced visuals.', author: 'Community', url: 'https://hdun.org/mc/1.8.8_shaders/', icon: 'crystal', builtIn: true, size: '9.5 MB' },
  { id: 'pixel-1.8', name: 'PixelClient 1.8', version: '1.8.8', type: 'js', category: 'custom', description: 'PixelClient for 1.8.8 — low-end friendly with clean UI.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.8/Main/index.html', icon: 'gem', builtIn: true, size: '8.2 MB' },
  { id: 'pixel-1.8-wasm', name: 'PixelClient 1.8 WASM', version: '1.8.8', type: 'wasm', category: 'custom', description: 'PixelClient 1.8 WebAssembly build.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.8/Main/index.html', icon: 'gem', builtIn: true, size: '8.5 MB' },

  // === 1.5.2 CLIENTS ===
  { id: 'ex-1.5.2', name: 'EaglercraftX 1.5.2', version: '1.5.2', type: 'js', category: 'legacy', description: 'Original Feb 2022 build. Maximum compatibility.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/1.5.2/main/index.html', icon: 'axe', builtIn: true, size: '4.8 MB' },
  { id: 'ex-1.5.2-wasm', name: 'EaglercraftX 1.5.2 WASM', version: '1.5.2', type: 'wasm', category: 'legacy', description: 'WebAssembly build for 1.5.2. Chrome/Edge only.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.5.2/main/index.html', icon: 'axe', builtIn: true, size: '5.2 MB' },
  { id: 'precision-b1', name: 'Precision Beta', version: '1.5.2', type: 'js', category: 'legacy', description: 'Precision client for the legacy 1.5.2 version.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.5.2/PrecisionBeta.html', icon: 'target', builtIn: true, size: '4.9 MB' },
  { id: 'precision-b2', name: 'Precision Beta 2', version: '1.5.2', type: 'js', category: 'legacy', description: 'Updated Precision client with improvements.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.5.2/precisionbeta2/index.html', icon: 'target', builtIn: true, size: '5.0 MB' },
  { id: 'fuchsiax', name: 'FuchsiaX Client', version: '1.5.2', type: 'js', category: 'legacy', description: 'FuchsiaX — pink-themed 1.5.2 client.', author: 'Community', url: 'https://eagler.almondnet.cn/FuschiaX.html', icon: 'gem', builtIn: true, size: '4.7 MB' },
  { id: 'ayuncraft', name: 'Ayuncraft 1.5.2', version: '1.5.2', type: 'js', category: 'legacy', description: 'Ayuncraft — enhanced 1.5.2 with shader support.', author: 'Community', url: 'https://hdun.org/mc/1.5.2_ayuncraft/', icon: 'crystal', builtIn: true, size: '5.1 MB' },
  { id: 'codercraft', name: 'Codercraft', version: '1.5.2', type: 'js', category: 'legacy', description: 'Codercraft — developer-focused 1.5.2 client.', author: 'Community', url: 'https://selenite.is-a.dev/semag/codercraft/index.html', icon: 'puzzle', builtIn: true, size: '4.6 MB' },
  { id: 'water', name: 'Water Client', version: '1.5.2', type: 'js', category: 'legacy', description: 'Water — smooth flowing 1.5.2 client.', author: 'Community', url: 'https://selenite.is-a.dev/semag/water/index.html', icon: 'compass', builtIn: true, size: '4.5 MB' },
  { id: 'sp1', name: 'SP1 Client', version: '1.5.2', type: 'js', category: 'legacy', description: 'SP1 — fast 1.5.2 build.', author: 'Community', url: 'https://selenite.is-a.dev/semag/sp1/index.html', icon: 'bolt', builtIn: true, size: '4.4 MB' },
  { id: 'resent-1.5', name: 'Resent 1.5.2', version: '1.5.2', type: 'js', category: 'legacy', description: 'Resent Client ported to 1.5.2.', author: 'Community', url: 'https://asianf4rmer.vercel.app/1.5/index.html', icon: 'bolt', builtIn: true, size: '4.8 MB' },
  { id: 'oddfuture-1.5', name: 'OddFuture 1.5.2', version: '1.5.2', type: 'js', category: 'legacy', description: 'OddFuture ported to 1.5.2.', author: 'Community', url: 'https://burnedpopcorn.github.io/OddFuture_Client.html', icon: 'gem', builtIn: true, size: '4.7 MB' },
  { id: 'pi-1.5', name: 'Pi Client 1.5.2', version: '1.5.2', type: 'js', category: 'legacy', description: 'Pi Client for 1.5.2 legacy.', author: 'Community', url: 'https://burnedpopcorn.github.io/PiClient-v1%20(1).1-20230123-intl.html', icon: 'puzzle', builtIn: true, size: '4.5 MB' },
  { id: 'demo', name: 'MC Demo Client', version: '1.5.2', type: 'js', category: 'legacy', description: 'Minecraft Demo mode client.', author: 'Community', url: 'https://selenite.is-a.dev/semag/mcdemo/index.html', icon: 'clock', builtIn: true, size: '4.3 MB' },

  // === CLASSIC / OLD VERSIONS ===
  { id: 'ex-beta1.3', name: 'Eaglercraft Beta 1.3', version: 'Beta 1.3', type: 'js', category: 'classic', description: 'Classic Minecraft Beta 1.3 era client.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/b1.3/Main/index.html', icon: 'clock', builtIn: true, size: '3.2 MB' },
  { id: 'ex-indev', name: 'Eaglercraft Indev', version: 'Indev', type: 'js', category: 'classic', description: 'The earliest Minecraft Indev era client.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/infdev/Infdev-20100630-1.html', icon: 'clock', builtIn: true, size: '2.8 MB' },
  { id: 'ex-1.7.3', name: 'Beta 1.7.3 Client', version: 'Beta 1.7.3', type: 'js', category: 'classic', description: 'Minecraft Beta 1.7.3 — the golden era.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/1.7.3/Main/index.html', icon: 'clock', builtIn: true, size: '3.5 MB' },
  { id: 'ex-1.6.4', name: 'Release 1.6.4 Client', version: '1.6.4', type: 'js', category: 'classic', description: 'Minecraft 1.6.4 — the Horse Update.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/1.6.4/Main/index.html', icon: 'clock', builtIn: true, size: '3.8 MB' },
  { id: 'ex-1.2.6', name: 'Alpha 1.2.6 Client', version: 'Alpha 1.2.6', type: 'js', category: 'classic', description: 'Minecraft Alpha 1.2.6 — early survival.', author: 'lax1dude', url: 'https://client.eaglercraft.win/eagler-files/1.2.2/Main/index.html', icon: 'clock', builtIn: true, size: '3.0 MB' },
  { id: 'ex-1.0.3', name: 'Release 1.0.3 Client', version: '1.0.3', type: 'js', category: 'classic', description: 'Minecraft 1.0.3 — the very first release.', author: 'Community', url: 'https://github.com/daditto2012/eaglercraft-versions/raw/main/Minecraft%201.0.3.html', icon: 'clock', builtIn: true, size: '2.9 MB' },
  { id: 'bettereag', name: 'BetterEag', version: '1.8.8', type: 'js', category: 'custom', description: 'BetterEag — improved Eaglercraft base.', author: 'Community', url: 'https://raw.githubusercontent.com/SpeedSlicer/Eclipse-Launcher/main/versions/bettereag/index.html', icon: 'star', builtIn: true, size: '8.0 MB' },
  { id: 'eagler-1.9.4', name: 'Eaglercraft 1.9.4', version: '1.9.4', type: 'js', category: 'ported', description: 'Community port of Minecraft 1.9.4 Combat Update.', author: 'Community', url: 'https://raw.githubusercontent.com/SpeedSlicer/Eclipse-Launcher/main/versions/1.9.4/index.html', icon: 'sword', builtIn: true, size: '7.5 MB' }
];

const PORTED_CLIENTS = [
  // === 1.12.2 CLIENTS ===
  { id: 'ported-1.12.2', name: 'EaglercraftX 1.12.2', version: '1.12.2', type: 'js', category: 'ported', description: 'Full 1.12.2 port with Terracotta, new biomes, parrots, and modern features.', author: 'PeytonPlayz595', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'crystal', builtIn: true, size: '9.1 MB', mcVersion: '1.12.2', features: ['Terracotta', 'Parrots', 'Concrete', 'New Biomes'] },
  { id: 'ported-1.12.2-wasm', name: 'EaglercraftX 1.12.2 WASM', version: '1.12.2', type: 'wasm', category: 'ported', description: 'WebAssembly build for 1.12.2. Up to 50% faster.', author: 'PeytonPlayz595', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.12/Main/index.html', icon: 'crystal', builtIn: true, size: '9.4 MB', mcVersion: '1.12.2', features: ['WASM', 'Terracotta', 'Parrots'] },
  { id: 'ported-pixel-1.12', name: 'PixelClient 1.12.2', version: '1.12.2', type: 'js', category: 'ported', description: 'Enhanced 1.12.2 client with custom UI and FPS optimizations.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'gem', builtIn: true, size: '9.3 MB', mcVersion: '1.12.2', features: ['Custom UI', 'FPS Boost', 'Optimized'] },
  { id: 'ported-pixel-1.12-wasm', name: 'PixelClient 1.12.2 WASM', version: '1.12.2', type: 'wasm', category: 'ported', description: 'PixelClient WASM build for maximum 1.12.2 performance.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.12/Main/index.html', icon: 'gem', builtIn: true, size: '9.6 MB', mcVersion: '1.12.2', features: ['WASM', 'Custom UI', 'Fast'] },
  { id: 'ported-tuff-1.12', name: 'TuffClient 1.12.2', version: '1.12.2', type: 'js', category: 'ported', description: 'Community fork with modern 1.21-style feel built on 1.12.2.', author: 'Community', url: 'https://tuffc.speedslicer.dev/', icon: 'shield', builtIn: true, size: '9.5 MB', mcVersion: '1.12.2', features: ['Modern UI', '1.21 Feel', 'Polished'] },
  { id: 'ported-tuff-1.12-wasm', name: 'TuffClient 1.12.2 WASM', version: '1.12.2', type: 'wasm', category: 'ported', description: 'TuffClient WASM build. Modern look with WebAssembly speed.', author: 'Community', url: 'https://tuffc.speedslicer.dev/', icon: 'shield', builtIn: true, size: '9.8 MB', mcVersion: '1.12.2', features: ['WASM', 'Modern UI', 'Fast'] },
  { id: 'ported-tuff-beta', name: 'TuffClient Beta 1.1UT12', version: '1.12.2', type: 'js', category: 'ported', description: 'TuffClient early access beta build.', author: 'Community', url: 'https://tuffc.speedslicer.dev/', icon: 'shield', builtIn: true, size: '9.2 MB', mcVersion: '1.12.2', features: ['Beta', 'Early Access', 'Bleeding Edge'], experimental: true },
  { id: 'ported-tuff-beta-wasm', name: 'TuffClient Beta WASM', version: '1.12.2', type: 'wasm', category: 'ported', description: 'TuffClient beta WASM build.', author: 'Community', url: 'https://tuffc.speedslicer.dev/', icon: 'shield', builtIn: true, size: '9.5 MB', mcVersion: '1.12.2', features: ['WASM', 'Beta', 'Experimental'], experimental: true },
  { id: 'ported-resent-5-1.12', name: 'Resent Client 5.1', version: '1.12.2', type: 'js', category: 'ported', description: 'Resent Client 5.1 for 1.12.2. Feature-rich and actively developed.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'bolt', builtIn: true, size: '9.4 MB', mcVersion: '1.12.2', features: ['Active Dev', 'Feature-Rich', 'Competitive'] },
  { id: 'ported-resent-5-wasm', name: 'Resent Client 5.0 WASM', version: '1.12.2', type: 'wasm', category: 'ported', description: 'Resent 5.0 WASM for 1.12.2.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/wasm/1.12/Main/index.html', icon: 'bolt', builtIn: true, size: '9.7 MB', mcVersion: '1.12.2', features: ['WASM', 'Modded', 'Fast'] },
  { id: 'ported-starlike-1.12', name: 'Starlike Client 0.4.2', version: '1.12.2', type: 'js', category: 'ported', description: 'Starlike — distinctive community client for 1.12.2.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'star', builtIn: true, size: '9.2 MB', mcVersion: '1.12.2', features: ['Distinctive', 'Community', 'Polished'] },
  { id: 'ported-winston-1.12', name: 'Winston Horror Client', version: '1.12.2', type: 'js', category: 'ported', description: 'Horror-themed client with unique visual effects.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'skull', builtIn: true, size: '9.4 MB', mcVersion: '1.12.2', features: ['Horror Theme', 'Custom Effects', 'Unique UI'] },
  { id: 'ported-flaming-1.12', name: 'FlamingClient', version: '1.12.2', type: 'js', category: 'ported', description: 'Modded client with combat and utility enhancements.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'fire', builtIn: true, size: '9.6 MB', mcVersion: '1.12.2', features: ['Combat', 'Modded', 'Utilities'] },
  { id: 'ported-eb', name: 'Eb Client', version: '1.12.2', type: 'js', category: 'ported', description: 'Eb Client — bridging-focused client.', author: 'Community', url: 'http://client.eb-bridging.pro/', icon: 'sword', builtIn: true, size: '9.1 MB', mcVersion: '1.12.2', features: ['Bridging', 'PvP', 'Combat'] },
  { id: 'ported-modern', name: 'Modern Client', version: '1.12.2', type: 'js', category: 'ported', description: 'Modern Client — sleek design for 1.12.2.', author: 'Community', url: 'https://modernclient.online', icon: 'compass', builtIn: true, size: '9.3 MB', mcVersion: '1.12.2', features: ['Modern Design', 'Clean UI'] },
  { id: 'ported-shadownet', name: 'Shadow Net Client', version: '1.12.2', type: 'js', category: 'ported', description: 'ShadowNet — network-focused stealth client.', author: 'Community', url: 'https://shadownetwork.shop/launcher/', icon: 'shield', builtIn: true, size: '9.5 MB', mcVersion: '1.12.2', features: ['Network', 'Stealth', 'Enhanced'] },
  { id: 'ported-quantum', name: 'QuantumClient', version: '1.12.2', type: 'js', category: 'ported', description: 'QuantumClient — next-gen 1.12.2 client.', author: 'Community', url: 'https://client.eaglercraft.win/eagler-files/1.12/Main/index.html', icon: 'ender', builtIn: true, size: '9.4 MB', mcVersion: '1.12.2', features: ['Next-Gen', 'Performance', 'Advanced'] },

  // === 1.14 PORT ===
  { id: 'ported-1.14', name: 'Eaglercraft 1.14', version: '1.14', type: 'js', category: 'ported', description: 'Community port of Minecraft 1.14. Village & Pillage era.', author: 'Community', url: 'https://g.deev.is/eaglercraft/', icon: 'compass', builtIn: true, size: '10.2 MB', mcVersion: '1.14', features: ['Village & Pillage', 'New Trading', 'Foxes'] },

  // === 1.16.5 PORT ===
  { id: 'ported-1.16.5', name: 'Eaglercraft 1.16.5', version: '1.16.5', type: 'wasm', category: 'ported', description: 'Community beta port of Minecraft 1.16.5 Nether Update. Experimental.', author: 'AcornDev', url: 'https://rawcdn.githack.com/XxFluffyAsherxX/Eaglercraft-1.19/main/Web/index.html', icon: 'nether', builtIn: true, size: '53 MB', mcVersion: '1.16.5', features: ['Nether Update', 'Basalt Deltas', 'Warped Forests', 'WASM-GC'], experimental: true },

  // === 1.19 PORT ===
  { id: 'ported-1.19', name: 'Eaglercraft 1.19', version: '1.19', type: 'wasm', category: 'ported', description: 'Community port of Minecraft 1.19. The Wild Update. Deep Dark, Mangrove Swamps.', author: 'Community', url: 'https://rawcdn.githack.com/XxFluffyAsherxX/Eaglercraft-1.19/main/Web/index.html', icon: 'ender', builtIn: true, size: '55 MB', mcVersion: '1.19', features: ['The Wild Update', 'Deep Dark', 'Warden', 'Mangrove'], experimental: true },

  // === 1.20 PORTS ===
  { id: 'ported-1.20', name: 'EaglyMC 1.20', version: '1.20', type: 'js', category: 'ported', description: 'Community port of Minecraft 1.20. Trails & Tales. Cherry groves, armor trims.', author: 'btplayzx', url: 'https://eaglerdevs.github.io/Eaglercraft-1.20/', icon: 'crown', builtIn: true, size: '58 MB', mcVersion: '1.20', features: ['Trails & Tales', 'Cherry Groves', 'Armor Trims', 'Archaeology'], experimental: true },
  { id: 'ported-1.20-wasm', name: 'EaglyMC 1.20 WASM', version: '1.20', type: 'wasm', category: 'ported', description: 'EaglyMC 1.20 WebAssembly build. Faster on modern browsers.', author: 'btplayzx', url: 'https://eaglerdevs.github.io/Eaglercraft-1.20/', icon: 'crown', builtIn: true, size: '62 MB', mcVersion: '1.20', features: ['WASM', 'Trails & Tales', 'Cherry Groves'], experimental: true },

  // === 1.21 PORT ===
  { id: 'ported-1.21', name: 'Eaglercraft 1.21', version: '1.21', type: 'wasm', category: 'ported', description: 'TuffClient-based 1.21 style port. Trial Chambers, Breeze, and copper bulbs.', author: 'Community', url: 'https://eaglerdevs.github.io/Eaglercraft-1.20/', icon: 'bolt', builtIn: true, size: '60 MB', mcVersion: '1.21', features: ['Tricky Trials', 'Trial Chambers', 'Breeze', 'Copper'], experimental: true }
];

const BUILT_IN_SERVERS = [
  {
    id: 'krypticmc',
    name: 'KrypticMC',
    address: 'wss://krypticmc.net',
    version: '1.8.8',
    gameMode: 'Minigames',
    description: 'One of the biggest Eaglercraft servers. PvP, Survival, and more.',
    tags: ['pvp', 'survival', 'minigames', 'featured'],
    builtIn: true
  },
  {
    id: 'pixelcraft',
    name: 'Pixel Craft',
    address: 'wss://pcsmp.net',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Popular survival server with active community.',
    tags: ['survival', 'community', 'featured'],
    builtIn: true
  },
  {
    id: 'voidsent',
    name: 'Voidsent MC',
    address: 'wss://mc.voidsent.net',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Feature-rich survival with land claims and economy.',
    tags: ['survival', 'economy', 'featured'],
    builtIn: true
  },
  {
    id: 'archyverse',
    name: 'Archyverse',
    address: 'wss://mc.archyverse.org',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Massive survival world with communities.',
    tags: ['survival', 'creative'],
    builtIn: true
  },
  {
    id: 'bagelsmp',
    name: 'BagelSMP',
    address: 'wss://top.bagelsmp.com',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Friendly survival multiplayer server.',
    tags: ['survival', 'smp', 'community'],
    builtIn: true
  },
  {
    id: 'clever-teaching',
    name: 'Clever Teaching',
    address: 'wss://clever-teaching.com',
    version: '1.8.8',
    gameMode: 'Minigames',
    description: 'One of EaglerCraft\'s biggest servers with multiple gamemodes.',
    tags: ['minigames', 'pvp', 'survival', 'prison', 'lifesteal'],
    builtIn: true
  },
  {
    id: 'heartsmp',
    name: 'HeartSMP',
    address: 'wss://play.heartsmp.net',
    version: '1.12.2',
    gameMode: 'Lifesteal',
    description: 'Ultimate Lifesteal adventure with active community.',
    tags: ['lifesteal', 'survival'],
    builtIn: true
  },
  {
    id: 'wanderwoodsmp',
    name: 'WanderwoodSMP',
    address: 'wss://wanderwoodsmp.com',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Cross-platform community for builders and traders.',
    tags: ['survival', 'economy', 'community'],
    builtIn: true
  },
  {
    id: 'webmc',
    name: 'WebMC',
    address: 'wss://play.webmc.fun',
    version: '1.12.2',
    gameMode: 'OneBlock',
    description: 'Unique oneblock server with Java, Eagler, and Bedrock crossplay.',
    tags: ['oneblock', 'crossplay'],
    builtIn: true
  },
  {
    id: 'radiantnet',
    name: 'Radiant Network',
    address: 'wss://eagler.radiantnet.club',
    version: '1.8.8',
    gameMode: 'Network',
    description: 'Multi-gamemode network server.',
    tags: ['network', 'pvp', 'survival'],
    builtIn: true
  },
  {
    id: 'carrotcraft',
    name: 'CarrotCraft Network',
    address: 'wss://eagler.carrot-craft.org',
    version: '1.8.8',
    gameMode: 'Network',
    description: 'Community-driven network with multiple gamemodes.',
    tags: ['network', 'community'],
    builtIn: true
  },
  {
    id: 'xenamc',
    name: 'xenaMC',
    address: 'wss://xena.wtf',
    version: '1.8.8',
    gameMode: 'PvP',
    description: 'PvP-focused server with duels and arenas.',
    tags: ['pvp', 'duels'],
    builtIn: true
  },
  {
    id: 'crackedpvp',
    name: 'Cracked PvP',
    address: 'wss://crackedpvp.club',
    version: '1.8.8',
    gameMode: 'PvP',
    description: 'No-premium PvP server. Anyone can join.',
    tags: ['pvp', 'cracked'],
    builtIn: true
  },
  {
    id: 'default-survival',
    name: 'Default Survival',
    address: 'wss://default-survival.eagler.host',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Classic vanilla survival experience.',
    tags: ['survival', 'vanilla'],
    builtIn: true
  },
  {
    id: 'vanillamc',
    name: 'VanillaMC',
    address: 'wss://vanillamc.me',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Pure vanilla Minecraft experience.',
    tags: ['survival', 'vanilla'],
    builtIn: true
  },
  {
    id: 'beaglecraft',
    name: 'Beaglecraft',
    address: 'wss://eaglercraft.beaglecraft.online',
    version: '1.8.8',
    gameMode: 'Network',
    description: 'Friendly server with Survival, Skyblock, and PvP.',
    tags: ['survival', 'skyblock', 'pvp'],
    builtIn: true
  },
  {
    id: 'smileysmp',
    name: 'SmileySMP',
    address: 'wss://smileysmp.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Fun and friendly SMP server.',
    tags: ['smp', 'survival'],
    builtIn: true
  },
  {
    id: 'nomadanarchy',
    name: 'Nomad Anarchy',
    address: 'wss://nomad-anarchy.eagler.host',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'No rules, no limits. Pure anarchy.',
    tags: ['anarchy', 'pvp'],
    builtIn: true
  },
  {
    id: 'nobnot',
    name: 'noBnoT Anarchy',
    address: 'wss://eagler.nobnot.org',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'Another anarchy server for the brave.',
    tags: ['anarchy'],
    builtIn: true
  },
  {
    id: '9b8t',
    name: '9b8t',
    address: 'wss://9b8t.eagler.host',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'Anarchy in the spirit of 2b2t.',
    tags: ['anarchy'],
    builtIn: true
  },
  {
    id: '2b2t-revived',
    name: '2b2t Revived',
    address: 'wss://2b2t-revived.eagler.host',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'Inspired by the legendary 2b2t.',
    tags: ['anarchy'],
    builtIn: true
  },
  {
    id: '1b2t',
    name: '1B2T',
    address: 'wss://1b2t.eagler.host',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'Anarchy server with rich history.',
    tags: ['anarchy'],
    builtIn: true
  },
  {
    id: 'lamplifesteal',
    name: 'Lamp Lifesteal',
    address: 'wss://mc.lamplifesteal.xyz',
    version: '1.8.8',
    gameMode: 'Lifesteal',
    description: 'Lifesteal server with heart-stealing mechanics.',
    tags: ['lifesteal', 'pvp'],
    builtIn: true
  },
  {
    id: 'nocomm',
    name: 'NexoMC',
    address: 'wss://nexomc.org',
    version: '1.8.8',
    gameMode: 'Network',
    description: 'Multi-gamemode network.',
    tags: ['network', 'survival'],
    builtIn: true
  },
  {
    id: 'heartsmp-alt',
    name: 'HeartSMP (Alt)',
    address: 'wss://heartsmp.eagler.host',
    version: '1.8.8',
    gameMode: 'Lifesteal',
    description: 'HeartSMP alternative entry point.',
    tags: ['lifesteal'],
    builtIn: true
  },
  {
    id: 'muffinsmp',
    name: 'Muffin Network',
    address: 'wss://muffinsmp.se',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Swedish-based SMP with great community.',
    tags: ['smp', 'community'],
    builtIn: true
  },
  {
    id: 'zombesmp',
    name: 'ZombeSMP',
    address: 'wss://zombesmp.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Zombie-themed survival server.',
    tags: ['smp', 'survival'],
    builtIn: true
  },
  {
    id: 'blademc',
    name: 'BladeMC',
    address: 'wss://blademc.us',
    version: '1.12.2',
    gameMode: 'PvP',
    description: 'Fast-paced PvP combat server.',
    tags: ['pvp', 'combat'],
    builtIn: true
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    address: 'wss://ethereal.mov',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'Beautiful world survival experience.',
    tags: ['survival', '1.12'],
    builtIn: true
  },
  {
    id: 'theamethystmc',
    name: 'Amethyst',
    address: 'wss://play.theamethystmc.com',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'Purple-themed survival community.',
    tags: ['survival', '1.12'],
    builtIn: true
  },
  {
    id: 'tuffest',
    name: 'Tuffest',
    address: 'wss://tuffest.org',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'Tough survival challenge server.',
    tags: ['survival', '1.12', 'hardcore'],
    builtIn: true
  },
  {
    id: 'galacticpvp',
    name: 'GalacticPVP',
    address: 'wss://galacticpvp.eagler.host',
    version: '1.12.2',
    gameMode: 'PvP',
    description: 'Galaxy-themed PvP arenas.',
    tags: ['pvp', '1.12'],
    builtIn: true
  },
  {
    id: 'zentic',
    name: 'Zentic',
    address: 'wss://zentic.cc',
    version: '1.12.2',
    gameMode: 'Network',
    description: 'Multi-gamemode network server.',
    tags: ['network', '1.12'],
    builtIn: true
  },
  {
    id: 'fkas',
    name: 'FKAS MC',
    address: 'wss://fkas.online',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'Friendly survival community.',
    tags: ['survival', '1.12'],
    builtIn: true
  },
  {
    id: 'sme-mc',
    name: 'SME MC',
    address: 'wss://play.sme-mc.us',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'Active survival with events.',
    tags: ['survival', '1.12'],
    builtIn: true
  },
  {
    id: 'chillsurvival',
    name: 'Chill Survival',
    address: 'wss://ChillSurvival.eagler.host',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Relaxed survival server.',
    tags: ['survival', 'chill'],
    builtIn: true
  },
  {
    id: 'armageddonsmp',
    name: 'ArmageddonSMP',
    address: 'wss://Armageddon-SMP.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Epic end-of-world themed SMP.',
    tags: ['smp', 'survival'],
    builtIn: true
  },
  {
    id: 'roste-smp',
    name: 'Roste SMP',
    address: 'wss://roste-smp.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Community SMP with land claims.',
    tags: ['smp', 'community'],
    builtIn: true
  },
  {
    id: 'sorcerersmp',
    name: 'SorcererSMP',
    address: 'wss://Sorcerer-SMP.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Magic-themed SMP.',
    tags: ['smp', 'survival'],
    builtIn: true
  },
  {
    id: 'arena',
    name: 'Arch Arena',
    address: 'wss://arch.mc',
    version: '1.8.8',
    gameMode: 'PvP',
    description: 'Pure PvP arena server.',
    tags: ['pvp', 'arena'],
    builtIn: true
  },
  {
    id: 'broken-anarchy',
    name: 'Broken Anarchy',
    address: 'wss://broken.eagler.host',
    version: '1.8.8',
    gameMode: 'Anarchy',
    description: 'Broken and chaotic anarchy world.',
    tags: ['anarchy'],
    builtIn: true
  },
  {
    id: 'unstable',
    name: 'UNSTABLE SMP',
    address: 'wss://play.unstable-world.me',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Unpredictable world with random events.',
    tags: ['smp', 'events'],
    builtIn: true
  },
  {
    id: 'akazimc',
    name: 'AkaziMC',
    address: 'wss://akazimc.eagler.host',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Community survival server.',
    tags: ['survival', 'community'],
    builtIn: true
  },
  {
    id: 'cloud-craft',
    name: 'Cloud Craft',
    address: 'wss://Cloud-craft.eagler.host',
    version: '1.8.8',
    gameMode: 'Survival',
    description: 'Sky-themed survival.',
    tags: ['survival', 'skyblock'],
    builtIn: true
  },
  {
    id: 'maceducation',
    name: 'OneBlock Education',
    address: 'wss://monacoeducation.info',
    version: '1.8.8',
    gameMode: 'OneBlock',
    description: 'Educational oneblock experience.',
    tags: ['oneblock', 'education'],
    builtIn: true
  },
  {
    id: 'horiandsmp',
    name: 'Horian SMP',
    address: 'wss://hoiiandsmp.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Friendly SMP server.',
    tags: ['smp'],
    builtIn: true
  },
  {
    id: 'chukai',
    name: 'Chukai SMP',
    address: 'wss://CHUKAI.eagler.host',
    version: '1.8.8',
    gameMode: 'SMP',
    description: 'Asian-based SMP community.',
    tags: ['smp', 'asia'],
    builtIn: true
  },
  {
    id: 'castlesmp',
    name: 'CastleSMP',
    address: 'wss://castlesmp.eagler.host',
    version: '1.12.2',
    gameMode: 'SMP',
    description: 'Medieval castle-themed SMP.',
    tags: ['smp', '1.12', 'medieval'],
    builtIn: true
  },
  {
    id: 'melonnetwork',
    name: 'Encrypted SMP',
    address: 'wss://eagler.melonnetwork.xyz',
    version: '1.12.2',
    gameMode: 'SMP',
    description: 'Encrypted and secure SMP.',
    tags: ['smp', '1.12'],
    builtIn: true
  },
  {
    id: 'nomadanarchy-112',
    name: 'Nomad Anarchy 1.12',
    address: 'wss://play.nomadanarchy.online',
    version: '1.12.2',
    gameMode: 'Anarchy',
    description: '1.12 anarchy server.',
    tags: ['anarchy', '1.12'],
    builtIn: true
  },
  {
    id: 'survivorsmp',
    name: 'Survivor SMP',
    address: 'wss://survivorsmp.eagler.host',
    version: '1.12.2',
    gameMode: 'SMP',
    description: '1.12 survival multiplayer.',
    tags: ['smp', '1.12'],
    builtIn: true
  },
  {
    id: 'craftpublic',
    name: 'CraftPublic',
    address: 'wss://eagler.qilk.de',
    version: '1.12.2',
    gameMode: 'Survival',
    description: 'European survival server.',
    tags: ['survival', '1.12', 'europe'],
    builtIn: true
  }
];

function getCustomClients() {
  const filePath = path.join(DATA_DIR, 'custom_clients.json');
  if (!fs.existsSync(filePath)) return [];
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return []; }
}

function saveCustomClients(clients) {
  fs.writeFileSync(path.join(DATA_DIR, 'custom_clients.json'), JSON.stringify(clients, null, 2));
}

function getCustomServers() {
  const filePath = path.join(DATA_DIR, 'custom_servers.json');
  if (!fs.existsSync(filePath)) return [];
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return []; }
}

function saveCustomServers(servers) {
  fs.writeFileSync(path.join(DATA_DIR, 'custom_servers.json'), JSON.stringify(servers, null, 2));
}

function getFavorites() {
  const filePath = path.join(DATA_DIR, 'favorites.json');
  if (!fs.existsSync(filePath)) return { servers: [], clients: [] };
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return { servers: [], clients: [] }; }
}

function saveFavorites(favs) {
  fs.writeFileSync(path.join(DATA_DIR, 'favorites.json'), JSON.stringify(favs, null, 2));
}

function getActivity() {
  const filePath = path.join(DATA_DIR, 'activity.json');
  if (!fs.existsSync(filePath)) return [];
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return []; }
}

function saveActivity(activity) {
  fs.writeFileSync(path.join(DATA_DIR, 'activity.json'), JSON.stringify(activity.slice(0, 50), null, 2));
}

function addActivity(text, type) {
  const activity = getActivity();
  activity.unshift({ text, type, time: new Date().toISOString() });
  saveActivity(activity);
}

function getAllClients() {
  return [...BUILT_IN_CLIENTS, ...getCustomClients()];
}

function getAllPortedClients() {
  return [...PORTED_CLIENTS, ...getCustomClients().filter(c => c.category === 'ported')];
}

function getAllServers() {
  return [...BUILT_IN_SERVERS, ...getCustomServers()];
}

app.get('/api/clients', (req, res) => {
  const clients = getAllClients();
  const favs = getFavorites();
  const custom = getCustomClients();
  res.json({
    builtIn: BUILT_IN_CLIENTS,
    custom,
    total: clients.length,
    favorites: favs.clients || []
  });
});

app.get('/api/ported', (req, res) => {
  const ported = getAllPortedClients();
  const favs = getFavorites();
  res.json({
    clients: PORTED_CLIENTS,
    total: ported.length,
    favorites: favs.clients || []
  });
});

app.post('/api/clients', (req, res) => {
  const { name, version, url, type, category, description, author } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });

  const clients = getCustomClients();
  const client = {
    id: 'custom-' + Date.now(),
    name,
    version: version || 'Custom',
    type: type || 'js',
    category: category || 'custom',
    description: description || '',
    author: author || 'User',
    url,
    icon: 'puzzle',
    builtIn: false,
    size: null
  };
  clients.push(client);
  saveCustomClients(clients);
  addActivity(`Added client: ${name}`, 'client');
  res.json(client);
});

app.delete('/api/clients/:id', (req, res) => {
  let clients = getCustomClients();
  clients = clients.filter(c => c.id !== req.params.id);
  saveCustomClients(clients);
  addActivity('Removed custom client', 'delete');
  res.json({ success: true });
});

app.get('/api/servers', (req, res) => {
  const servers = getAllServers();
  const custom = getCustomServers();
  const favs = getFavorites();
  res.json({
    builtIn: BUILT_IN_SERVERS,
    custom,
    total: servers.length,
    favorites: favs.servers || []
  });
});

app.post('/api/servers', (req, res) => {
  const { name, address, version, gameMode, description, tags } = req.body;
  if (!name || !address) return res.status(400).json({ error: 'Name and address required' });

  const servers = getCustomServers();
  const server = {
    id: 'custom-' + Date.now(),
    name,
    address,
    version: version || '1.8.8',
    gameMode: gameMode || 'Unknown',
    description: description || '',
    tags: tags || ['custom'],
    builtIn: false
  };
  servers.push(server);
  saveCustomServers(servers);
  addActivity(`Added server: ${name}`, 'server');
  res.json(server);
});

app.delete('/api/servers/:id', (req, res) => {
  let servers = getCustomServers();
  servers = servers.filter(s => s.id !== req.params.id);
  saveCustomServers(servers);
  addActivity('Removed custom server', 'delete');
  res.json({ success: true });
});

app.post('/api/favorites', (req, res) => {
  const { type, id } = req.body;
  const favs = getFavorites();
  if (!favs[type]) favs[type] = [];

  const idx = favs[type].indexOf(id);
  if (idx >= 0) {
    favs[type].splice(idx, 1);
  } else {
    favs[type].push(id);
  }
  saveFavorites(favs);
  res.json({ favorites: favs[type] });
});

app.get('/api/activity', (req, res) => {
  res.json(getActivity());
});

app.post('/api/ping', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });

  try {
    const url = new URL(address);
    const transport = url.protocol === 'wss:' ? https : http;

    const startTime = Date.now();
    const req2 = transport.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'wss:' ? 443 : 80),
      path: url.pathname || '/',
      method: 'GET',
      timeout: 5000,
      headers: { 'Connection': 'Upgrade', 'Upgrade': 'websocket' }
    }, (response) => {
      const ping = Date.now() - startTime;
      res.json({ online: true, ping, status: response.statusCode });
    });

    req2.on('error', () => {
      res.json({ online: false, ping: -1, status: 'unreachable' });
    });

    req2.on('timeout', () => {
      req2.destroy();
      res.json({ online: false, ping: -1, status: 'timeout' });
    });

    req2.end();
  } catch {
    res.json({ online: false, ping: -1, status: 'invalid' });
  }
});

app.get('/api/stats', (req, res) => {
  const clients = getAllClients();
  const servers = getAllServers();
  const favs = getFavorites();
  const activity = getActivity();

  res.json({
    totalClients: clients.length,
    builtInClients: BUILT_IN_CLIENTS.length,
    customClients: getCustomClients().length,
    totalPorted: PORTED_CLIENTS.length,
    totalServers: servers.length,
    builtInServers: BUILT_IN_SERVERS.length,
    customServers: getCustomServers().length,
    favorites: (favs.servers?.length || 0) + (favs.clients?.length || 0),
    recentActivity: activity.length
  });
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

server.listen(PORT, () => {
  console.log(`🦅 EaglLauncher running on http://localhost:${PORT}`);
  console.log(`📦 ${BUILT_IN_CLIENTS.length} clients loaded`);
  console.log(`📦 ${PORTED_CLIENTS.length} ported clients loaded`);
  console.log(`🌐 ${BUILT_IN_SERVERS.length} servers loaded`);
});
