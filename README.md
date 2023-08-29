# WordAAL
Interactive Wordle-like demo showcasing the resulting strategies from the paper ['Playing Wordle with Uppaal Stratego' by Peter G. Jensen, Kim G. Larsen, and Marius Mikučionis.](https://link.springer.com/chapter/10.1007/978-3-031-15629-8_15)

Stack is Svelte + Vite, using generated strategies from repeatability package. 

## Features
- [x] Get strategy-driver working; user needs to be able to pick top N best words given the current knowledge for each strategy.
- [x] Game UI
- [ ] Versus mode: Human plays concurrently against chosen strategy, only revealing strategy-move after human move. Upon completion, show compared performance by human and strategy.
- [ ] Cheatmode: Further sort Q-value best moves by simulating each move against Game and sorting them by largest knowledge gained (minimising summed response e.g. response 00022=4 > 00111=3, here 00111 is perhaps better, but doesn't reveal placement)
- [ ] Generate more robust strategies for production.
- [ ] (Maybe) Add backend, allowing staff to pick moves, step back, forwards to demo specific features from separate device.

## Development
SvelteKit is not needed. Just run the following commands in the `WordAAL-svelte/` directory:
```
npm install
npm run dev
```

## Deploy
```
npm run build
```
Then copy the contents of `WordAAL-svelte/dist/` to your web-server.

### Fix
For [uppaal.org](uppaal.org) webserver, you might need to remove leading slash from `dist/index.html` sources due to configured Apache rewrite rules.
```html
<script type="module" crossorigin src="/assets/index-0c1789d2.js"></script>
<link rel="stylesheet" href="/assets/index-a39a2349.css">
```
