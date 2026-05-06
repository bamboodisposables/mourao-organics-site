#!/usr/bin/env python3

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
LOGO_PATH = ASSETS_DIR / "mourao-logo.jpg"

SERIF_FONT = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"

HERO_SIZE = (1600, 1960)
CARD_SIZE = (1200, 1395)
THUMB_SIZE = (800, 800)
THUMB_VARIANTS = (
    (-0.03, -0.02, -3),
    (0.04, -0.01, 2),
    (-0.02, 0.03, -5),
    (0.05, 0.04, 4),
)


@dataclass(frozen=True)
class ProductSpec:
    handle: str
    package: str
    bg_top: str
    bg_bottom: str
    glow: str
    primary: str
    secondary: str
    cream: str
    accent: str
    props: tuple[str, ...]
    label_style: str
    rotation: int = 0


PRODUCTS: tuple[ProductSpec, ...] = (
    ProductSpec(
        handle="tallowcreme",
        package="jar_wood",
        bg_top="#f4e5d7",
        bg_bottom="#ecd7c4",
        glow="#fff3e6",
        primary="#9a5f45",
        secondary="#c98767",
        cream="#f3e3c6",
        accent="#7b5032",
        props=("cloth", "shea_dish"),
        label_style="paper",
    ),
    ProductSpec(
        handle="gezichtscreme",
        package="jar_frosted",
        bg_top="#f4eee6",
        bg_bottom="#eadbc8",
        glow="#fff9f3",
        primary="#ebe7e1",
        secondary="#f8f5ef",
        cream="#efe5d4",
        accent="#ba9a72",
        props=("coaster", "oats", "droplets"),
        label_style="paper",
    ),
    ProductSpec(
        handle="calming-skin-balm",
        package="jar_soft",
        bg_top="#f2eadf",
        bg_bottom="#e8d7c7",
        glow="#f7f2e6",
        primary="#d6cabd",
        secondary="#efe5d8",
        cream="#f0e6d6",
        accent="#93a588",
        props=("leaves", "petals"),
        label_style="paper",
    ),
    ProductSpec(
        handle="bodylotion",
        package="pump_bottle",
        bg_top="#f1ece6",
        bg_bottom="#e1d4c7",
        glow="#fbf7f2",
        primary="#b8a191",
        secondary="#d9c4b6",
        cream="#f4eee8",
        accent="#6a574b",
        props=("pebble", "oil_drops"),
        label_style="paper",
        rotation=3,
    ),
    ProductSpec(
        handle="handcreme",
        package="tube",
        bg_top="#f6ebe8",
        bg_bottom="#edd9d2",
        glow="#fff6f3",
        primary="#eadfdf",
        secondary="#f8f1ef",
        cream="#f5e8dd",
        accent="#b7968a",
        props=("blush_glow", "beeswax"),
        label_style="paper",
        rotation=-5,
    ),
    ProductSpec(
        handle="lipbalm",
        package="tin_open",
        bg_top="#f4efe8",
        bg_bottom="#e9ddd1",
        glow="#fffaf5",
        primary="#d2d3d4",
        secondary="#f1f1f1",
        cream="#efe2ba",
        accent="#bfa38a",
        props=("stems", "beeswax"),
        label_style="seal",
    ),
)


def rgb(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4)) + (alpha,)


def lerp(a: int, b: int, t: float) -> int:
    return int(round(a + (b - a) * t))


def vertical_gradient(size: tuple[int, int], top: str, bottom: str) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)
    top_rgba = rgb(top)
    bottom_rgba = rgb(bottom)
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(lerp(top_rgba[i], bottom_rgba[i], t) for i in range(4))
        draw.line((0, y, width, y), fill=color)
    return image


def horizontal_gradient(size: tuple[int, int], left: str, right: str) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)
    left_rgba = rgb(left)
    right_rgba = rgb(right)
    for x in range(width):
        t = x / max(1, width - 1)
        color = tuple(lerp(left_rgba[i], right_rgba[i], t) for i in range(4))
        draw.line((x, 0, x, height), fill=color)
    return image


def grain_overlay(size: tuple[int, int], alpha: int = 16, sigma: float = 18, tint: str = "#9f7f66") -> Image.Image:
    noise = Image.effect_noise(size, sigma).convert("L")
    noise = ImageOps.autocontrast(noise)
    noise = noise.point(lambda value: int(value * alpha / 255))
    overlay = Image.new("RGBA", size, rgb(tint, 0))
    overlay.putalpha(noise)
    return overlay


