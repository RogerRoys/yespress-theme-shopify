# Yespress — Shopify Theme (Horizon base)

Custom Shopify theme for **YesPress** by Roys Studio — a safety check-in device for the elderly.
One press a day on the YesPress Eén button confirms all is well (LED-ring feedback); family members
follow the daily check-in through the companion app.

Built on an optimized **Horizon 3.2.1** base, implementing the homepage of the Figma design
["Yespress — Roys Studio"](https://www.figma.com/design/gHdnpAGXHaPuqWqzUiFrMN/Yespress---Roys-Studio).

## Design reference

Homepage (node `1-86`) — dark theme, 3 breakpoints (desktop 1512 / tablet 834 / mobile 440) + mobile drawer state:

| # | Section | Figma frames (desktop / tablet / mobile) |
| --- | --- | --- |
| 1 | Hero — nav, product shot, "YESPRESS EEN — Altijd gerust.", € 149 + Koop | `415:1736` / `415:1769` / `415:1800` |
| 2 | Product explainer — pill accordion (YesPress Eén / Gebruik / Adapter) | `415:1506` / `415:1528` / `415:1551` |
| 3 | "De highlights op een rij." — carousel | `415:1573` / `415:1617` / `415:1654` |
| 4 | FAQ — "Got questions? We've the answers" (not in composed homepage) | `438:5360` / `438:5402` / `438:5444` |
| 5 | CTA Return — "Shop with Confidence, Risk-Free for 30 Days" | `727:5092` / `727:4911` (APP) |
| 6 | CTA App — "Join 250k users download our app!" | see canvas `1-86` |
| 7 | Footer | `978:5087` / `978:5151` / `978:5214` |

## Conventions

Same approach as the Momemade build: all Yespress-facing sections are **fully custom,
self-contained builds** (prefixed `yespress-`) — they do not depend on Horizon's native
sections, color schemes, or fonts.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Yespress theme — connect this to the Shopify store |
