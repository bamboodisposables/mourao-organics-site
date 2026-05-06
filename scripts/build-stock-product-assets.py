#!/usr/bin/env python3

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.request import urlretrieve

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
STOCK_DIR = ROOT / "tmp" / "stock"
LOGO_PATH = ASSETS_DIR / "mourao-logo.jpg"

SERIF_FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"

HERO_SIZE = (1600, 1960)
CARD_SIZE = (1200, 1395)
THUMB_SIZE = (800, 800)
THUMB_VARIATIONS = (
    (-0.05, -0.03, 1.03),
    (0.05, -0.02, 1.08),
    (-0.03, 0.05, 1.1),
    (0.06, 0.07, 1.15),
)


@dataclass(frozen=True)
class LabelSpec:
    kind: str
    center: tuple[float, float]
    scale: float
    rotation: float = 0.0


@dataclass(frozen=True)
class CleanupZone:
    blur_box: tuple[float, float, float, float]
    tint_box: tuple[float, float, float, float]
    blur_fill: int = 188
    tint_fill: int = 104


@dataclass(frozen=True)
class ProductSpec:
    handle: str
    title: str
    source_url: str
    source_file: str
    focus: tuple[float, float]
    zoom: float
    label: LabelSpec


PRODUCTS: tuple[ProductSpec, ...] = (
    ProductSpec(
        handle="tallowcreme",
        title="Tallowcrème",
        source_url="https://unsplash.com/photos/vbt81PHaOh0/download?force=true&w=1800",
        source_file="tallowcreme.jpg",
        focus=(0.52, 0.48),
        zoom=1.28,
        label=LabelSpec(kind="paper", center=(0.5, 0.67), scale=0.44, rotation=-2),
    ),
    ProductSpec(
        handle="gezichtscreme",
        title="Gezichtscrème",
        source_url="https://unsplash.com/photos/_BHxQy-OTmM/download?force=true&w=1800",
        source_file="gezichtscreme.jpg",
        focus=(0.54, 0.49),
        zoom=1.72,
        label=LabelSpec(kind="paper", center=(0.52, 0.58), scale=0.31, rotation=-2),
    ),
    ProductSpec(
        handle="calming-skin-balm",
        title="Calming Skin Balm",
        source_url="https://unsplash.com/photos/qD1TBs6H1Xg/download?force=true&w=1800",
        source_file="calming-skin-balm.jpg",
        focus=(0.43, 0.53),
        zoom=1.48,
        label=LabelSpec(kind="paper", center=(0.56, 0.56), scale=0.31, rotation=-3),
    ),
    ProductSpec(
        handle="bodylotion",
        title="Bodylotion",
        source_url="https://unsplash.com/photos/RaHplSC06vE/download?force=true&w=1800",
        source_file="bodylotion.jpg",
        focus=(0.47, 0.5),
        zoom=1.24,
        label=LabelSpec(kind="paper", center=(0.51, 0.66), scale=0.36, rotation=2),
    ),
    ProductSpec(
        handle="handcreme",
        title="Handcrème",
        source_url="https://unsplash.com/photos/p5McdaDiclY/download?force=true&w=1800",
        source_file="handcreme.jpg",
        focus=(0.48, 0.46),
        zoom=1.22,
        label=LabelSpec(kind="paper", center=(0.5, 0.62), scale=0.34, rotation=-2),
    ),
    ProductSpec(
        handle="lipbalm",
        title="Lipbalm",
        source_url="https://unsplash.com/photos/59qh0Sdjn-Y/download?force=true&w=1800",
        source_file="lipbalm.jpg",
        focus=(0.46, 0.49),
        zoom=1.1,
        label=LabelSpec(kind="seal", center=(0.72, 0.74), scale=0.28),
    ),
)


def ensure_source(spec: ProductSpec) -> Path:
    STOCK_DIR.mkdir(parents=True, exist_ok=True)
    destination = STOCK_DIR / spec.source_file
    if not destination.exists():
        urlretrieve(spec.source_url, destination)
    return destination


def focal_crop(image: Image.Image, size: tuple[int, int], focus: tuple[float, float], zoom: float) -> Image.Image:
    src_w, src_h = image.size
    target_w, target_h = size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        base_crop_h = src_h
        base_crop_w = src_h * target_ratio
    else:
        base_crop_w = src_w
        base_crop_h = src_w / target_ratio

    crop_w = max(1, min(src_w, base_crop_w / max(zoom, 1)))
    crop_h = max(1, min(src_h, base_crop_h / max(zoom, 1)))

    center_x = focus[0] * src_w
    center_y = focus[1] * src_h
    left = max(0, min(src_w - crop_w, center_x - crop_w / 2))
    top = max(0, min(src_h - crop_h, center_y - crop_h / 2))
    crop_box = (
        int(round(left)),
        int(round(top)),
        int(round(left + crop_w)),
        int(round(top + crop_h)),
    )

    cropped = image.crop(crop_box)
    return cropped.resize(size, Image.Resampling.LANCZOS)


