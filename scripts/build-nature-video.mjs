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

function buildBranch({ d, stroke, widthPx, duration, delay, opacity = 1, cls = "branch-sway" }) {
  return `
    <path class="${cls}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${widthPx}" stroke-linecap="round" stroke-linejoin="round"
      style="animation-duration:${duration}s; animation-delay:${delay}s; opacity:${opacity};"/>
  `;
}

function buildRoot({ d, stroke, widthPx, opacity = 1, delay = 0 }) {
  return `
    <path class="root-breathe" d="${d}" fill="none" stroke="${stroke}" stroke-width="${widthPx}" stroke-linecap="round" stroke-linejoin="round"
      style="opacity:${opacity}; animation-delay:${delay}s;"/>
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
          radial-gradient(circle at 77% 18%, rgba(255, 241, 200, 0.98), rgba(255, 231, 177, 0.3) 18%, transparent 28%),
          radial-gradient(circle at 15% 16%, rgba(151, 103, 64, 0.2), transparent 26%),
          linear-gradient(180deg, #eee7dc 0%, #d8c0a5 43%, #9f7c59 100%);
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
      .root-breathe { animation: root-breathe 6.8s ease-in-out infinite; }
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
      @keyframes root-breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      @keyframes glow-pulse { 0%, 100% { transform: scale(1); opacity: 0.82; } 50% { transform: scale(1.12); opacity: 1; } }
      @keyframes flare-sweep { from { transform: translateX(-20px) translateY(12px) rotate(-6deg); opacity: 0.28; } to { transform: translateX(26px) translateY(-16px) rotate(5deg); opacity: 0.46; } }
    </style>
  </head>
  <body>
    <div class="scene">
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id="blur-lg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
          <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
          <linearGradient id="branchShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3d3028"/>
            <stop offset="45%" stop-color="#574235"/>
            <stop offset="100%" stop-color="#2f241d"/>
          </linearGradient>
          <linearGradient id="rootShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#9b7655"/>
            <stop offset="50%" stop-color="#7d5d43"/>
            <stop offset="100%" stop-color="#4d392c"/>
          </linearGradient>
          <linearGradient id="moss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6d7251"/>
            <stop offset="100%" stop-color="#aca36d"/>
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
            ${buildBranch({ d: "M -60 72 C 180 42, 354 34, 556 66 C 662 84, 774 104, 914 94 C 1048 84, 1164 52, 1346 26", stroke: "url(#branchShade)", widthPx: 34, duration: 7.2, delay: -0.8 })}
            ${buildBranch({ d: "M 784 -26 C 854 34, 916 98, 954 160 C 988 214, 1038 248, 1102 266", stroke: "url(#branchShade)", widthPx: 26, duration: 6.6, delay: -1.4, opacity: 0.84 })}
            ${buildBranch({ d: "M 1128 28 C 1046 76, 972 124, 892 186 C 828 236, 760 272, 656 316", stroke: "url(#branchShade)", widthPx: 20, duration: 7.8, delay: -2.1, opacity: 0.72 })}
            ${buildBranch({ d: "M 180 8 C 236 58, 292 110, 352 164 C 402 206, 472 244, 558 280", stroke: "url(#branchShade)", widthPx: 18, duration: 7.1, delay: -1.7, opacity: 0.58 })}
          </g>

          <g opacity="0.92">
            ${buildLeafGroup({ x: 92, y: 92, scale: 1.18, rotate: 8, duration: 7.2, delay: -1.2, palette: leafPaletteA })}
            ${buildLeafGroup({ x: 264, y: 136, scale: 0.98, rotate: -18, duration: 6.8, delay: -0.6, palette: leafPaletteB, opacity: 0.84 })}
            ${buildLeafGroup({ x: 1002, y: 76, scale: 1.12, rotate: -10, duration: 7.6, delay: -1.6, palette: leafPaletteA })}
            ${buildLeafGroup({ x: 908, y: 162, scale: 0.86, rotate: 18, duration: 6.9, delay: -2.1, palette: leafPaletteB, opacity: 0.82 })}
            ${buildLeafGroup({ x: 1144, y: 204, scale: 0.74, rotate: -24, duration: 7.4, delay: -0.8, palette: leafPaletteA, opacity: 0.76 })}
          </g>

          <g opacity="0.88">
            <ellipse cx="252" cy="660" rx="228" ry="76" fill="rgba(72, 52, 39, 0.14)" filter="url(#blur-lg)"/>
            <ellipse cx="910" cy="648" rx="290" ry="94" fill="rgba(53, 39, 30, 0.18)" filter="url(#blur-lg)"/>
            <path d="M0 556 C160 516 310 504 492 540 C644 570 836 576 1036 540 C1124 524 1202 528 1280 550 V720 H0 Z" fill="rgba(102, 76, 56, 0.28)"/>
          </g>

          <g opacity="0.98">
            ${buildRoot({ d: "M 72 622 C 168 568, 246 526, 328 498 C 414 468, 528 452, 650 456 C 816 460, 954 498, 1126 604", stroke: "url(#rootShade)", widthPx: 54, opacity: 0.98 })}
            ${buildRoot({ d: "M 312 642 C 344 594, 382 560, 428 528 C 492 482, 580 450, 696 436 C 818 420, 936 446, 1094 522", stroke: "#876347", widthPx: 26, opacity: 0.92, delay: -0.8 })}
            ${buildRoot({ d: "M 548 700 C 560 638, 570 590, 592 548 C 614 502, 648 470, 700 446 C 746 426, 814 428, 898 456", stroke: "#6e503b", widthPx: 22, opacity: 0.84, delay: -1.3 })}
            ${buildRoot({ d: "M 142 710 C 204 658, 252 626, 308 604 C 368 580, 434 572, 520 584", stroke: "#7a5a43", widthPx: 18, opacity: 0.8, delay: -1.8 })}
            ${buildRoot({ d: "M 892 706 C 926 660, 964 620, 1020 592 C 1092 556, 1160 544, 1270 560", stroke: "#6f523d", widthPx: 18, opacity: 0.82, delay: -2.1 })}
            ${buildRoot({ d: "M 742 656 C 768 606, 796 566, 832 534 C 868 502, 916 472, 968 454", stroke: "#7f5c42", widthPx: 16, opacity: 0.74, delay: -0.6 })}
          </g>

          <g opacity="0.86">
            <ellipse cx="206" cy="558" rx="54" ry="22" fill="url(#moss)" transform="rotate(-10 206 558)"/>
            <ellipse cx="1054" cy="578" rx="60" ry="18" fill="url(#moss)" transform="rotate(9 1054 578)"/>
            <ellipse cx="846" cy="632" rx="38" ry="14" fill="#9d9461" transform="rotate(-14 846 632)"/>
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
