# Training

Ben's gym plan, exercise library and training log, as a standalone installable web app.

- No build step. `index.html` is the whole app.
- Data is stored on the device (localStorage). Use Progress > Backup to export or import it.
- Works offline once opened (see `sw.js`).

## Hosting on GitHub Pages
Settings > Pages > Source: Deploy from a branch > `main` / root.

## Install on iPhone
Open the site in Safari > Share > Add to Home Screen.

## Source
`src/` holds the parts `index.html` is assembled from. `src/build.py` joins them.
