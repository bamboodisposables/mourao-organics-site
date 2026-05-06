#!/usr/bin/env python3

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
SOURCE_DIR = ASSETS_DIR / "product-photo-sources"

HERO_SIZE = (1600, 1960)
CARD_SIZE = (1200, 1395)
THUMB_SIZE = (800, 800)

SERIF_FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


@dataclass(frozen=True)
class ProductPhotoSpec:
    handle: str
    source_file: str
    hero_crop: tuple[float, float, float, float]
    card_crop: tuple[float, float, float, float]
    thumb_crops: tuple[tuple[float, float, float, float], ...]
    label_role: str
    label_boxes: dict[str, tuple[float, float, float]]
    blur_boxes: dict[str, tuple[tuple[float, float, float, float], ...]]
    warmth: float
    saturation: float
    contrast: float
    brightness: float
    sharpen: float


PRODUCTS: tuple[ProductPhotoSpec, ...] = (
    ProductPhotoSpec(
        handle="tallowcreme",
        source_file="tallowcreme-source.jpg",
        hero_crop=(0.08, 0.15, 0.94, 0.94),
        card_crop=(0.12, 0.18, 0.9, 0.92),
        thumb_crops=(
            (0.1, 0.22, 0.9, 0.86),
            (0.14, 0.18, 0.88, 0.82),
            (0.18, 0.2, 0.86, 0.84),
            (0.11, 0.16, 0.93, 0.8),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.5, 0.67, 0.25),
            "card": (0.5, 0.65, 0.28),
            "thumb": (0.5, 0.64, 0.32),
        },
        blur_boxes={
            "hero": ((0.22, 0.46, 0.78, 0.8),),
            "card": ((0.22, 0.46, 0.78, 0.79),),
            "thumb": ((0.2, 0.44, 0.8, 0.8),),
        },
        warmth=0.28,
        saturation=0.56,
        contrast=1.08,
        brightness=1.02,
        sharpen=1.08,
    ),
    ProductPhotoSpec(
        handle="gezichtscreme",
        source_file="gezichtscreme-source.jpg",
        hero_crop=(0.13, 0.16, 0.88, 0.78),
        card_crop=(0.16, 0.19, 0.86, 0.76),
        thumb_crops=(
            (0.16, 0.22, 0.84, 0.72),
            (0.19, 0.18, 0.83, 0.72),
            (0.15, 0.19, 0.87, 0.73),
            (0.18, 0.2, 0.82, 0.7),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.5, 0.56, 0.2),
            "card": (0.5, 0.54, 0.23),
            "thumb": (0.5, 0.54, 0.26),
        },
        blur_boxes={
            "hero": ((0.38, 0.46, 0.62, 0.63),),
            "card": ((0.37, 0.45, 0.63, 0.63),),
            "thumb": ((0.35, 0.43, 0.65, 0.65),),
        },
        warmth=0.12,
        saturation=0.92,
        contrast=1.04,
        brightness=1.02,
        sharpen=1.06,
    ),
    ProductPhotoSpec(
        handle="calming-skin-balm",
        source_file="calming-skin-balm-source.jpg",
        hero_crop=(0.18, 0.12, 0.82, 0.96),
        card_crop=(0.21, 0.14, 0.79, 0.93),
        thumb_crops=(
            (0.22, 0.16, 0.78, 0.88),
            (0.18, 0.13, 0.82, 0.9),
            (0.2, 0.1, 0.8, 0.84),
            (0.24, 0.14, 0.76, 0.86),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.5, 0.42, 0.26),
            "card": (0.5, 0.4, 0.28),
            "thumb": (0.5, 0.39, 0.32),
        },
        blur_boxes={
            "hero": ((0.34, 0.28, 0.66, 0.54),),
            "card": ((0.33, 0.26, 0.67, 0.54),),
            "thumb": ((0.3, 0.24, 0.7, 0.56),),
        },
        warmth=0.12,
        saturation=0.88,
        contrast=1.02,
        brightness=1.04,
        sharpen=1.06,
    ),
    ProductPhotoSpec(
        handle="bodylotion",
        source_file="bodylotion-source.jpg",
        hero_crop=(0.12, 0.08, 0.92, 0.98),
        card_crop=(0.16, 0.12, 0.88, 0.94),
        thumb_crops=(
            (0.18, 0.14, 0.84, 0.84),
            (0.14, 0.12, 0.86, 0.86),
            (0.16, 0.1, 0.9, 0.88),
            (0.2, 0.16, 0.82, 0.86),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.54, 0.58, 0.22),
            "card": (0.54, 0.57, 0.24),
            "thumb": (0.54, 0.57, 0.28),
        },
        blur_boxes={
            "hero": ((0.34, 0.31, 0.75, 0.76),),
            "card": ((0.34, 0.3, 0.76, 0.76),),
            "thumb": ((0.32, 0.28, 0.78, 0.78),),
        },
        warmth=0.1,
        saturation=0.86,
        contrast=1.06,
        brightness=1.03,
        sharpen=1.08,
    ),
    ProductPhotoSpec(
        handle="handcreme",
        source_file="handcreme-source.jpg",
        hero_crop=(0.1, 0.08, 0.92, 0.98),
        card_crop=(0.13, 0.12, 0.88, 0.92),
        thumb_crops=(
            (0.16, 0.14, 0.84, 0.86),
            (0.13, 0.1, 0.87, 0.86),
            (0.18, 0.12, 0.82, 0.82),
            (0.14, 0.08, 0.88, 0.84),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.5, 0.46, 0.2),
            "card": (0.5, 0.45, 0.22),
            "thumb": (0.5, 0.44, 0.26),
        },
        blur_boxes={
            "hero": ((0.39, 0.27, 0.61, 0.66),),
            "card": ((0.38, 0.26, 0.62, 0.66),),
            "thumb": ((0.36, 0.24, 0.64, 0.68),),
        },
        warmth=0.08,
        saturation=0.86,
        contrast=1.04,
        brightness=1.03,
        sharpen=1.06,
    ),
    ProductPhotoSpec(
        handle="lipbalm",
        source_file="lipbalm-source.jpg",
        hero_crop=(0.0, 0.04, 0.84, 0.84),
        card_crop=(0.02, 0.06, 0.84, 0.84),
        thumb_crops=(
            (0.04, 0.04, 0.84, 0.84),
            (0.08, 0.04, 0.82, 0.82),
            (0.02, 0.08, 0.82, 0.82),
            (0.08, 0.1, 0.8, 0.8),
        ),
        label_role="chip",
        label_boxes={
            "hero": (0.55, 0.71, 0.18),
            "card": (0.55, 0.69, 0.2),
            "thumb": (0.55, 0.69, 0.24),
        },
        blur_boxes={
            "hero": ((0.48, 0.42, 0.98, 0.92),),
            "card": ((0.46, 0.4, 0.98, 0.92),),
            "thumb": ((0.44, 0.38, 1.0, 0.94),),
        },
        warmth=0.08,
        saturation=0.86,
        contrast=1.05,
        brightness=1.03,
        sharpen=1.06,
    ),
)


