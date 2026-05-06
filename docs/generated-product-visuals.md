# Generated Product Visuals

Mourão Organics storefront imagery now renders from real product photography sources.

- Active builder: [scripts/build-product-photo-assets.py](/Users/OlivierJacobs_1/Desktop/Mourao/scripts/build-product-photo-assets.py)
- Legacy builder: [scripts/build-product-assets.py](/Users/OlivierJacobs_1/Desktop/Mourao/scripts/build-product-assets.py)
- Output: `assets/mourao-product-*-hero.jpg`, `assets/mourao-product-*-card.jpg`, `assets/mourao-product-*-thumb-*.jpg`
- Inputs:
  - source photography in `assets/product-photo-sources/`
  - Mourão logo asset for small branded overlays
- Source list: [docs/product-photo-sources.md](/Users/OlivierJacobs_1/Desktop/Mourao/docs/product-photo-sources.md)

The active pipeline creates:

- real-photo hero crops for each product
- matching card and thumb variants from the same source
- warm grade aligned to the store palette
- soft branding neutralization where original package text was visible