def warm_grade(image: Image.Image) -> Image.Image:
    graded = image.convert("RGB")
    graded = ImageEnhance.Color(graded).enhance(0.94)
    graded = ImageEnhance.Contrast(graded).enhance(1.04)
    graded = ImageEnhance.Brightness(graded).enhance(1.07)
    graded = Image.blend(graded, Image.new("RGB", graded.size, "#ead6c0"), 0.08)
    return graded.convert("RGBA")


CLEANUP_ZONES: dict[str, tuple[CleanupZone, ...]] = {
    "tallowcreme": (
        CleanupZone(
            blur_box=(0.18, 0.56, 0.74, 0.82),
            tint_box=(0.2, 0.58, 0.7, 0.83),
        ),
    ),
    "bodylotion": (
        CleanupZone(
            blur_box=(0.16, 0.14, 0.66, 0.89),
            tint_box=(0.2, 0.24, 0.61, 0.86),
            blur_fill=206,
            tint_fill=116,
        ),
        CleanupZone(
            blur_box=(0.2, 0.52, 0.58, 0.92),
            tint_box=(0.23, 0.58, 0.56, 0.9),
            blur_fill=172,
            tint_fill=88,
        ),
    ),
    "handcreme": (
        CleanupZone(
            blur_box=(0.17, 0.12, 0.69, 0.91),
            tint_box=(0.21, 0.22, 0.63, 0.87),
            blur_fill=208,
            tint_fill=116,
        ),
        CleanupZone(
            blur_box=(0.24, 0.48, 0.6, 0.92),
            tint_box=(0.27, 0.56, 0.58, 0.89),
            blur_fill=174,
            tint_fill=90,
        ),
    ),
    "gezichtscreme": (
        CleanupZone(
            blur_box=(0.31, 0.38, 0.69, 0.67),
            tint_box=(0.34, 0.42, 0.66, 0.66),
            blur_fill=166,
            tint_fill=82,
        ),
    ),
    "calming-skin-balm": (
        CleanupZone(
            blur_box=(0.28, 0.13, 0.72, 0.6),
            tint_box=(0.32, 0.19, 0.68, 0.57),
            blur_fill=188,
            tint_fill=94,
        ),
    ),
    "lipbalm": (
        CleanupZone(
            blur_box=(0.42, 0.38, 0.99, 0.96),
            tint_box=(0.48, 0.44, 0.96, 0.91),
            blur_fill=202,
            tint_fill=110,
        ),
        CleanupZone(
            blur_box=(0.38, 0.18, 0.84, 0.58),
            tint_box=(0.42, 0.23, 0.81, 0.55),
            blur_fill=182,
            tint_fill=96,
        ),
    ),
}


