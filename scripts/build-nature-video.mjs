#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpDir = resolve(root, "tmp", "nature-video-build");
const recordDir = resolve(tmpDir, "recording");
const sceneFile = resolve(tmpDir, "scene.html");
const sourceImage = resolve(root, "assets", "mourao-nature-source.jpg");
const outputVideo = resolve(root, "assets", "mourao-nature-loop.mp4");
const outputPoster = resolve(root, "assets", "mourao-nature-poster.jpg");
const width = 1280;
const height = 720;
const durationSeconds = 7;

function renderScene() {
  const imageUrl = pathToFileURL(sourceImage).href;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #e8dccd;
      }
      body {
        display: grid;
        place-items: center;
      }
      .scene {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background:
          radial-gradient(circle at 78% 20%, rgba(255, 241, 199, 0.58), transparent 24%),
          linear-gradient(180deg, #f4ece1 0%, #dbc4aa 100%);
      }
      .scene__photo,
      .scene__photo-blur {
        position: absolute;
        inset: -8%;
        background-image: url("${imageUrl}");
        background-size: cover;
        background-position: center;
        transform-origin: center;
      }
      .scene__photo {
        animation: drift-main ${durationSeconds}s ease-in-out infinite alternate;
        filter: saturate(0.94) contrast(1.02) brightness(1.02);
      }
      .scene__photo-blur {
        inset: -12%;
        opacity: 0.34;
        filter: blur(24px) saturate(0.9) brightness(1.1);
        animation: drift-blur ${durationSeconds}s ease-in-out infinite alternate;
        mix-blend-mode: screen;
      }
      .scene__shade {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(31, 22, 17, 0.05) 0%, rgba(31, 22, 17, 0) 28%, rgba(31, 22, 17, 0.1) 100%),
          radial-gradient(circle at 74% 21%, rgba(255, 236, 186, 0.42), transparent 22%),
          radial-gradient(circle at 25% 76%, rgba(206, 178, 149, 0.18), transparent 30%);
      }
      .scene__mist {
        position: absolute;
        inset: -10%;
        background:
          radial-gradient(circle at 76% 18%, rgba(255, 245, 223, 0.52), transparent 18%),
          radial-gradient(circle at 68% 34%, rgba(252, 238, 211, 0.22), transparent 20%),
          radial-gradient(circle at 34% 18%, rgba(255, 244, 222, 0.16), transparent 28%);
        filter: blur(20px);
        animation: mist-shift ${durationSeconds}s ease-in-out infinite alternate;
        mix-blend-mode: screen;
      }
      .scene__flare {
        position: absolute;
        inset: -8%;
        background:
          radial-gradient(circle at 76% 21%, rgba(255, 244, 206, 0.82), rgba(255, 244, 206, 0.16) 12%, transparent 20%),
          linear-gradient(126deg, transparent 48%, rgba(255, 242, 212, 0.3) 56%, transparent 66%);
        filter: blur(12px);
        animation: flare-drift ${durationSeconds}s ease-in-out infinite alternate;
        mix-blend-mode: screen;
      }
      .scene__grain {
        position: absolute;
        inset: 0;
        opacity: 0.08;
        background-image:
          radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.5px),
          radial-gradient(circle at 74% 42%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.5px),
          radial-gradient(circle at 44% 68%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.5px);
        background-size: 180px 180px, 220px 220px, 200px 200px;
        animation: grain-drift 5s linear infinite;
      }
      @keyframes drift-main {
        from { transform: scale(1.06) translate3d(-1.2%, -0.8%, 0); }
        to { transform: scale(1.12) translate3d(1.4%, 1%, 0); }
      }
      @keyframes drift-blur {
        from { transform: scale(1.14) translate3d(1.2%, 0.8%, 0); }
        to { transform: scale(1.2) translate3d(-1.4%, -0.8%, 0); }
      }
      @keyframes mist-shift {
        from { transform: translate3d(-1.2%, 0.8%, 0) scale(1); opacity: 0.72; }
        to { transform: translate3d(1.8%, -0.8%, 0) scale(1.04); opacity: 0.92; }
      }
      @keyframes flare-drift {
        from { transform: translate3d(-1%, 1.2%, 0) scale(0.98); opacity: 0.64; }
        to { transform: translate3d(1.2%, -1%, 0) scale(1.06); opacity: 0.92; }
      }
      @keyframes grain-drift {
        from { transform: translate3d(0, 0, 0); }
        to { transform: translate3d(-12px, 10px, 0); }
      }
    </style>
  </head>
  <body>
    <div class="scene">
      <div class="scene__photo-blur"></div>
      <div class="scene__photo"></div>
      <div class="scene__mist"></div>
      <div class="scene__flare"></div>
      <div class="scene__shade"></div>
      <div class="scene__grain"></div>
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
  await page.waitForTimeout(durationSeconds * 1000 + 140);
  await page.close();
  await context.close();
  await browser.close();

  const recordedFiles = (await readdir(recordDir)).filter((file) => file.endsWith(".webm"));
  if (!recordedFiles.length) throw new Error("No recorded video found.");

  const sourceWebm = resolve(recordDir, recordedFiles[0]);
  execFileSync("ffmpeg", [
    "-y",
    "-i",
    sourceWebm,
    "-t",
    String(durationSeconds),
    "-vf",
    `fps=24,scale=${width}:${height}:flags=lanczos`,
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    outputVideo
  ], { stdio: "inherit" });
  execFileSync("ffmpeg", [
    "-y",
    "-ss",
    "00:00:02",
    "-i",
    outputVideo,
    "-frames:v",
    "1",
    "-update",
    "1",
    "-q:v",
    "2",
    outputPoster
  ], { stdio: "inherit" });

  console.log(`Created ${outputVideo}`);
  console.log(`Created ${outputPoster}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