def wood_texture(size: tuple[int, int], top: str, bottom: str) -> Image.Image:
    texture = vertical_gradient(size, top, bottom)
    rings = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(rings)
    cx, cy = size[0] // 2, size[1] // 2
    for step in range(10, max(size) // 2, max(8, max(size) // 26)):
        draw.ellipse((cx - step, cy - step, cx + step, cy + step), outline=(110, 72, 43, max(16, 58 - step // 8)), width=2)
    texture.alpha_composite(rings)

    fibers = Image.new("RGBA", size, (0, 0, 0, 0))
    fibers_draw = ImageDraw.Draw(fibers)
    spacing = max(10, size[1] // 28)
    for offset in range(-size[1], size[0], spacing):
        fibers_draw.line((offset, 0, offset + size[1], size[1]), fill=(140, 97, 62, 18), width=max(2, spacing // 7))
    fibers = fibers.filter(ImageFilter.GaussianBlur(max(2, size[0] // 140)))
    texture.alpha_composite(fibers)
    texture.alpha_composite(grain_overlay(size, alpha=18, sigma=22, tint="#7a5335"))
    return texture


def metal_texture(size: tuple[int, int], top: str, bottom: str, horizontal: bool = False) -> Image.Image:
    base = vertical_gradient(size, top, bottom)
    if horizontal:
        base = base.rotate(90, expand=True).resize(size, Image.Resampling.BICUBIC)
    sheen = Image.new("RGBA", size, (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen)
    for ratio, alpha in ((0.16, 72), (0.3, 38), (0.72, 42)):
        x = int(size[0] * ratio)
        sheen_draw.rectangle((x, 0, x + max(8, size[0] // 18), size[1]), fill=(255, 255, 255, alpha))
    sheen = sheen.filter(ImageFilter.GaussianBlur(max(4, size[0] // 40)))
    base.alpha_composite(sheen)
    base.alpha_composite(grain_overlay(size, alpha=8, sigma=12, tint="#ffffff"))
    return base


def add_inner_shadow(image: Image.Image, alpha: int = 70) -> Image.Image:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.rounded_rectangle((0, 0, image.size[0] - 1, image.size[1] - 1), radius=max(8, min(image.size) // 8), outline=(88, 63, 48, alpha), width=max(6, min(image.size) // 32))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(6, min(image.size) // 26)))
    image.alpha_composite(shadow)
    return image


def make_mask(size: tuple[int, int], kind: str = "ellipse", radius: int = 0) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    if kind == "ellipse":
        draw.ellipse((0, 0, size[0] - 1, size[1] - 1), fill=255)
    elif kind == "roundrect":
        draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    elif kind == "rect":
        draw.rectangle((0, 0, size[0] - 1, size[1] - 1), fill=255)
    return mask


def masked_gradient(size: tuple[int, int], top: str, bottom: str, kind: str = "ellipse", radius: int = 0) -> Image.Image:
    gradient = vertical_gradient(size, top, bottom)
    gradient.putalpha(make_mask(size, kind=kind, radius=radius))
    return gradient


def alpha_box(size: tuple[int, int], alpha: int, kind: str = "ellipse", radius: int = 0) -> Image.Image:
    overlay = Image.new("RGBA", size, (255, 255, 255, alpha))
    overlay.putalpha(make_mask(size, kind=kind, radius=radius))
    return overlay


def draw_blurred_shape(canvas: Image.Image, bbox: tuple[int, int, int, int], fill: tuple[int, int, int, int], blur: int, kind: str = "ellipse", radius: int = 0) -> None:
    width = max(1, bbox[2] - bbox[0])
    height = max(1, bbox[3] - bbox[1])
    pad = blur * 3 if blur else 0
    shape = Image.new("RGBA", (width + pad * 2, height + pad * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shape)
    if kind == "ellipse":
        draw.ellipse((pad, pad, pad + width - 1, pad + height - 1), fill=fill)
    elif kind == "roundrect":
        draw.rounded_rectangle((pad, pad, pad + width - 1, pad + height - 1), radius=radius, fill=fill)
    else:
        draw.rectangle((pad, pad, pad + width - 1, pad + height - 1), fill=fill)
    if blur:
        shape = shape.filter(ImageFilter.GaussianBlur(blur))
    dest_x = bbox[0] - pad
    dest_y = bbox[1] - pad
    src_x = max(0, -dest_x)
    src_y = max(0, -dest_y)
    dest_x = max(0, dest_x)
    dest_y = max(0, dest_y)
    crop_w = min(shape.width - src_x, canvas.width - dest_x)
    crop_h = min(shape.height - src_y, canvas.height - dest_y)
    if crop_w <= 0 or crop_h <= 0:
        return
    canvas.alpha_composite(shape.crop((src_x, src_y, src_x + crop_w, src_y + crop_h)), (dest_x, dest_y))


def apply_alpha_fade(image: Image.Image, top_alpha: int, bottom_alpha: int) -> Image.Image:
    fade = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(fade)
    width, height = image.size
    for y in range(height):
        t = y / max(1, height - 1)
        alpha = lerp(top_alpha, bottom_alpha, t)
        draw.line((0, y, width, y), fill=alpha)
    alpha_channel = ImageChops.multiply(image.getchannel("A"), fade)
    image.putalpha(alpha_channel)
    return image


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def paste_centered(base: Image.Image, overlay: Image.Image, center: tuple[int, int]) -> None:
    x = int(center[0] - overlay.width / 2)
    y = int(center[1] - overlay.height / 2)
    base.alpha_composite(overlay, (x, y))


def add_material_depth(image: Image.Image, light_alpha: int = 72, dark_alpha: int = 42, rim_alpha: int = 46) -> Image.Image:
    width, height = image.size
    mask = image.getchannel("A")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw_blurred_shape(overlay, (int(width * -0.04), int(height * -0.08), int(width * 0.34), int(height * 1.02)), (255, 255, 255, light_alpha), blur=max(8, width // 14), kind="ellipse")
    draw_blurred_shape(overlay, (int(width * 0.54), int(height * 0.04), int(width * 1.08), int(height * 1.04)), (101, 77, 60, dark_alpha), blur=max(8, width // 12), kind="ellipse")
    draw_blurred_shape(overlay, (int(width * 0.12), int(height * -0.08), int(width * 0.88), int(height * 0.2)), (255, 255, 255, rim_alpha), blur=max(6, width // 18), kind="ellipse")
    draw_blurred_shape(overlay, (int(width * 0.18), int(height * 0.76), int(width * 0.92), int(height * 1.08)), (112, 83, 61, max(18, dark_alpha - 10)), blur=max(8, width // 16), kind="ellipse")
    image.alpha_composite(overlay)
    image.putalpha(mask)
    return image


def build_paper_label(width: int) -> Image.Image:
    height = int(width * 0.43)
    label = Image.new("RGBA", (width + 28, height + 28), (0, 0, 0, 0))

    shadow = Image.new("RGBA", label.size, (0, 0, 0, 0))
    shadow_mask = Image.new("L", label.size, 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle((14, 16, width + 9, height + 11), radius=int(height * 0.3), fill=118)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(12))
    shadow.paste((89, 60, 40, 54), (0, 0), shadow_mask)
    label.alpha_composite(shadow)

    body = masked_gradient((width, height), "#fbf5ee", "#eee0d1", kind="roundrect", radius=int(height * 0.29))
    body.alpha_composite(grain_overlay(body.size, alpha=8, sigma=7, tint="#ceb29a"))
    body_draw = ImageDraw.Draw(body)
    radius = int(height * 0.29)
    body_draw.rounded_rectangle(
        (0, 0, width - 1, height - 1),
        radius=radius,
        outline=(171, 133, 101, 212),
        width=max(2, width // 82),
    )
    body_draw.rounded_rectangle(
        (max(3, width // 46), max(3, height // 12), width - max(4, width // 46), height - max(4, height // 12)),
        radius=max(12, radius - max(6, width // 32)),
        outline=(255, 250, 243, 72),
        width=max(1, width // 120),
    )
    sheen = Image.new("RGBA", body.size, (0, 0, 0, 0))
    draw_blurred_shape(sheen, (int(width * 0.04), -int(height * 0.18), int(width * 0.6), int(height * 0.76)), (255, 255, 255, 82), blur=max(8, width // 18), kind="ellipse")
    draw_blurred_shape(sheen, (int(width * 0.32), int(height * 0.56), int(width * 0.92), int(height * 1.04)), (155, 123, 95, 36), blur=max(10, width // 16), kind="ellipse")
    body.alpha_composite(sheen)

    serif = ImageFont.truetype(SERIF_FONT, max(18, int(height * 0.36)))
    sans = ImageFont.truetype(SANS_FONT, max(9, int(height * 0.14)))
    title = "MOURÃO"
    subtitle = "ORGANICS"
    title_w, _ = text_size(body_draw, title, serif)
    subtitle_w, subtitle_h = text_size(body_draw, subtitle, sans)
    body_draw.text(((width - title_w) / 2, height * 0.16), title, font=serif, fill=(66, 44, 32, 255))
    body_draw.text(((width - subtitle_w) / 2, height * 0.61 - subtitle_h / 2), subtitle, font=sans, fill=(122, 95, 71, 255))
    body_draw.line((width * 0.2, height * 0.78, width * 0.8, height * 0.78), fill=(188, 159, 132, 108), width=max(1, width // 120))

    label.alpha_composite(body, (14, 14))
    return label


def build_wood_roundel(diameter: int, logo: Image.Image) -> Image.Image:
    disc = masked_gradient((diameter, diameter), "#d9a46d", "#af7648", kind="ellipse")
    rings = Image.new("RGBA", disc.size, (0, 0, 0, 0))
    rings_draw = ImageDraw.Draw(rings)
    for step in range(10, diameter // 2, max(9, diameter // 22)):
        alpha = max(18, 78 - step // 4)
        rings_draw.ellipse((diameter // 2 - step, diameter // 2 - step, diameter // 2 + step, diameter // 2 + step), outline=(114, 73, 42, alpha), width=2)
    disc.alpha_composite(rings)
    border = Image.new("RGBA", disc.size, (0, 0, 0, 0))
    ImageDraw.Draw(border).ellipse((0, 0, diameter - 1, diameter - 1), outline=(118, 77, 48, 200), width=max(3, diameter // 40))
    disc.alpha_composite(border)
    seal = ImageOps.fit(logo, (int(diameter * 0.78), int(diameter * 0.78)), Image.Resampling.LANCZOS).convert("RGBA")
    paste_centered(disc, seal, (diameter // 2, diameter // 2))
    return disc


def build_background(spec: ProductSpec, size: tuple[int, int], role: str, variant: int) -> Image.Image:
    canvas = vertical_gradient(size, spec.bg_top, spec.bg_bottom)
    width, height = size

    glow_blur = 64 if role == "hero" else 48 if role == "card" else 34
    core_top = 0.16 if role == "hero" else 0.18 if role == "card" else 0.14
    surface_top = 0.74 if role == "hero" else 0.77 if role == "card" else 0.8

    side_light = horizontal_gradient(size, "#fff9f2", spec.bg_bottom)
    side_light.putalpha(44 if role == "hero" else 36)
    canvas.alpha_composite(side_light)
    draw_blurred_shape(canvas, (-int(width * 0.08), -int(height * 0.04), int(width * 0.6), int(height * 0.34)), (255, 250, 244, 88), blur=max(42, width // 16), kind="ellipse")
    draw_blurred_shape(canvas, (int(width * 0.18), int(height * core_top), int(width * 0.82), int(height * 0.72)), rgb(spec.glow, 118 if role == "hero" else 102), blur=glow_blur, kind="ellipse")
    ring_alpha = 0 if spec.handle in {"bodylotion", "lipbalm"} else 2
    draw_blurred_shape(canvas, (int(width * 0.34), int(height * 0.32), int(width * 0.66), int(height * 0.84)), rgb("#7a604e", ring_alpha), blur=max(44, width // 18), kind="ellipse")
    draw_blurred_shape(canvas, (-int(width * 0.06), int(height * 0.68), int(width * 1.06), int(height * 1.04)), rgb("#ccb39d", 92), blur=max(14, width // 30), kind="roundrect", radius=max(24, width // 24))
    draw_blurred_shape(canvas, (int(width * 0.12), int(height * surface_top), int(width * 0.88), int(height * 0.98)), rgb("#fff7ef", 54), blur=max(16, width // 28), kind="ellipse")
    draw_blurred_shape(canvas, (int(width * 0.2), int(height * (surface_top - 0.02)), int(width * 0.8), int(height * 0.88)), rgb("#ffffff", 26), blur=max(18, width // 26), kind="ellipse")
    draw_blurred_shape(canvas, (int(width * 0.24), int(height * 0.14), int(width * 0.82), int(height * 0.58)), (255, 255, 255, 34), blur=max(24, width // 24), kind="ellipse")
    draw_blurred_shape(canvas, (int(width * 0.08), -int(height * 0.02), int(width * 0.22), int(height * 0.46)), (255, 255, 255, 22), blur=max(28, width // 18), kind="roundrect", radius=max(18, width // 30))
    draw_blurred_shape(canvas, (int(width * 0.23), -int(height * 0.04), int(width * 0.31), int(height * 0.38)), (255, 255, 255, 14), blur=max(24, width // 20), kind="roundrect", radius=max(16, width // 32))
    draw_blurred_shape(canvas, (int(width * 0.02), int(height * 0.26), int(width * 0.24), int(height * 0.92)), (122, 97, 76, 12), blur=max(32, width // 18), kind="ellipse")

    veil = Image.new("RGBA", size, (255, 255, 255, 0))
    veil_draw = ImageDraw.Draw(veil)
    stripe_alpha = 1 if variant == 0 else 0
    for offset in range(-height, width, max(64, width // 14)):
        veil_draw.line((offset, 0, offset + height, height), fill=(255, 248, 241, stripe_alpha), width=max(16, width // 24))
    veil = veil.filter(ImageFilter.GaussianBlur(max(10, width // 96)))
    canvas.alpha_composite(veil)
    canvas.alpha_composite(grain_overlay(size, alpha=8 if variant == 0 else 7, sigma=13, tint="#8b6a54"))

    if "cloth" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.12), int(height * 0.26), int(width * 0.76), int(height * 0.9)), rgb("#f1ddd2", 110), blur=28, kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.26), int(height * 0.2), int(width * 0.88), int(height * 0.66)), rgb("#efe0de", 62), blur=36, kind="ellipse")
    if "blush_glow" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.06), int(height * 0.22), int(width * 0.68), int(height * 0.92)), rgb("#f0d6ce", 118), blur=42, kind="ellipse")
    if "pebble" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.58), int(height * 0.72), int(width * 0.75), int(height * 0.8)), rgb("#d8cabd", 232), blur=4, kind="ellipse")
    if spec.handle == "bodylotion":
        draw_blurred_shape(canvas, (int(width * 0.08), int(height * 0.1), int(width * 0.42), int(height * 0.92)), (255, 250, 244, 124), blur=max(18, width // 30), kind="roundrect", radius=max(24, width // 24))
        draw_blurred_shape(canvas, (int(width * 0.5), int(height * 0.12), int(width * 0.8), int(height * 0.88)), (255, 252, 247, 54), blur=max(20, width // 26), kind="roundrect", radius=max(20, width // 28))
        draw_blurred_shape(canvas, (int(width * 0.5), int(height * 0.74), int(width * 0.94), int(height * 0.98)), rgb("#a98e7d", 58), blur=max(18, width // 28), kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.18), int(height * 0.08), int(width * 0.86), int(height * 0.44)), (255, 255, 255, 52), blur=max(22, width // 24), kind="ellipse")
    if spec.handle == "lipbalm":
        draw_blurred_shape(canvas, (int(width * 0.1), int(height * 0.62), int(width * 0.9), int(height * 0.98)), rgb("#cab9a8", 86), blur=max(14, width // 28), kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.12), int(height * 0.12), int(width * 0.9), int(height * 0.46)), (255, 251, 243, 68), blur=max(24, width // 22), kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.62), -int(height * 0.04), int(width * 1.02), int(height * 0.32)), (255, 247, 236, 72), blur=max(18, width // 28), kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.18), int(height * 0.54), int(width * 0.82), int(height * 0.92)), (255, 255, 255, 26), blur=max(18, width // 30), kind="roundrect", radius=max(18, width // 26))
    return canvas


def add_scene_props(canvas: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, variant: int) -> None:
    width, height = canvas.size
    draw = ImageDraw.Draw(canvas)
    scale = 1.0 if role == "hero" else 1.14 if role == "card" else 1.24
    stroke = max(2, int(width * 0.0026 * scale))

    if "coaster" in spec.props:
        coaster = wood_texture((int(width * 0.5 * scale), int(width * 0.5 * scale)), "#e1ba8a", "#ba7f4b")
        coaster.putalpha(make_mask(coaster.size, kind="roundrect", radius=int(width * 0.04)))
        coaster = coaster.rotate(-14 + variant * 2, Image.Resampling.BICUBIC, expand=True)
        paste_centered(canvas, coaster, (int(width * 0.5), int(height * 0.6)))
    if "oats" in spec.props:
        for index in range(12):
            x = int(width * 0.7) + index * max(5, int(width / 110))
            y = int(height * 0.18) + (index % 4) * max(12, int(height / 86))
            draw.line((x, y, x + max(22, int(width / 72)), y - max(18, int(height / 96))), fill=rgb("#baa57c", 138), width=stroke)
            draw.ellipse((x + max(14, int(width / 104)), y - max(30, int(height / 118)), x + max(28, int(width / 82)), y - max(12, int(height / 108))), fill=rgb("#dcc89f", 168))
    if "leaves" in spec.props:
        for x_pos, y_pos, angle in ((0.19, 0.18, -18), (0.82, 0.22, 22), (0.72, 0.16, -8)):
            leaf = Image.new("RGBA", (int(width * 0.19 * scale), int(height * 0.17 * scale)), (0, 0, 0, 0))
            leaf_draw = ImageDraw.Draw(leaf)
            leaf_draw.ellipse((0, leaf.height * 0.2, leaf.width * 0.72, leaf.height * 0.72), fill=rgb("#a8b89a", 182))
            leaf_draw.line((leaf.width * 0.08, leaf.height * 0.48, leaf.width * 0.78, leaf.height * 0.48), fill=rgb("#6e8468", 182), width=max(3, stroke))
            leaf_draw.line((leaf.width * 0.34, leaf.height * 0.22, leaf.width * 0.46, leaf.height * 0.62), fill=rgb("#7a906f", 124), width=max(2, stroke - 1))
            leaf = leaf.rotate(angle, Image.Resampling.BICUBIC, expand=True)
            paste_centered(canvas, leaf, (int(width * x_pos), int(height * y_pos)))
    if "petals" in spec.props:
        for x_pos, y_pos in ((0.77, 0.18), (0.83, 0.24), (0.72, 0.24), (0.2, 0.76)):
            petal = Image.new("RGBA", (int(width * 0.09 * scale), int(width * 0.09 * scale)), (0, 0, 0, 0))
            petal_draw = ImageDraw.Draw(petal)
            petal_draw.ellipse((0, petal.height * 0.18, petal.width * 0.52, petal.height * 0.76), fill=rgb("#f1d89f", 162))
            petal_draw.ellipse((petal.width * 0.26, 0, petal.width * 0.9, petal.height * 0.56), fill=rgb("#edc56e", 152))
            paste_centered(canvas, petal.rotate(-28, Image.Resampling.BICUBIC, expand=True), (int(width * x_pos), int(height * y_pos)))
    if "stems" in spec.props:
        stem_positions = (0.82, 0.88) if spec.handle == "lipbalm" else (0.73, 0.79, 0.85)
        stem_start_y = 0.6 if spec.handle == "lipbalm" else 0.21
        stem_end_y = 0.88 if spec.handle == "lipbalm" else 0.48
        stem_fill = rgb("#d5c7b8", 92) if spec.handle == "lipbalm" else rgb("#c5b29b", 126)
        node_fill = rgb("#e2d5c4", 108) if spec.handle == "lipbalm" else rgb("#d9cab8", 146)
        for x_pos in stem_positions:
            draw.line((int(width * x_pos), int(height * stem_start_y), int(width * (x_pos + 0.04)), int(height * stem_end_y)), fill=stem_fill, width=max(1, stroke - 1))
            for node in range(3):
                node_x = int(width * (x_pos + 0.015 * node))
                node_y = int(height * (stem_start_y + (stem_end_y - stem_start_y) * node / 3))
                draw.ellipse((node_x, node_y, node_x + max(14, width // 84), node_y + max(16, height // 96)), fill=node_fill)
    if "oil_drops" in spec.props:
        positions = ((0.76, 0.74, 1.2), (0.84, 0.79, 0.96), (0.68, 0.8, 0.82), (0.88, 0.72, 0.66)) if spec.handle == "bodylotion" else ((0.74, 0.68, 1.0), (0.8, 0.74, 0.8), (0.69, 0.76, 0.68))
        for x_pos, y_pos, scale in positions:
            drop = Image.new("RGBA", (int(width * 0.1 * scale), int(height * 0.12 * scale)), (0, 0, 0, 0))
            drop_draw = ImageDraw.Draw(drop)
            drop_draw.ellipse((0, drop.height * 0.18, drop.width, drop.height), fill=rgb("#f0d9b0", 188))
            drop_draw.polygon(((drop.width * 0.5, 0), (drop.width * 0.18, drop.height * 0.42), (drop.width * 0.82, drop.height * 0.42)), fill=rgb("#f0d9b0", 188))
            drop = drop.filter(ImageFilter.GaussianBlur(1))
            paste_centered(canvas, drop, (int(width * x_pos), int(height * y_pos)))
    if "droplets" in spec.props:
        for x_pos, y_pos, size_factor in ((0.22, 0.78, 1.0), (0.3, 0.73, 0.68), (0.75, 0.72, 0.82)):
            radius = max(10, int(width * 0.024 * size_factor))
            draw_blurred_shape(canvas, (int(width * x_pos) - radius, int(height * y_pos) - radius, int(width * x_pos) + radius, int(height * y_pos) + radius), (255, 255, 255, 70), blur=8, kind="ellipse")
            draw_blurred_shape(canvas, (int(width * x_pos) - radius // 2, int(height * y_pos) - radius // 2, int(width * x_pos) + radius // 2, int(height * y_pos) + radius // 2), (255, 255, 255, 120), blur=4, kind="ellipse")
    if "beeswax" in spec.props:
        positions = ((0.22, 0.74, 1.08), (0.29, 0.79, 0.9), (0.76, 0.27, 0.78), (0.82, 0.32, 0.66)) if spec.handle == "lipbalm" else ((0.78, 0.22, 1.0), (0.84, 0.27, 0.82), (0.73, 0.3, 0.72))
        for x_pos, y_pos, scale in positions:
            pellet = Image.new("RGBA", (int(width * 0.07 * scale * scale), int(width * 0.07 * scale * scale)), (0, 0, 0, 0))
            pellet_draw = ImageDraw.Draw(pellet)
            pellet_draw.ellipse((0, 0, pellet.width - 1, pellet.height - 1), fill=rgb("#e8c35e", 208))
            pellet_draw.ellipse((pellet.width * 0.18, pellet.height * 0.12, pellet.width * 0.55, pellet.height * 0.45), fill=(255, 245, 214, 80))
            paste_centered(canvas, pellet, (int(width * x_pos), int(height * y_pos)))
    if "shea_dish" in spec.props:
        dish = Image.new("RGBA", (int(width * 0.18), int(height * 0.1)), (0, 0, 0, 0))
        dish_draw = ImageDraw.Draw(dish)
        dish_draw.ellipse((0, dish.height * 0.34, dish.width - 1, dish.height - 1), fill=rgb("#d1c7bc", 220))
        dish_draw.ellipse((dish.width * 0.12, dish.height * 0.18, dish.width * 0.88, dish.height * 0.74), fill=rgb("#f1e0c2", 230))
        dish_draw.arc((dish.width * 0.25, dish.height * 0.24, dish.width * 0.76, dish.height * 0.72), 185, 360, fill=rgb("#ffffff", 130), width=3)
        paste_centered(canvas, dish, (int(width * 0.76), int(height * 0.78)))
    if spec.handle == "bodylotion":
        for x_pos, y_pos, w_scale, h_scale, tone in (
            (0.72, 0.79, 0.14, 0.09, "#d3c4b7"),
            (0.82, 0.84, 0.11, 0.07, "#cbbcaf"),
            (0.62, 0.86, 0.09, 0.06, "#ded3c8"),
        ):
            pebble = Image.new("RGBA", (int(width * w_scale), int(height * h_scale)), (0, 0, 0, 0))
            pebble_draw = ImageDraw.Draw(pebble)
            pebble_draw.ellipse((0, 0, pebble.width - 1, pebble.height - 1), fill=rgb(tone, 236))
            pebble_draw.ellipse((pebble.width * 0.14, pebble.height * 0.08, pebble.width * 0.5, pebble.height * 0.4), fill=(255, 248, 241, 64))
            pebble = pebble.filter(ImageFilter.GaussianBlur(1))
            paste_centered(canvas, pebble, (int(width * x_pos), int(height * y_pos)))


def add_glass_highlight(layer: Image.Image, box: tuple[int, int, int, int], alpha: int = 85) -> None:
    width = box[2] - box[0]
    height = box[3] - box[1]
    highlight = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    highlight_draw = ImageDraw.Draw(highlight)
    highlight_draw.ellipse((box[0] + width * 0.05, box[1] - height * 0.08, box[0] + width * 0.42, box[1] + height * 0.86), fill=(255, 255, 255, alpha))
    highlight_draw.ellipse((box[0] + width * 0.58, box[1] + height * 0.08, box[0] + width * 0.78, box[1] + height * 0.92), fill=(255, 255, 255, max(24, alpha // 3)))
    highlight = highlight.filter(ImageFilter.GaussianBlur(max(12, width // 8)))
    layer.alpha_composite(highlight)


def draw_shadow(layer: Image.Image, bbox: tuple[int, int, int, int], alpha: int = 90) -> None:
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse(bbox, fill=(83, 58, 41, int(alpha * 0.42)))
    inset_x = max(8, (bbox[2] - bbox[0]) // 8)
    inset_y = max(4, (bbox[3] - bbox[1]) // 5)
    draw.ellipse((bbox[0] + inset_x, bbox[1] + inset_y, bbox[2] - inset_x, bbox[3] - inset_y), fill=(72, 48, 35, alpha))
    spread_x = max(10, (bbox[2] - bbox[0]) // 6)
    draw.ellipse((bbox[0] - spread_x // 2, bbox[1] + inset_y, bbox[2] + spread_x, bbox[3] + inset_y * 2), fill=(100, 71, 50, int(alpha * 0.18)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(10, (bbox[2] - bbox[0]) // 8)))
    layer.alpha_composite(shadow)


def add_surface_reflection(layer: Image.Image, bbox: tuple[int, int, int, int], strength: int = 62, stretch: float = 0.34, blur: int = 18) -> None:
    x0 = max(0, bbox[0])
    y0 = max(0, bbox[1])
    x1 = min(layer.width, bbox[2])
    y1 = min(layer.height, bbox[3])
    if x1 - x0 < 24 or y1 - y0 < 24:
        return
    crop = layer.crop((x0, y0, x1, y1))
    reflection_h = max(20, int(crop.height * stretch))
    reflection = ImageOps.flip(crop).resize((crop.width, reflection_h), Image.Resampling.BICUBIC)
    reflection = apply_alpha_fade(reflection, strength, 0)
    reflection = reflection.filter(ImageFilter.GaussianBlur(max(6, blur)))
    dest_y = min(layer.height - reflection.height, y1 - int(crop.height * 0.06))
    if dest_y <= y0:
        return
    layer.alpha_composite(reflection, (x0, dest_y))


def render_jar(scene: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, variant: int, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    product_w = int(width * (0.58 if role == "hero" else 0.64 if role == "card" else 0.76))
    body_h = int(product_w * (0.5 if spec.package != "jar_soft" else 0.46))
    lid_h = int(body_h * (0.36 if spec.package == "jar_wood" else 0.3))
    cx = int(width * (0.5 + x_shift))
    cy = int(height * (0.58 + y_shift))

    shadow_box = (cx - int(product_w * 0.32), cy + body_h // 2 - int(body_h * 0.02), cx + int(product_w * 0.32), cy + body_h // 2 + int(product_w * 0.13))
    draw_shadow(layer, shadow_box, alpha=112)

    body_box = (cx - product_w // 2, cy - body_h // 2, cx + product_w // 2, cy + body_h // 2)
    body = masked_gradient((product_w, body_h), spec.primary, spec.secondary, kind="roundrect", radius=int(body_h * 0.18))
    body.alpha_composite(grain_overlay(body.size, alpha=10 if spec.package != "jar_frosted" else 6, sigma=14, tint=spec.accent))
    add_material_depth(
        body,
        light_alpha=90 if spec.package == "jar_frosted" else 84,
        dark_alpha=38 if spec.package == "jar_frosted" else 46,
        rim_alpha=54,
    )
    body_border = Image.new("RGBA", body.size, (0, 0, 0, 0))
    ImageDraw.Draw(body_border).rounded_rectangle((0, 0, product_w - 1, body_h - 1), radius=int(body_h * 0.18), outline=(166, 132, 103, 138), width=max(2, product_w // 90))
    body.alpha_composite(body_border)
    rim = Image.new("RGBA", body.size, (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.rounded_rectangle((int(product_w * 0.03), int(body_h * 0.03), int(product_w * 0.97), int(body_h * 0.97)), radius=int(body_h * 0.16), outline=(255, 249, 241, 48), width=max(1, product_w // 120))
    body.alpha_composite(rim)

    cream_h = int(body_h * 0.64)
    cream_w = int(product_w * 0.86)
    cream = masked_gradient((cream_w, cream_h), spec.cream, "#f9f0e3", kind="roundrect", radius=int(cream_h * 0.2))
    cream_swirl = Image.new("RGBA", cream.size, (0, 0, 0, 0))
    swirl_draw = ImageDraw.Draw(cream_swirl)
    for offset in range(0, cream_h, max(8, cream_h // 8)):
        swirl_draw.arc((int(cream_w * 0.12), offset - int(cream_h * 0.18), int(cream_w * 0.92), offset + int(cream_h * 0.36)), 185, 355, fill=(255, 248, 237, 48), width=max(2, cream_h // 18))
    swirl_draw.ellipse((int(cream_w * 0.16), int(cream_h * 0.08), int(cream_w * 0.44), int(cream_h * 0.34)), fill=(255, 251, 243, 34))
    cream.alpha_composite(cream_swirl)
    body.alpha_composite(cream, (int(product_w * 0.07), int(body_h * 0.1)))
    seam = Image.new("RGBA", body.size, (0, 0, 0, 0))
    draw_blurred_shape(seam, (int(product_w * 0.06), int(body_h * 0.06), int(product_w * 0.94), int(body_h * 0.22)), (84, 58, 42, 28), blur=max(6, product_w // 36), kind="ellipse")
    body.alpha_composite(seam)
    add_inner_shadow(body, alpha=54)
    layer.alpha_composite(body, (body_box[0], body_box[1]))
    add_glass_highlight(layer, body_box, alpha=98)

    lid_w = int(product_w * (1.02 if spec.package == "jar_wood" else 0.98))
    lid_box = (cx - lid_w // 2, body_box[1] - int(lid_h * 0.9), cx + lid_w // 2, body_box[1] + int(lid_h * 0.35))
    if spec.package == "jar_wood":
        lid = wood_texture((lid_w, lid_box[3] - lid_box[1]), "#d6a16d", "#9c6238")
        lid.putalpha(make_mask(lid.size, kind="roundrect", radius=int(lid_h * 0.42)))
        lid_top = build_wood_roundel(int(lid_w * 0.5), logo)
        paste_centered(lid, lid_top, (lid.size[0] // 2, int(lid.size[1] * 0.45)))
    else:
        lid = metal_texture((lid_w, lid_box[3] - lid_box[1]), "#ffffff", "#cdb49e")
        lid.putalpha(make_mask(lid.size, kind="roundrect", radius=int(lid_h * 0.42)))
        lid.alpha_composite(alpha_box((lid_w, lid.size[1]), 32, kind="ellipse"), (0, 0))
    lid_sheen = Image.new("RGBA", lid.size, (0, 0, 0, 0))
    draw_blurred_shape(lid_sheen, (int(lid_w * 0.02), -int(lid.size[1] * 0.18), int(lid_w * 0.56), int(lid.size[1] * 0.72)), (255, 255, 255, 66), blur=max(8, lid_w // 18), kind="ellipse")
    draw_blurred_shape(lid_sheen, (0, int(lid.size[1] * 0.54), lid_w, lid.size[1]), (95, 66, 48, 48), blur=max(8, lid_w // 20), kind="roundrect", radius=max(12, lid_h // 3))
    lid.alpha_composite(lid_sheen)
    layer.alpha_composite(lid, (lid_box[0], lid_box[1]))
    draw_blurred_shape(layer, (body_box[0] + int(product_w * 0.08), body_box[1] - int(lid_h * 0.1), body_box[2] - int(product_w * 0.08), body_box[1] + int(lid_h * 0.12)), (76, 54, 39, 44), blur=max(8, product_w // 24), kind="ellipse")

    label_width = int(product_w * (0.44 if spec.package == "jar_wood" else 0.4))
    label = build_paper_label(label_width)
    paste_centered(layer, label, (cx, int(body_box[1] + body_h * 0.6)))
    add_surface_reflection(layer, (cx - lid_w // 2, lid_box[1], cx + lid_w // 2, body_box[3]), strength=72 if role == "hero" else 58, stretch=0.28 if role == "thumb" else 0.34, blur=12 if role == "thumb" else 16)

    if rotation:
        layer = layer.rotate(rotation, Image.Resampling.BICUBIC, expand=False, center=(cx, cy))
    scene.alpha_composite(layer)


def render_pump_bottle(scene: Image.Image, spec: ProductSpec, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    width_ratio = 0.41 if role == "hero" else 0.45 if role == "card" else 0.54
    if spec.handle == "bodylotion":
        width_ratio += 0.02
    bottle_w = int(width * width_ratio)
    bottle_h = int(bottle_w * (2.08 if spec.handle == "bodylotion" else 2.2))
    cx = int(width * (0.5 + x_shift))
    cy = int(height * ((0.58 if spec.handle == "bodylotion" else 0.56) + y_shift))

    draw_shadow(layer, (cx - bottle_w // 3, cy + bottle_h // 2 - int(height * 0.018), cx + bottle_w // 3, cy + bottle_h // 2 + int(height * 0.038)), alpha=104 if spec.handle == "bodylotion" else 96)

    bottle_layer = Image.new("RGBA", (bottle_w + 120, bottle_h + 180), (0, 0, 0, 0))
    bx = 60
    by = 80
    body_w = bottle_w
    body_h = int(bottle_h * (0.8 if spec.handle == "bodylotion" else 0.82))
    radius = int(body_w * (0.22 if spec.handle == "bodylotion" else 0.18))
    body = masked_gradient((body_w, body_h), spec.primary, spec.secondary, kind="roundrect", radius=radius)
    body.alpha_composite(grain_overlay(body.size, alpha=9, sigma=12, tint=spec.accent))
    add_material_depth(body, light_alpha=82, dark_alpha=44, rim_alpha=42)
    border = Image.new("RGBA", body.size, (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border)
    border_draw.rounded_rectangle((0, 0, body_w - 1, body_h - 1), radius=radius, outline=(140, 117, 103, 110), width=max(2, body_w // 90))
    if spec.handle == "bodylotion":
        border_draw.rounded_rectangle((int(body_w * 0.04), int(body_h * 0.03), int(body_w * 0.96), int(body_h * 0.97)), radius=max(18, radius - body_w // 20), outline=(255, 249, 241, 34), width=max(1, body_w // 140))
    body.alpha_composite(border)
    shoulder = Image.new("RGBA", body.size, (0, 0, 0, 0))
    draw_blurred_shape(shoulder, (int(body_w * 0.08), -int(body_h * 0.04), int(body_w * 0.92), int(body_h * 0.26)), (255, 248, 240, 36), blur=max(10, body_w // 18), kind="ellipse")
    draw_blurred_shape(shoulder, (int(body_w * 0.1), int(body_h * 0.78), int(body_w * 0.9), int(body_h * 1.04)), (104, 82, 70, 28), blur=max(10, body_w // 18), kind="ellipse")
    body.alpha_composite(shoulder)
    bottle_layer.alpha_composite(body, (bx, by + int(bottle_h * 0.16)))

    neck_w = int(body_w * 0.28)
    neck_h = int(bottle_h * (0.14 if spec.handle == "bodylotion" else 0.16))
    neck = metal_texture((neck_w, neck_h), "#e6d3c0", "#a18b79")
    neck.putalpha(make_mask(neck.size, kind="roundrect", radius=int(neck_w * 0.22)))
    bottle_layer.alpha_composite(neck, (bx + int(body_w * 0.36), by + int(bottle_h * 0.05)))

    pump_w = int(body_w * (0.29 if spec.handle == "bodylotion" else 0.36))
    pump_h = int(bottle_h * (0.12 if spec.handle == "bodylotion" else 0.16))
    pump = metal_texture((pump_w, pump_h), "#4f4038", "#251f1b")
    pump.putalpha(make_mask(pump.size, kind="roundrect", radius=int(pump_h * 0.24)))
    pump_x = bx + int(body_w * (0.355 if spec.handle == "bodylotion" else 0.31))
    bottle_layer.alpha_composite(pump, (pump_x, 0))
    spout = Image.new("RGBA", bottle_layer.size, (0, 0, 0, 0))
    spout_draw = ImageDraw.Draw(spout)
    if spec.handle == "bodylotion":
        spout_draw.rounded_rectangle((bx + int(body_w * 0.47), int(pump_h * 0.2), bx + int(body_w * 0.74), int(pump_h * 0.4)), radius=10, fill=(58, 48, 42, 255))
        spout_draw.rounded_rectangle((bx + int(body_w * 0.68), int(pump_h * 0.2), bx + int(body_w * 0.78), int(pump_h * 0.68)), radius=10, fill=(58, 48, 42, 255))
    else:
        spout_draw.rounded_rectangle((bx + int(body_w * 0.44), int(pump_h * 0.18), bx + int(body_w * 0.83), int(pump_h * 0.42)), radius=12, fill=(58, 48, 42, 255))
    bottle_layer.alpha_composite(spout)

    bottle_layer = bottle_layer.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, bottle_layer, (cx, cy))
    add_glass_highlight(layer, (cx - bottle_w // 2, cy - bottle_h // 2, cx + bottle_w // 2, cy + bottle_h // 2), alpha=88)

    label = build_paper_label(int(bottle_w * (0.54 if spec.handle == "bodylotion" else 0.48)))
    paste_centered(layer, label, (cx, int(cy + bottle_h * (0.15 if spec.handle == "bodylotion" else 0.13))))
    add_surface_reflection(layer, (cx - bottle_w // 2, cy - bottle_h // 2, cx + bottle_w // 2, cy + bottle_h // 2), strength=68 if role == "hero" else 52, stretch=0.28, blur=16)
    scene.alpha_composite(layer)


def render_tube(scene: Image.Image, spec: ProductSpec, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    tube_w = int(width * (0.33 if role == "hero" else 0.37 if role == "card" else 0.47))
    tube_h = int(tube_w * 2.4)
    cx = int(width * (0.5 + x_shift))
    cy = int(height * (0.56 + y_shift))

    draw_shadow(layer, (cx - tube_w // 3, cy + tube_h // 2 - int(height * 0.018), cx + tube_w // 3, cy + tube_h // 2 + int(height * 0.034)), alpha=92)

    tube = Image.new("RGBA", (tube_w + 120, tube_h + 120), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tube)
    tx = 60
    ty = 24
    points = [
        (tx + tube_w * 0.24, ty + tube_h * 0.04),
        (tx + tube_w * 0.76, ty + tube_h * 0.04),
        (tx + tube_w * 0.92, ty + tube_h * 0.8),
        (tx + tube_w * 0.72, ty + tube_h * 0.96),
        (tx + tube_w * 0.28, ty + tube_h * 0.96),
        (tx + tube_w * 0.08, ty + tube_h * 0.8),
    ]
    mask = Image.new("L", tube.size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    grad = vertical_gradient(tube.size, spec.secondary, spec.primary)
    grad.putalpha(mask)
    tube.alpha_composite(grad)
    tube.alpha_composite(grain_overlay(tube.size, alpha=8, sigma=10, tint=spec.accent))
    add_material_depth(tube, light_alpha=84, dark_alpha=38, rim_alpha=34)
    draw.rounded_rectangle((tx + tube_w * 0.24, ty + tube_h * 0.9, tx + tube_w * 0.76, ty + tube_h * 1.04), radius=18, fill=rgb("#7b6559", 255))
    for crease in (0.16, 0.32, 0.48):
        draw.line((tx + tube_w * crease, ty + tube_h * 0.06, tx + tube_w * (crease + 0.18), ty + tube_h * 0.84), fill=(184, 169, 160, 46), width=max(2, tube_w // 42))
    highlight = Image.new("RGBA", tube.size, (0, 0, 0, 0))
    ImageDraw.Draw(highlight).ellipse((tx + tube_w * 0.14, ty + tube_h * 0.08, tx + tube_w * 0.48, ty + tube_h * 0.92), fill=(255, 255, 255, 90))
    ImageDraw.Draw(highlight).ellipse((tx + tube_w * 0.56, ty + tube_h * 0.18, tx + tube_w * 0.72, ty + tube_h * 0.84), fill=(255, 255, 255, 34))
    highlight = highlight.filter(ImageFilter.GaussianBlur(max(12, tube_w // 10)))
    tube.alpha_composite(highlight)

    tube = tube.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, tube, (cx, cy))
    label = build_paper_label(int(tube_w * 0.5))
    paste_centered(layer, label, (cx, int(cy + tube_h * 0.2)))
    add_surface_reflection(layer, (cx - tube_w // 2, cy - tube_h // 2, cx + tube_w // 2, cy + tube_h // 2), strength=62 if role == "hero" else 48, stretch=0.24, blur=14)
    scene.alpha_composite(layer)


def render_open_tin(scene: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    base_ratio = 0.44 if role == "hero" else 0.48 if role == "card" else 0.58
    if spec.handle != "lipbalm":
        base_ratio -= 0.06
    base_d = int(width * base_ratio)
    cx = int(width * ((0.43 if spec.handle == "lipbalm" else 0.45) + x_shift))
    cy = int(height * ((0.58 if spec.handle == "lipbalm" else 0.56) + y_shift))
    lid_cx = int(width * ((0.68 if spec.handle == "lipbalm" else 0.63) + x_shift))
    lid_cy = int(height * ((0.66 if spec.handle == "lipbalm" else 0.67) + y_shift))

    draw_shadow(layer, (cx - base_d // 3, cy + base_d // 3, cx + base_d // 3, cy + base_d // 2), alpha=96 if spec.handle == "lipbalm" else 88)
    draw_shadow(layer, (lid_cx - base_d // 3, lid_cy + base_d // 4, lid_cx + base_d // 3, lid_cy + base_d // 2), alpha=82 if spec.handle == "lipbalm" else 74)

    tin = metal_texture((base_d, int(base_d * 0.42)), "#d7d8da", "#9fa4aa", horizontal=True)
    tin.putalpha(make_mask(tin.size, kind="roundrect", radius=int(base_d * 0.12)))
    add_material_depth(tin, light_alpha=70, dark_alpha=34, rim_alpha=30)
    paste_centered(layer, tin, (cx, cy + int(base_d * 0.12)))
    cream = masked_gradient((int(base_d * 0.86), int(base_d * 0.24)), spec.cream, "#fff0c4", kind="ellipse")
    cream_swirl = Image.new("RGBA", cream.size, (0, 0, 0, 0))
    cream_draw = ImageDraw.Draw(cream_swirl)
    cream_draw.arc((int(cream.size[0] * 0.18), int(cream.size[1] * 0.18), int(cream.size[0] * 0.82), int(cream.size[1] * 1.08)), 190, 350, fill=(255, 249, 235, 56), width=max(2, cream.size[1] // 10))
    if spec.handle == "lipbalm":
        cream_draw.ellipse((int(cream.size[0] * 0.18), int(cream.size[1] * 0.2), int(cream.size[0] * 0.42), int(cream.size[1] * 0.52)), fill=(255, 249, 232, 44))
    cream.alpha_composite(cream_swirl)
    paste_centered(layer, cream, (cx, cy))
    rim = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.ellipse((cx - base_d // 2, cy - int(base_d * 0.15), cx + base_d // 2, cy + int(base_d * 0.15)), outline=(149, 153, 158, 210), width=max(4, base_d // 40))
    layer.alpha_composite(rim)

    lid = metal_texture((int(base_d * 0.88), int(base_d * 0.88)), "#d4d5d6", "#a8adb2")
    lid.putalpha(make_mask(lid.size, kind="ellipse"))
    roundel_d = int(base_d * (0.44 if spec.handle == "lipbalm" else 0.56))
    lid.alpha_composite(build_wood_roundel(roundel_d, logo), (int((lid.size[0] - roundel_d) / 2), int((lid.size[1] - roundel_d) / 2)))
    lid_gloss = Image.new("RGBA", lid.size, (0, 0, 0, 0))
    draw_blurred_shape(lid_gloss, (int(lid.size[0] * 0.08), int(lid.size[1] * 0.04), int(lid.size[0] * 0.46), int(lid.size[1] * 0.58)), (255, 255, 255, 74), blur=max(8, lid.size[0] // 16), kind="ellipse")
    lid.alpha_composite(lid_gloss)
    lid = lid.rotate(rotation + (14 if spec.handle == "lipbalm" else 8), Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, lid, (lid_cx, lid_cy))
    add_surface_reflection(layer, (cx - base_d // 2, cy - int(base_d * 0.24), lid_cx + base_d // 2, lid_cy + base_d // 2), strength=58 if role == "hero" else 44, stretch=0.2, blur=13)
    scene.alpha_composite(layer)


def render_scene(spec: ProductSpec, size: tuple[int, int], role: str, variant_index: int, logo: Image.Image) -> Image.Image:
    canvas = build_background(spec, size, role, variant_index)
    add_scene_props(canvas, spec, logo, role, variant_index)

    x_shift, y_shift = 0.0, 0.0
    rotation = spec.rotation
    if role == "thumb":
        x_shift, y_shift, extra_rotation = THUMB_VARIANTS[variant_index]
        rotation += extra_rotation

    if spec.package in {"jar_wood", "jar_frosted", "jar_soft"}:
        render_jar(canvas, spec, logo, role, variant_index, x_shift, y_shift, rotation)
    elif spec.package == "pump_bottle":
        render_pump_bottle(canvas, spec, role, x_shift, y_shift, rotation)
    elif spec.package == "tube":
        render_tube(canvas, spec, role, x_shift, y_shift, rotation)
    elif spec.package == "tin_open":
        render_open_tin(canvas, spec, logo, role, x_shift, y_shift, rotation)

    vignette = Image.new("L", size, 0)
    ImageDraw.Draw(vignette).ellipse((int(size[0] * 0.04), int(size[1] * 0.02), int(size[0] * 0.96), int(size[1] * 0.98)), fill=220)
    vignette = vignette.filter(ImageFilter.GaussianBlur(max(28, size[0] // 18)))
    shaded = Image.new("RGBA", size, (74, 51, 35, 40))
    canvas = Image.composite(canvas, ImageChops.screen(canvas, shaded), vignette)
    return canvas.convert("RGB")


def save_jpeg(image: Image.Image, path: Path) -> None:
    image.save(path, format="JPEG", quality=92, optimize=True, progressive=True)


def main() -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    for spec in PRODUCTS:
        hero = render_scene(spec, HERO_SIZE, "hero", 0, logo)
        card = render_scene(spec, CARD_SIZE, "card", 1, logo)
        save_jpeg(hero, ASSETS_DIR / f"mourao-product-{spec.handle}-hero.jpg")
        save_jpeg(card, ASSETS_DIR / f"mourao-product-{spec.handle}-card.jpg")

        for index in range(4):
            thumb = render_scene(spec, THUMB_SIZE, "thumb", index, logo)
            save_jpeg(thumb, ASSETS_DIR / f"mourao-product-{spec.handle}-thumb-{index + 1}.jpg")


if __name__ == "__main__":
    main()
