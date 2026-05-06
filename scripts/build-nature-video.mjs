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

function buildStem({ x, baseY, heightPx, bend, stroke, plumeFill, strokeWidth, duration, delay, opacity }) {
  const tipX = x + bend;
  const tipY = baseY - heightPx;
  const controlX1 = x + bend * 0.25;
  const controlY1 = baseY - heightPx * 0.32;
  const controlX2 = x + bend * 0.78;
  const controlY2 = baseY - heightPx * 0.74;
  const plumeX = tipX + bend * 0.1;
  const plumeY = tipY + 6;
  const plumeScale = Math.max(0.85, heightPx / 200);

  return `
    <g class="stem sway-${(Math.abs(Math.round(x)) % 3) + 1}" style="transform-origin:${x}px ${baseY}px; animation-duration:${duration}s; animation-delay:${delay}s; opacity:${opacity};">
      <path d="M ${x} ${baseY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${tipX} ${tipY}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <g transform="translate(${plumeX} ${plumeY}) scale(${plumeScale})">
        <ellipse cx="0" cy="0" rx="9" ry="30" fill="${plumeFill}" opacity="0.94" transform="rotate(-10)"/>
        <ellipse cx="10" cy="2" rx="8" ry="26" fill="${plumeFill}" opacity="0.82" transform="rotate(12)"/>
        <ellipse cx="-8" cy="5" rx="7" ry="21" fill="${plumeFill}" opacity="0.72" transform="rotate(-24)"/>
      </g>
    </g>
  `;
}

function buildLeafCluster({ x, y, scale, duration, delay, flip = 1 }) {
  const transform = flip < 0 ? `translate(${x} ${y}) scale(-${scale} ${scale})` : `translate(${x} ${y}) scale(${scale})`;
  return `
    <g class="branch drift-soft" style="transform-origin:${x}px ${y}px; animation-duration:${duration}s; animation-delay:${delay}s;" transform="${transform}" opacity="0.76">
      <path d="M 0 0 C 60 18, 115 38, 165 66" fill="none" stroke="#b89571" stroke-width="4.2" stroke-linecap="round"/>
      <ellipse cx="42" cy="12" rx="24" ry="12" fill="#d6c59f" transform="rotate(-8 42 12)"/>
      <ellipse cx="86" cy="32" rx="22" ry="11" fill="#ccb48a" transform="rotate(10 86 32)"/>
      <ellipse cx="128" cy="50" rx="18" ry="10" fill="#e2d1ab" transform="rotate(-16 128 50)"/>
      <ellipse cx="147" cy="62" rx="14" ry="8" fill="#b2b48f" transform="rotate(18 147 62)"/>
    </g>
  `;
}

function buildPollen({ x, y, size, duration, delay, drift }) {
  return `
    <circle class="pollen float-soft" cx="${x}" cy="${y}" r="${size}" fill="rgba(244, 226, 177, 0.92)"
      style="animation-duration:${duration}s; animation-delay:${delay}s; --pollen-drift:${drift}px;"/>
  `;
}