def neutralize_packaging(image: Image.Image, handle: str) -> Image.Image:
    zones = CLEANUP_ZONES.get(handle)
    if not zones:
        return image

    canvas = image.copy().convert("RGBA")
    width, height = canvas.size

    for zone in zones:
        mask = Image.new("L", canvas.size, 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle(
            (
                int(width * zone.blur_box[0]),
                int(height * zone.blur_box[1]),
                int(width * zone.blur_box[2]),
                int(height * zone.blur_box[3]),
            ),
            radius=int(height * 0.06),
            fill=zone.blur_fill,
        )
        mask = mask.filter(ImageFilter.GaussianBlur(radius=max(16, width // 50)))

        blurred_canvas = canvas.filter(ImageFilter.GaussianBlur(radius=max(10, width // 70)))
        canvas = Image.composite(blurred_canvas, canvas, mask)

        tint = Image.new("RGBA", canvas.size, (244, 236, 226, 0))
        tint_mask = Image.new("L", canvas.size, 0)
        tint_draw = ImageDraw.Draw(tint_mask)
        tint_draw.ellipse(
            (
                int(width * zone.tint_box[0]),
                int(height * zone.tint_box[1]),
                int(width * zone.tint_box[2]),
                int(height * zone.tint_box[3]),
            ),
            fill=zone.tint_fill,
        )
        tint_mask = tint_mask.filter(ImageFilter.GaussianBlur(radius=max(18, width // 42)))
        tint.putalpha(tint_mask)
        canvas.alpha_composite(tint)
    return canvas


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def paste_centered(base: Image.Image, overlay: Image.Image, center: tuple[int, int]) -> None:
    x = int(center[0] - overlay.width / 2)
    y = int(center[1] - overlay.height / 2)
    base.alpha_composite(overlay, (x, y))


def build_paper_label(canvas_size: tuple[int, int], scale: float, rotation: float) -> Image.Image:
    width = int(canvas_size[0] * scale)
    height = int(width * 0.43)
    label = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (width + 24, height + 24), (0, 0, 0, 0))
    shadow_mask = Image.new("L", shadow.size, 0)
    shadow_draw = ImageDraw.Draw(shadow_mask)
    shadow_draw.rounded_rectangle((12, 12, width + 11, height + 11), radius=int(height * 0.28), fill=120)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(12))
    shadow.paste((88, 58, 36, 48), (0, 0), shadow_mask)

    draw = ImageDraw.Draw(label)
    radius = int(height * 0.28)
    draw.rounded_rectangle(
        (0, 0, width - 1, height - 1),
        radius=radius,
        fill=(249, 242, 233, 240),
        outline=(171, 133, 101, 205),
        width=max(2, width // 90),
    )

    serif = ImageFont.truetype(SERIF_FONT, max(18, int(height * 0.35)))
    sans = ImageFont.truetype(SANS_FONT, max(10, int(height * 0.14)))
    title = "MOURÃO"
    subtitle = "ORGANICS"
    title_w, title_h = text_size(draw, title, serif)
    subtitle_w, subtitle_h = text_size(draw, subtitle, sans)
    draw.text(((width - title_w) / 2, height * 0.18), title, font=serif, fill=(63, 41, 29, 255))
    draw.text(
        ((width - subtitle_w) / 2, height * 0.62 - subtitle_h / 2),
        subtitle,
        font=sans,
        fill=(126, 96, 72, 255),
        spacing=2,
    )

    composed = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    composed.alpha_composite(shadow)
    composed.alpha_composite(label, (12, 12))
    if rotation:
        composed = composed.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    return composed


def build_seal(canvas_size: tuple[int, int], scale: float, rotation: float, logo: Image.Image) -> Image.Image:
    diameter = int(min(canvas_size) * scale)
    seal = ImageOps.fit(logo, (diameter, diameter), Image.Resampling.LANCZOS).convert("RGBA")
    border = Image.new("RGBA", seal.size, (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border)
    border_draw.ellipse((0, 0, diameter - 1, diameter - 1), outline=(125, 86, 56, 190), width=max(3, diameter // 42))
    seal.alpha_composite(border)

    shadow = Image.new("RGBA", (diameter + 28, diameter + 28), (0, 0, 0, 0))
    shadow_mask = Image.new("L", shadow.size, 0)
    shadow_draw = ImageDraw.Draw(shadow_mask)
    shadow_draw.ellipse((14, 14, diameter + 13, diameter + 13), fill=125)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(16))
    shadow.paste((79, 51, 31, 64), (0, 0), shadow_mask)

    composed = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    composed.alpha_composite(shadow)
    composed.alpha_composite(seal, (14, 14))
    if rotation:
        composed = composed.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    return composed


def add_label(image: Image.Image, label: LabelSpec, logo: Image.Image) -> Image.Image:
    canvas = image.copy().convert("RGBA")
    center = (int(canvas.width * label.center[0]), int(canvas.height * label.center[1]))
    overlay = (
        build_seal(canvas.size, label.scale, label.rotation, logo)
        if label.kind == "seal"
        else build_paper_label(canvas.size, label.scale, label.rotation)
    )
    paste_centered(canvas, overlay, center)
    return canvas


def build_variant(
    handle: str,
    source: Image.Image,
    size: tuple[int, int],
    focus: tuple[float, float],
    zoom: float,
    label: LabelSpec,
    logo: Image.Image,
) -> Image.Image:
    cropped = focal_crop(source, size, focus, zoom)
    graded = warm_grade(cropped)
    cleaned = neutralize_packaging(graded, handle)
    branded = add_label(cleaned, label, logo)
    return branded.convert("RGB")


def save_jpeg(image: Image.Image, path: Path) -> None:
    image.save(path, format="JPEG", quality=91, optimize=True, progressive=True)


def main() -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    for spec in PRODUCTS:
        source_path = ensure_source(spec)
        source = Image.open(source_path).convert("RGB")

        hero = build_variant(spec.handle, source, HERO_SIZE, spec.focus, spec.zoom, spec.label, logo)
        card = build_variant(spec.handle, source, CARD_SIZE, spec.focus, spec.zoom * 0.92, spec.label, logo)
        save_jpeg(hero, ASSETS_DIR / f"mourao-product-{spec.handle}-hero.jpg")
        save_jpeg(card, ASSETS_DIR / f"mourao-product-{spec.handle}-card.jpg")

        for index, (dx, dy, extra_zoom) in enumerate(THUMB_VARIATIONS, start=1):
            thumb_focus = (
                max(0.0, min(1.0, spec.focus[0] + dx)),
                max(0.0, min(1.0, spec.focus[1] + dy)),
            )
            thumb = build_variant(spec.handle, source, THUMB_SIZE, thumb_focus, spec.zoom * extra_zoom, spec.label, logo)
            save_jpeg(thumb, ASSETS_DIR / f"mourao-product-{spec.handle}-thumb-{index}.jpg")


if __name__ == "__main__":
    main()