def rgb(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    r, g, b = ImageColor.getrgb(value)
    return (r, g, b, alpha)


def fit_crop(image: Image.Image, crop_box: tuple[float, float, float, float], size: tuple[int, int]) -> Image.Image:
    width, height = image.size
    box = (
        int(width * crop_box[0]),
        int(height * crop_box[1]),
        int(width * crop_box[2]),
        int(height * crop_box[3]),
    )
    return ImageOps.fit(image.crop(box), size, method=Image.Resampling.LANCZOS)


def add_warm_grade(image: Image.Image, spec: ProductPhotoSpec) -> Image.Image:
    image = ImageEnhance.Color(image).enhance(spec.saturation)
    image = ImageEnhance.Contrast(image).enhance(spec.contrast)
    image = ImageEnhance.Brightness(image).enhance(spec.brightness)
    image = ImageEnhance.Sharpness(image).enhance(spec.sharpen)

    overlay = Image.new("RGBA", image.size, rgb("#e7cdb5", int(255 * spec.warmth)))
    image_rgba = image.convert("RGBA")
    image_rgba.alpha_composite(overlay)

    haze = Image.new("RGBA", image.size, (255, 255, 255, 0))
    haze_draw = ImageDraw.Draw(haze)
    width, height = image.size
    haze_draw.ellipse((-int(width * 0.06), -int(height * 0.05), int(width * 0.56), int(height * 0.34)), fill=(255, 247, 239, 42))
    haze_draw.ellipse((int(width * 0.54), int(height * 0.04), int(width * 1.02), int(height * 0.4)), fill=(255, 247, 239, 34))
    haze = haze.filter(ImageFilter.GaussianBlur(max(10, width // 28)))
    image_rgba.alpha_composite(haze)

    return image_rgba.convert("RGB")


def blur_regions(image: Image.Image, boxes: tuple[tuple[float, float, float, float], ...]) -> None:
    width, height = image.size
    for box in boxes:
        x0 = int(width * box[0])
        y0 = int(height * box[1])
        x1 = int(width * box[2])
        y1 = int(height * box[3])
        region = image.crop((x0, y0, x1, y1))
        blurred = region.filter(ImageFilter.GaussianBlur(max(10, (x1 - x0) // 9)))
        softened = Image.blend(region, blurred, 0.9)
        toned = Image.blend(softened, Image.new("RGB", region.size, ImageColor.getrgb("#efe3d7")), 0.22)

        mask = Image.new("L", region.size, 0)
        inset_x = max(8, region.size[0] // 14)
        inset_y = max(8, region.size[1] // 14)
        radius = max(18, min(region.size) // 5)
        ImageDraw.Draw(mask).rounded_rectangle(
            (inset_x, inset_y, region.size[0] - inset_x, region.size[1] - inset_y),
            radius=radius,
            fill=255,
        )
        mask = mask.filter(ImageFilter.GaussianBlur(max(16, min(region.size) // 6)))

        composite = region.copy()
        composite.paste(toned, (0, 0), mask)
        image.paste(composite, (x0, y0))


def build_chip_label(width: int) -> Image.Image:
    height = max(56, int(width * 0.38))
    canvas = Image.new("RGBA", (width + 22, height + 22), (0, 0, 0, 0))

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_mask = Image.new("L", canvas.size, 0)
    radius = int(height * 0.34)
    ImageDraw.Draw(shadow_mask).rounded_rectangle((10, 12, width + 9, height + 11), radius=radius, fill=130)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(10))
    shadow.paste((86, 60, 42, 64), (0, 0), shadow_mask)
    canvas.alpha_composite(shadow)

    label = Image.new("RGBA", (width, height), rgb("#f7efe6"))
    mask = Image.new("L", label.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, fill=255)
    label.putalpha(mask)

    edge = Image.new("RGBA", label.size, (0, 0, 0, 0))
    edge_draw = ImageDraw.Draw(edge)
    edge_draw.rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, outline=(178, 141, 108, 210), width=max(2, width // 90))
    edge_draw.rounded_rectangle((max(4, width // 26), max(4, height // 10), width - max(4, width // 26), height - max(4, height // 10)), radius=max(12, radius - 10), outline=(255, 248, 240, 88), width=1)
    label.alpha_composite(edge)

    serif = ImageFont.truetype(SERIF_FONT, max(18, int(height * 0.42)))
    sans = ImageFont.truetype(SANS_FONT, max(8, int(height * 0.16)))
    draw = ImageDraw.Draw(label)
    title = "MOURÃO"
    subtitle = "ORGANICS"
    title_box = draw.textbbox((0, 0), title, font=serif)
    subtitle_box = draw.textbbox((0, 0), subtitle, font=sans)
    title_w = title_box[2] - title_box[0]
    subtitle_w = subtitle_box[2] - subtitle_box[0]
    subtitle_h = subtitle_box[3] - subtitle_box[1]
    draw.text(((width - title_w) / 2, height * 0.13), title, font=serif, fill=(69, 46, 33, 255))
    draw.text(((width - subtitle_w) / 2, height * 0.64 - subtitle_h / 2), subtitle, font=sans, fill=(118, 91, 68, 255))
    draw.line((width * 0.21, height * 0.8, width * 0.79, height * 0.8), fill=(196, 168, 142, 120), width=max(1, width // 120))

    canvas.alpha_composite(label, (11, 11))
    return canvas


def build_roundel(size: int, logo: Image.Image) -> Image.Image:
    roundel = ImageOps.fit(logo.convert("RGBA"), (size, size), method=Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", roundel.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse((0, 0, size - 1, size - 1), fill=(78, 56, 38, 52))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(8, size // 10)))
    shadow.alpha_composite(roundel)
    return shadow


def paste_centered(base: Image.Image, overlay: Image.Image, center: tuple[float, float]) -> None:
    x = int(center[0] - overlay.width / 2)
    y = int(center[1] - overlay.height / 2)
    base.alpha_composite(overlay, (x, y))


def add_label(image: Image.Image, spec: ProductPhotoSpec, role: str, logo: Image.Image) -> Image.Image:
    width, height = image.size
    cx, cy, span = spec.label_boxes[role]
    if spec.label_role == "roundel":
        overlay = build_roundel(int(width * span), logo)
    else:
        overlay = build_chip_label(int(width * span))
    rgba = image.convert("RGBA")
    paste_centered(rgba, overlay, (width * cx, height * cy))
    return rgba.convert("RGB")


def save_jpeg(image: Image.Image, path: Path) -> None:
    image.save(path, format="JPEG", quality=93, optimize=True, progressive=True)


def build_asset(image: Image.Image, crop: tuple[float, float, float, float], size: tuple[int, int], spec: ProductPhotoSpec, role: str, logo: Image.Image) -> Image.Image:
    asset = fit_crop(image, crop, size)
    asset = add_warm_grade(asset, spec)
    blur_regions(asset, spec.blur_boxes[role])
    asset = add_label(asset, spec, role, logo)
    return asset


def main() -> None:
    logo = Image.open(ASSETS_DIR / "mourao-logo.png").convert("RGBA")
    for spec in PRODUCTS:
        source = Image.open(SOURCE_DIR / spec.source_file).convert("RGB")
        hero = build_asset(source, spec.hero_crop, HERO_SIZE, spec, "hero", logo)
        card = build_asset(source, spec.card_crop, CARD_SIZE, spec, "card", logo)
        save_jpeg(hero, ASSETS_DIR / f"mourao-product-{spec.handle}-hero.jpg")
        save_jpeg(card, ASSETS_DIR / f"mourao-product-{spec.handle}-card.jpg")
        for index, crop in enumerate(spec.thumb_crops, start=1):
            thumb = build_asset(source, crop, THUMB_SIZE, spec, "thumb", logo)
            save_jpeg(thumb, ASSETS_DIR / f"mourao-product-{spec.handle}-thumb-{index}.jpg")


if __name__ == "__main__":
    main()
