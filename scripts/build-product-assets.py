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
        props=("cloth",),
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
        props=("coaster", "oats"),
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
        props=("leaves",),
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
        props=("pebble",),
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
        props=("blush_glow",),
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
        props=("stems",),
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
    shape = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shape)
    if kind == "ellipse":
        draw.ellipse((0, 0, width - 1, height - 1), fill=fill)
    elif kind == "roundrect":
        draw.rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, fill=fill)
    else:
        draw.rectangle((0, 0, width - 1, height - 1), fill=fill)
    if blur:
        shape = shape.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(shape, (bbox[0], bbox[1]))


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def paste_centered(base: Image.Image, overlay: Image.Image, center: tuple[int, int]) -> None:
    x = int(center[0] - overlay.width / 2)
    y = int(center[1] - overlay.height / 2)
    base.alpha_composite(overlay, (x, y))


def build_paper_label(width: int) -> Image.Image:
    height = int(width * 0.43)
    label = Image.new("RGBA", (width + 28, height + 28), (0, 0, 0, 0))

    shadow = Image.new("RGBA", label.size, (0, 0, 0, 0))
    shadow_mask = Image.new("L", label.size, 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle((14, 16, width + 9, height + 11), radius=int(height * 0.3), fill=118)
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(12))
    shadow.paste((89, 60, 40, 54), (0, 0), shadow_mask)
    label.alpha_composite(shadow)

    body = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    radius = int(height * 0.29)
    body_draw = ImageDraw.Draw(body)
    body_draw.rounded_rectangle(
        (0, 0, width - 1, height - 1),
        radius=radius,
        fill=(250, 243, 234, 245),
        outline=(171, 133, 101, 218),
        width=max(2, width // 82),
    )

    serif = ImageFont.truetype(SERIF_FONT, max(18, int(height * 0.36)))
    sans = ImageFont.truetype(SANS_FONT, max(9, int(height * 0.14)))
    title = "MOURÃO"
    subtitle = "ORGANICS"
    title_w, _ = text_size(body_draw, title, serif)
    subtitle_w, subtitle_h = text_size(body_draw, subtitle, sans)
    body_draw.text(((width - title_w) / 2, height * 0.16), title, font=serif, fill=(66, 44, 32, 255))
    body_draw.text(((width - subtitle_w) / 2, height * 0.61 - subtitle_h / 2), subtitle, font=sans, fill=(122, 95, 71, 255))

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


def build_background(spec: ProductSpec, size: tuple[int, int], variant: int) -> Image.Image:
    canvas = vertical_gradient(size, spec.bg_top, spec.bg_bottom)
    width, height = size

    draw_blurred_shape(canvas, (int(width * 0.05), int(height * 0.04), int(width * 0.92), int(height * 0.68)), rgb(spec.glow, 145), blur=70, kind="ellipse")
    draw_blurred_shape(canvas, (int(width * 0.14), int(height * 0.16), int(width * 0.86), int(height * 0.96)), rgb("#ffffff", 56), blur=110, kind="ellipse")

    veil = Image.new("RGBA", size, (255, 255, 255, 0))
    veil_draw = ImageDraw.Draw(veil)
    stripe_alpha = 10 if variant == 0 else 7
    for offset in range(-height, width, max(48, width // 18)):
        veil_draw.line((offset, 0, offset + height, height), fill=(255, 248, 241, stripe_alpha), width=max(18, width // 26))
    veil = veil.filter(ImageFilter.GaussianBlur(max(8, width // 120)))
    canvas.alpha_composite(veil)

    if "cloth" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.12), int(height * 0.22), int(width * 0.78), int(height * 0.92)), rgb("#f3e3db", 128), blur=46, kind="ellipse")
        draw_blurred_shape(canvas, (int(width * 0.24), int(height * 0.14), int(width * 0.94), int(height * 0.68)), rgb("#efe0de", 88), blur=52, kind="ellipse")
    if "blush_glow" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.04), int(height * 0.16), int(width * 0.72), int(height * 0.94)), rgb("#f3d7d1", 150), blur=64, kind="ellipse")
    if "pebble" in spec.props:
        draw_blurred_shape(canvas, (int(width * 0.57), int(height * 0.71), int(width * 0.72), int(height * 0.78)), rgb("#d8cabd", 240), blur=6, kind="ellipse")
    return canvas


def add_scene_props(canvas: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, variant: int) -> None:
    width, height = canvas.size
    draw = ImageDraw.Draw(canvas)

    if "coaster" in spec.props:
        coaster = masked_gradient((int(width * 0.46), int(width * 0.46)), "#e1ba8a", "#ba7f4b", kind="roundrect", radius=int(width * 0.04))
        rings = Image.new("RGBA", coaster.size, (0, 0, 0, 0))
        rings_draw = ImageDraw.Draw(rings)
        cx, cy = coaster.width // 2, coaster.height // 2
        for step in range(18, coaster.width // 2, max(12, coaster.width // 20)):
            rings_draw.ellipse((cx - step, cy - step, cx + step, cy + step), outline=(135, 92, 57, 56), width=2)
        coaster.alpha_composite(rings)
        coaster = coaster.rotate(-14 + variant * 2, Image.Resampling.BICUBIC, expand=True)
        paste_centered(canvas, coaster, (int(width * 0.5), int(height * 0.57)))
    if "oats" in spec.props:
        for index in range(12):
            x = int(width * 0.74) + index * max(4, width // 120)
            y = int(height * 0.18) + (index % 4) * max(10, height // 90)
            draw.line((x, y, x + max(18, width // 80), y - max(16, height // 100)), fill=rgb("#baa57c", 110), width=2)
            draw.ellipse((x + max(12, width // 110), y - max(28, height // 120), x + max(24, width // 90), y - max(12, height // 110)), fill=rgb("#d8c498", 135))
    if "leaves" in spec.props:
        for x_pos, y_pos, angle in ((0.19, 0.18, -18), (0.82, 0.22, 22), (0.72, 0.16, -8)):
            leaf = Image.new("RGBA", (int(width * 0.18), int(height * 0.16)), (0, 0, 0, 0))
            leaf_draw = ImageDraw.Draw(leaf)
            leaf_draw.ellipse((0, leaf.height * 0.2, leaf.width * 0.72, leaf.height * 0.72), fill=rgb("#a8b89a", 168))
            leaf_draw.line((leaf.width * 0.08, leaf.height * 0.48, leaf.width * 0.78, leaf.height * 0.48), fill=rgb("#6e8468", 170), width=3)
            leaf = leaf.rotate(angle, Image.Resampling.BICUBIC, expand=True)
            paste_centered(canvas, leaf, (int(width * x_pos), int(height * y_pos)))
    if "stems" in spec.props:
        for x_pos in (0.73, 0.79, 0.85):
            draw.line((int(width * x_pos), int(height * 0.21), int(width * (x_pos + 0.05)), int(height * 0.48)), fill=rgb("#c5b29b", 110), width=3)
            for node in range(3):
                node_x = int(width * (x_pos + 0.015 * node))
                node_y = int(height * (0.27 + 0.06 * node))
                draw.ellipse((node_x, node_y, node_x + max(12, width // 90), node_y + max(14, height // 105)), fill=rgb("#d9cab8", 128))


def add_glass_highlight(layer: Image.Image, box: tuple[int, int, int, int], alpha: int = 85) -> None:
    width = box[2] - box[0]
    height = box[3] - box[1]
    highlight = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    highlight_draw = ImageDraw.Draw(highlight)
    highlight_draw.ellipse((box[0] + width * 0.05, box[1] - height * 0.08, box[0] + width * 0.42, box[1] + height * 0.86), fill=(255, 255, 255, alpha))
    highlight = highlight.filter(ImageFilter.GaussianBlur(max(12, width // 8)))
    layer.alpha_composite(highlight)


def draw_shadow(layer: Image.Image, bbox: tuple[int, int, int, int], alpha: int = 90) -> None:
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse(bbox, fill=(83, 58, 41, alpha))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(10, (bbox[2] - bbox[0]) // 7)))
    layer.alpha_composite(shadow)


def render_jar(scene: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, variant: int, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    product_w = int(width * (0.5 if role == "hero" else 0.56 if role == "card" else 0.68))
    body_h = int(product_w * (0.48 if spec.package != "jar_soft" else 0.44))
    lid_h = int(body_h * (0.34 if spec.package == "jar_wood" else 0.28))
    cx = int(width * (0.5 + x_shift))
    cy = int(height * (0.6 + y_shift))

    shadow_box = (cx - int(product_w * 0.34), cy + body_h // 2, cx + int(product_w * 0.34), cy + body_h // 2 + int(product_w * 0.12))
    draw_shadow(layer, shadow_box, alpha=88)

    body_box = (cx - product_w // 2, cy - body_h // 2, cx + product_w // 2, cy + body_h // 2)
    body = masked_gradient((product_w, body_h), spec.primary, spec.secondary, kind="roundrect", radius=int(body_h * 0.18))
    body_border = Image.new("RGBA", body.size, (0, 0, 0, 0))
    ImageDraw.Draw(body_border).rounded_rectangle((0, 0, product_w - 1, body_h - 1), radius=int(body_h * 0.18), outline=(166, 132, 103, 138), width=max(2, product_w // 90))
    body.alpha_composite(body_border)

    cream_h = int(body_h * 0.64)
    cream_w = int(product_w * 0.86)
    cream = masked_gradient((cream_w, cream_h), spec.cream, "#f9f0e3", kind="roundrect", radius=int(cream_h * 0.2))
    body.alpha_composite(cream, (int(product_w * 0.07), int(body_h * 0.1)))
    layer.alpha_composite(body, (body_box[0], body_box[1]))
    add_glass_highlight(layer, body_box)

    lid_w = int(product_w * (1.02 if spec.package == "jar_wood" else 0.98))
    lid_box = (cx - lid_w // 2, body_box[1] - int(lid_h * 0.9), cx + lid_w // 2, body_box[1] + int(lid_h * 0.35))
    if spec.package == "jar_wood":
        lid = masked_gradient((lid_w, lid_box[3] - lid_box[1]), "#d6a16d", "#9c6238", kind="roundrect", radius=int(lid_h * 0.42))
        ring_overlay = Image.new("RGBA", lid.size, (0, 0, 0, 0))
        ring_draw = ImageDraw.Draw(ring_overlay)
        lx, ly = lid.size[0] // 2, lid.size[1] // 2
        for step in range(14, lid.size[0] // 2, max(11, lid.size[0] // 20)):
            ring_draw.ellipse((lx - step, ly - step * 0.62, lx + step, ly + step * 0.62), outline=(120, 77, 46, 42), width=2)
        lid.alpha_composite(ring_overlay)
        lid_top = build_wood_roundel(int(lid_w * 0.56), logo)
        paste_centered(lid, lid_top, (lid.size[0] // 2, int(lid.size[1] * 0.45)))
    else:
        lid = masked_gradient((lid_w, lid_box[3] - lid_box[1]), "#faf6f0", "#dfc7ad", kind="roundrect", radius=int(lid_h * 0.42))
        lid.alpha_composite(alpha_box((lid_w, lid.size[1]), 46, kind="ellipse"), (0, 0))
    layer.alpha_composite(lid, (lid_box[0], lid_box[1]))

    label_width = int(product_w * (0.44 if spec.package == "jar_wood" else 0.4))
    label = build_paper_label(label_width)
    paste_centered(layer, label, (cx, int(body_box[1] + body_h * 0.6)))

    if rotation:
        layer = layer.rotate(rotation, Image.Resampling.BICUBIC, expand=False, center=(cx, cy))
    scene.alpha_composite(layer)


def render_pump_bottle(scene: Image.Image, spec: ProductSpec, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    bottle_w = int(width * (0.33 if role == "hero" else 0.37 if role == "card" else 0.48))
    bottle_h = int(bottle_w * 2.2)
    cx = int(width * (0.5 + x_shift))
    cy = int(height * (0.58 + y_shift))

    draw_shadow(layer, (cx - bottle_w // 3, cy + bottle_h // 2 - int(height * 0.03), cx + bottle_w // 3, cy + bottle_h // 2 + int(height * 0.03)), alpha=72)

    bottle_layer = Image.new("RGBA", (bottle_w + 120, bottle_h + 180), (0, 0, 0, 0))
    bx = 60
    by = 80
    body_w = bottle_w
    body_h = int(bottle_h * 0.82)
    body = masked_gradient((body_w, body_h), spec.primary, spec.secondary, kind="roundrect", radius=int(body_w * 0.18))
    border = Image.new("RGBA", body.size, (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle((0, 0, body_w - 1, body_h - 1), radius=int(body_w * 0.18), outline=(140, 117, 103, 110), width=max(2, body_w // 90))
    body.alpha_composite(border)
    bottle_layer.alpha_composite(body, (bx, by + int(bottle_h * 0.16)))

    neck_w = int(body_w * 0.28)
    neck_h = int(bottle_h * 0.16)
    neck = masked_gradient((neck_w, neck_h), "#d8c5b6", "#9e8574", kind="roundrect", radius=int(neck_w * 0.22))
    bottle_layer.alpha_composite(neck, (bx + int(body_w * 0.36), by + int(bottle_h * 0.05)))

    pump_w = int(body_w * 0.36)
    pump_h = int(bottle_h * 0.16)
    pump = masked_gradient((pump_w, pump_h), "#5f4c43", "#2e2621", kind="roundrect", radius=int(pump_h * 0.24))
    bottle_layer.alpha_composite(pump, (bx + int(body_w * 0.31), 0))
    spout = Image.new("RGBA", bottle_layer.size, (0, 0, 0, 0))
    spout_draw = ImageDraw.Draw(spout)
    spout_draw.rounded_rectangle((bx + int(body_w * 0.44), int(pump_h * 0.18), bx + int(body_w * 0.83), int(pump_h * 0.42)), radius=12, fill=(58, 48, 42, 255))
    bottle_layer.alpha_composite(spout)

    bottle_layer = bottle_layer.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, bottle_layer, (cx, cy))
    add_glass_highlight(layer, (cx - bottle_w // 2, cy - bottle_h // 2, cx + bottle_w // 2, cy + bottle_h // 2), alpha=76)

    label = build_paper_label(int(bottle_w * 0.48))
    paste_centered(layer, label, (cx, int(cy + bottle_h * 0.13)))
    scene.alpha_composite(layer)


def render_tube(scene: Image.Image, spec: ProductSpec, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    tube_w = int(width * (0.3 if role == "hero" else 0.34 if role == "card" else 0.45))
    tube_h = int(tube_w * 2.4)
    cx = int(width * (0.5 + x_shift))
    cy = int(height * (0.58 + y_shift))

    draw_shadow(layer, (cx - tube_w // 3, cy + tube_h // 2 - int(height * 0.025), cx + tube_w // 3, cy + tube_h // 2 + int(height * 0.028)), alpha=66)

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
    draw.rounded_rectangle((tx + tube_w * 0.24, ty + tube_h * 0.9, tx + tube_w * 0.76, ty + tube_h * 1.04), radius=18, fill=rgb("#7b6559", 255))
    highlight = Image.new("RGBA", tube.size, (0, 0, 0, 0))
    ImageDraw.Draw(highlight).ellipse((tx + tube_w * 0.14, ty + tube_h * 0.08, tx + tube_w * 0.48, ty + tube_h * 0.92), fill=(255, 255, 255, 90))
    highlight = highlight.filter(ImageFilter.GaussianBlur(max(12, tube_w // 10)))
    tube.alpha_composite(highlight)

    tube = tube.rotate(rotation, Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, tube, (cx, cy))
    label = build_paper_label(int(tube_w * 0.5))
    paste_centered(layer, label, (cx, int(cy + tube_h * 0.2)))
    scene.alpha_composite(layer)


def render_open_tin(scene: Image.Image, spec: ProductSpec, logo: Image.Image, role: str, x_shift: float, y_shift: float, rotation: int) -> None:
    width, height = scene.size
    layer = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    base_d = int(width * (0.34 if role == "hero" else 0.38 if role == "card" else 0.5))
    cx = int(width * (0.45 + x_shift))
    cy = int(height * (0.58 + y_shift))
    lid_cx = int(width * (0.63 + x_shift))
    lid_cy = int(height * (0.68 + y_shift))

    draw_shadow(layer, (cx - base_d // 3, cy + base_d // 3, cx + base_d // 3, cy + base_d // 2), alpha=64)
    draw_shadow(layer, (lid_cx - base_d // 3, lid_cy + base_d // 4, lid_cx + base_d // 3, lid_cy + base_d // 2), alpha=56)

    tin = masked_gradient((base_d, int(base_d * 0.42)), "#d7d8da", "#9fa4aa", kind="roundrect", radius=int(base_d * 0.12))
    paste_centered(layer, tin, (cx, cy + int(base_d * 0.12)))
    cream = masked_gradient((int(base_d * 0.86), int(base_d * 0.24)), spec.cream, "#fff0c4", kind="ellipse")
    paste_centered(layer, cream, (cx, cy))
    rim = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.ellipse((cx - base_d // 2, cy - int(base_d * 0.15), cx + base_d // 2, cy + int(base_d * 0.15)), outline=(149, 153, 158, 210), width=max(4, base_d // 40))
    layer.alpha_composite(rim)

    lid = masked_gradient((int(base_d * 0.88), int(base_d * 0.88)), "#d4d5d6", "#a8adb2", kind="ellipse")
    lid.alpha_composite(build_wood_roundel(int(base_d * 0.56), logo), (int(base_d * 0.16), int(base_d * 0.16)))
    lid = lid.rotate(rotation + 8, Image.Resampling.BICUBIC, expand=True)
    paste_centered(layer, lid, (lid_cx, lid_cy))
    scene.alpha_composite(layer)


def render_scene(spec: ProductSpec, size: tuple[int, int], role: str, variant_index: int, logo: Image.Image) -> Image.Image:
    canvas = build_background(spec, size, variant_index)
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