function renderScene() {
  const backStems = [
    { x: 84, baseY: 714, heightPx: 178, bend: -20, stroke: "#b88a61", plumeFill: "#e8d2b2", strokeWidth: 4, duration: 5.8, delay: -0.8, opacity: 0.76 },
    { x: 182, baseY: 716, heightPx: 158, bend: 16, stroke: "#b98f68", plumeFill: "#f0dfbf", strokeWidth: 3.6, duration: 6.4, delay: -1.2, opacity: 0.68 },
    { x: 302, baseY: 716, heightPx: 188, bend: -14, stroke: "#a97957", plumeFill: "#ebd6b6", strokeWidth: 4.2, duration: 6.1, delay: -0.4, opacity: 0.74 },
    { x: 438, baseY: 718, heightPx: 166, bend: 22, stroke: "#b08661", plumeFill: "#efdcbc", strokeWidth: 3.8, duration: 5.9, delay: -1.1, opacity: 0.72 },
    { x: 592, baseY: 719, heightPx: 182, bend: -18, stroke: "#b78761", plumeFill: "#e8d3b3", strokeWidth: 4, duration: 6.7, delay: -0.9, opacity: 0.7 },
    { x: 734, baseY: 718, heightPx: 150, bend: 18, stroke: "#b98e69", plumeFill: "#f1debe", strokeWidth: 3.4, duration: 6.2, delay: -0.6, opacity: 0.62 },
    { x: 882, baseY: 716, heightPx: 192, bend: -12, stroke: "#a97959", plumeFill: "#e9d3b5", strokeWidth: 4.3, duration: 6.5, delay: -1.5, opacity: 0.78 },
    { x: 1038, baseY: 716, heightPx: 168, bend: 20, stroke: "#b1845f", plumeFill: "#eedaba", strokeWidth: 3.8, duration: 5.6, delay: -0.7, opacity: 0.71 },
    { x: 1184, baseY: 714, heightPx: 178, bend: -22, stroke: "#b98c66", plumeFill: "#ecd8b8", strokeWidth: 3.9, duration: 6.3, delay: -1.3, opacity: 0.72 }
  ];

  const frontStems = [
    { x: 146, baseY: 722, heightPx: 230, bend: 22, stroke: "#966948", plumeFill: "#f2e2c5", strokeWidth: 5.2, duration: 6.2, delay: -0.4, opacity: 0.88 },
    { x: 342, baseY: 724, heightPx: 254, bend: -24, stroke: "#936545", plumeFill: "#ead1ae", strokeWidth: 5.6, duration: 5.8, delay: -0.9, opacity: 0.92 },
    { x: 558, baseY: 724, heightPx: 238, bend: 18, stroke: "#9f7350", plumeFill: "#f1dec0", strokeWidth: 5.3, duration: 6.4, delay: -1.4, opacity: 0.88 },
    { x: 784, baseY: 724, heightPx: 266, bend: -16, stroke: "#966848", plumeFill: "#eed8b8", strokeWidth: 5.8, duration: 6.1, delay: -0.6, opacity: 0.92 },
    { x: 1008, baseY: 724, heightPx: 242, bend: 20, stroke: "#9d7051", plumeFill: "#f1dfc1", strokeWidth: 5.1, duration: 5.9, delay: -1.2, opacity: 0.9 }
  ];

  const pollen = [
    { x: 228, y: 162, size: 5.8, duration: 8.5, delay: -0.6, drift: 14 },
    { x: 296, y: 132, size: 4.2, duration: 9.6, delay: -2.2, drift: -12 },
    { x: 472, y: 198, size: 3.8, duration: 8.9, delay: -1.7, drift: 10 },
    { x: 612, y: 154, size: 5.2, duration: 9.8, delay: -0.3, drift: -16 },
    { x: 824, y: 214, size: 4.6, duration: 10.4, delay: -1.9, drift: 12 },
    { x: 946, y: 178, size: 6.2, duration: 8.8, delay: -0.8, drift: -14 },
    { x: 1120, y: 146, size: 4.5, duration: 10.2, delay: -1.4, drift: 10 }
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
          radial-gradient(circle at 78% 18%, rgba(249, 237, 213, 0.86), transparent 22%),
          radial-gradient(circle at 18% 14%, rgba(232, 213, 188, 0.56), transparent 28%),
          linear-gradient(180deg, #fbf5ef 0%, #f1e3d3 48%, #dfc4aa 100%);
      }
      svg { width: 100%; height: 100%; display: block; }
      .drift-soft { animation-name: drift-soft; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
      .float-soft { animation-name: float-soft; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      .sway-1, .sway-2, .sway-3 { animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
      .sway-1 { animation-name: sway-1; }
      .sway-2 { animation-name: sway-2; }
      .sway-3 { animation-name: sway-3; }
      .glow-pulse { animation: glow-pulse 6s ease-in-out infinite; transform-origin: 964px 150px; }
      .layer-drift { animation: layer-drift 12s ease-in-out infinite alternate; }
      @keyframes sway-1 { from { transform: rotate(-2.4deg) translateY(0); } to { transform: rotate(3.2deg) translateY(-2px); } }
      @keyframes sway-2 { from { transform: rotate(2.8deg) translateY(0); } to { transform: rotate(-2.8deg) translateY(-3px); } }
      @keyframes sway-3 { from { transform: rotate(-1.8deg) translateY(0); } to { transform: rotate(2.5deg) translateY(-1px); } }
      @keyframes drift-soft { from { transform: translateY(0) rotate(-1deg); } to { transform: translateY(6px) rotate(1.2deg); } }
      @keyframes float-soft {
        0%   { transform: translate(0, 0); opacity: 0.35; }
        20%  { opacity: 0.9; }
        50%  { transform: translate(var(--pollen-drift), -16px); opacity: 0.65; }
        100% { transform: translate(calc(var(--pollen-drift) * -0.35), 10px); opacity: 0.3; }
      }
      @keyframes glow-pulse { 0%, 100% { transform: scale(1); opacity: 0.82; } 50% { transform: scale(1.08); opacity: 1; } }
      @keyframes layer-drift { from { transform: translateX(-10px); } to { transform: translateX(12px); } }
    </style>
  </head>
  <body>
    <div class="scene">
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <filter id="blur-lg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="26"/></filter>
          <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d4bf"/><stop offset="100%" stop-color="#d2b79c"/></linearGradient>
          <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dbbfa4"/><stop offset="100%" stop-color="#b89070"/></linearGradient>
          <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b28662"/><stop offset="100%" stop-color="#8b6448"/></linearGradient>
        </defs>
        <g class="glow-pulse">
          <circle cx="964" cy="150" r="170" fill="rgba(247, 228, 185, 0.42)" filter="url(#blur-lg)"/>
          <circle cx="964" cy="150" r="102" fill="rgba(255, 243, 215, 0.5)" filter="url(#blur-lg)"/>
        </g>
        ${buildLeafCluster({ x: 24, y: 72, scale: 1.2, duration: 7.8, delay: -0.6 })}
        ${buildLeafCluster({ x: 1118, y: 58, scale: 1.06, duration: 8.4, delay: -1.4, flip: -1 })}
        <g class="layer-drift" opacity="0.94"><path d="M0 420 C170 362 338 360 486 408 C604 446 758 450 928 408 C1056 376 1174 370 1280 402 V720 H0 Z" fill="url(#hillBack)"/></g>
        <g class="layer-drift" style="animation-duration: 14s; animation-delay: -1.4s;" opacity="0.96"><path d="M0 502 C176 456 302 442 454 476 C626 516 792 522 936 484 C1072 448 1162 454 1280 490 V720 H0 Z" fill="url(#hillMid)"/></g>
        <path d="M0 596 C128 552 268 540 424 572 C610 612 798 618 964 586 C1084 564 1186 568 1280 596 V720 H0 Z" fill="url(#hillFront)" opacity="0.86"/>
        <ellipse cx="276" cy="644" rx="184" ry="68" fill="rgba(151, 107, 75, 0.12)" filter="url(#blur-lg)"/>
        <ellipse cx="914" cy="662" rx="228" ry="78" fill="rgba(120, 86, 61, 0.12)" filter="url(#blur-lg)"/>
        <g>${backStems.map(buildStem).join("")}</g>
        <g>${frontStems.map(buildStem).join("")}</g>
        <g>${pollen.map(buildPollen).join("")}</g>
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
