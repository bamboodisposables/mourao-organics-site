#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpDir = resolve(root, "tmp", "nature-video-build");
const recordDir = resolve(tmpDir, "recording");
const sceneFile = resolve(tmpDir, "scene.html");
const outputVideo = resolve(root, "assets", "mourao-nature-loop.mp4");
const outputPoster = resolve(root, "assets", "mourao-nature-poster.jpg");
const width = 1280;
const height = 720;
const durationSeconds = 6;

function buildLeafGroup({ x, y, scale, rotate = 0, duration, delay, opacity = 0.92, palette }) {
  const [c1, c2, c3, c4] = palette;
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">
      <g class="leaf-group sway-gentle" style="animation-duration:${duration}s; animation-delay:${delay}s; opacity:${opacity};">
        <ellipse cx="0" cy="0" rx="46" ry="20" fill="${c1}" transform="rotate(-16)"/>
        <ellipse cx="38" cy="18" rx="36" ry="17" fill="${c2}" transform="rotate(10)"/>
        <ellipse cx="76" cy="-2" rx="34" ry="16" fill="${c3}" transform="rotate(-8)"/>
        <ellipse cx="110" cy="18" rx="28" ry="14" fill="${c4}" transform="rotate(14)"/>
        <ellipse cx="24" cy="48" rx="32" ry="15" fill="${c3}" transform="rotate(16)"/>
        <ellipse cx="84" cy="46" rx="28" ry="14" fill="${c1}" transform="rotate(-14)"/>
      </g>
    </g>
  `;
}

function buildBranch({ d, stroke, widthPx, duration, delay, opacity = 1, cls = "branch-sway", filterId = "" }) {
  return `
    <path class="${cls}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${widthPx}" stroke-linecap="round" stroke-linejoin="round"${filterId ? ` filter="url(#${filterId})"` : ""}
      style="animation-duration:${duration}s; animation-delay:${delay}s; opacity:${opacity};"/>
  `;
}

function buildMote({ x, y, size, duration, delay, driftX, driftY, opacity = 0.84 }) {
  return `
    <circle class="mote-float" cx="${x}" cy="${y}" r="${size}" fill="rgba(251, 234, 176, ${opacity})"
      style="animation-duration:${duration}s; animation-delay:${delay}s; --drift-x:${driftX}px; --drift-y:${driftY}px;"/>
  `;
}

function renderScene() {
  const leafPaletteA = ["#7e8966", "#9daa7a", "#c8bb86", "#d2c38f"];
  const leafPaletteB = ["#667257", "#87946b", "#b6b17f", "#d7c992"];
  const motes = [
    { x: 150, y: 126, size: 8, duration: 8.4, delay: -1.2, driftX: 22, driftY: -14, opacity: 0.44 },
    { x: 286, y: 88, size: 6, duration: 7.1, delay: -2.4, driftX: -18, driftY: 12, opacity: 0.58 },
    { x: 412, y: 204, size: 5.5, duration: 8.8, delay: -1.7, driftX: 12, driftY: -18, opacity: 0.46 },
    { x: 718, y: 146, size: 7, duration: 7.6, delay: -0.4, driftX: -22, driftY: 10, opacity: 0.54 },
    { x: 972, y: 106, size: 10, duration: 9.2, delay: -1.1, driftX: 20, driftY: -10, opacity: 0.4 },
    { x: 1122, y: 176, size: 6.2, duration: 8.1, delay: -2.1, driftX: -12, driftY: 16, opacity: 0.48 },
    { x: 1220, y: 258, size: 4.5, duration: 7.4, delay: -0.8, driftX: -16, driftY: -14, opacity: 0.56 }
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #efe3d6; }
      body { display: grid; place-items: center; }
      .scene {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background:
          radial-gradient(circle at 77% 18%, rgba(255, 241, 200, 0.98), rgba(255, 231, 177, 0.26) 18%, transparent 30%),
          radial-gradient(circle at 18% 18%, rgba(182, 136, 92, 0.12), transparent 30%),
          linear-gradient(180deg, #f3ece2 0%, #deccb6 48%, #c6a789 100%);
      }
      svg { width: 100%; height: 100%; display: block; }
      .scene-pan { animation: scene-pan 8s ease-in-out infinite alternate; transform-origin: center; }
      .sway-gentle,
      .branch-sway {
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        transform-box: fill-box;
        transform-origin: center;
      }
      .sway-gentle { animation-name: sway-gentle; }
      .branch-sway { animation-name: branch-sway; }
      .mote-float { animation-name: mote-float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      .glow-pulse { animation: glow-pulse 6s ease-in-out infinite; transform-origin: 984px 146px; }
      .flare-sweep { animation: flare-sweep 7.6s ease-in-out infinite alternate; }
      @keyframes scene-pan { from { transform: scale(1.025) translateX(-12px); } to { transform: scale(1.055) translateX(14px) translateY(-4px); } }
      @keyframes sway-gentle { from { transform: rotate(-2deg); } to { transform: rotate(2.8deg); } }
      @keyframes branch-sway { from { transform: rotate(-1.2deg); } to { transform: rotate(1.7deg); } }
      @keyframes mote-float {
        0%   { transform: translate(0, 0); opacity: 0.35; }
        24%  { opacity: 0.88; }
        55%  { transform: translate(var(--drift-x), var(--drift-y)); opacity: 0.62; }
        100% { transform: translate(calc(var(--drift-x) * -0.35), calc(var(--drift-y) * -0.35)); opacity: 0.26; }
      }
      @keyframes glow-pulse { 0%, 100% { transform: scale(1); opacity: 0.82; } 50% { transform: scale(1.12); opacity: 1; } }
      @keyframes flare-sweep { from { transform: translateX(-20px) translateY(12px) rotate(-6deg); opacity: 0.28; } to { transform: translateX(26px) translateY(-16px) rotate(5deg); opacity: 0.46; } }
    </style>
  </head>
  <body>
    <div class="scene">
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id="blur-lg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
          <filter id="blur-md" x="-24%" y="-24%" width="148%" height="148%"><feGaussianBlur stdDeviation="12"/></filter>
          <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
          <linearGradient id="branchShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3d3028"/>
            <stop offset="45%" stop-color="#574235"/>
            <stop offset="100%" stop-color="#2f241d"/>
          </linearGradient>
        </defs>
        <g class="scene-pan">
          <g class="glow-pulse">
            <circle cx="986" cy="148" r="176" fill="rgba(255, 240, 198, 0.6)" filter="url(#blur-lg)"/>
            <circle cx="986" cy="148" r="92" fill="rgba(255, 248, 225, 0.72)" filter="url(#blur-sm)"/>
          </g>
          <ellipse class="flare-sweep" cx="860" cy="198" rx="216" ry="62" fill="rgba(249, 233, 196, 0.26)" filter="url(#blur-lg)"/>
          <ellipse class="flare-sweep" cx="1056" cy="92" rx="146" ry="38" fill="rgba(255, 244, 209, 0.2)" filter="url(#blur-lg)" style="animation-delay:-2.4s;"/>

          <g opacity="0.9">
            ${buildBranch({ d: "M -80 92 C 202 42, 414 46, 668 88 C 862 120, 1064 108, 1368 32", stroke: "url(#branchShade)", widthPx: 20, duration: 7.2, delay: -0.8, opacity: 0.24, filterId: "blur-md" })}
            ${buildBranch({ d: "M 764 -18 C 838 48, 916 114, 982 188 C 1036 244, 1098 284, 1180 318", stroke: "url(#branchShade)", widthPx: 14, duration: 6.6, delay: -1.4, opacity: 0.18, filterId: "blur-md" })}
            ${buildBranch({ d: "M 1088 34 C 1008 88, 920 150, 824 226 C 760 276, 700 314, 624 350", stroke: "url(#branchShade)", widthPx: 12, duration: 7.8, delay: -2.1, opacity: 0.14, filterId: "blur-md" })}
          </g>

          <g opacity="0.74">
            ${buildLeafGroup({ x: 92, y: 92, scale: 1.18, rotate: 8, duration: 7.2, delay: -1.2, palette: leafPaletteA, opacity: 0.68 })}
            ${buildLeafGroup({ x: 264, y: 136, scale: 0.98, rotate: -18, duration: 6.8, delay: -0.6, palette: leafPaletteB, opacity: 0.56 })}
            ${buildLeafGroup({ x: 1002, y: 76, scale: 1.12, rotate: -10, duration: 7.6, delay: -1.6, palette: leafPaletteA, opacity: 0.64 })}
            ${buildLeafGroup({ x: 908, y: 162, scale: 0.86, rotate: 18, duration: 6.9, delay: -2.1, palette: leafPaletteB, opacity: 0.52 })}
            ${buildLeafGroup({ x: 1144, y: 204, scale: 0.74, rotate: -24, duration: 7.4, delay: -0.8, palette: leafPaletteA, opacity: 0.48 })}
          </g>

          <g opacity="0.88">
            <ellipse cx="252" cy="664" rx="228" ry="76" fill="rgba(97, 73, 54, 0.08)" filter="url(#blur-lg)"/>
            <ellipse cx="910" cy="650" rx="290" ry="94" fill="rgba(83, 61, 44, 0.1)" filter="url(#blur-lg)"/>
            <ellipse cx="668" cy="626" rx="484" ry="88" fill="rgba(201, 173, 142, 0.2)" filter="url(#blur-lg)"/>
            <path d="M0 570 C198 534 386 530 570 550 C726 568 916 572 1108 550 C1186 542 1242 544 1280 550 V720 H0 Z" fill="rgba(188, 153, 121, 0.22)"/>
          </g>

          <g>
            ${motes.map(buildMote).join("")}
          </g>
        </g>
      </svg>
    </div>
  </body>
</html>`;
}

async function main() {
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(recordDir, { recursive: true });
  await writeFile(sceneFile, renderScene(), "utf8");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: recordDir, size: { width, height } }
  });
  const page = await context.newPage();
  await page.goto(`file://${sceneFile}`, { waitUntil: "load" });
  await page.waitForTimeout(durationSeconds * 1000 + 120);
  await page.close();
  await context.close();
  await browser.close();

  const recordedFiles = (await readdir(recordDir)).filter((file) => file.endsWith(".webm"));
  if (!recordedFiles.length) throw new Error("No recorded video found.");

  const sourceWebm = resolve(recordDir, recordedFiles[0]);
  execFileSync("ffmpeg", ["-y", "-i", sourceWebm, "-t", String(durationSeconds), "-vf", `fps=24,scale=${width}:${height}:flags=lanczos`, "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", outputVideo], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-y", "-ss", "00:00:02", "-i", outputVideo, "-frames:v", "1", "-update", "1", "-q:v", "2", outputPoster], { stdio: "inherit" });

  console.log(`Created ${outputVideo}`);
  console.log(`Created ${outputPoster}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
