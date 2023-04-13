# WordAAL
Interactive Wordle-like demo showcasing the resulting strategies from the paper ['Playing Wordle with Uppaal Stratego' by Peter G. Jensen, Kim G. Larsen, and Marius Mikučionis.](https://link.springer.com/chapter/10.1007/978-3-031-15629-8_15)

Stack is Svelte + Vite, using generated strategy from UPPAAL Stratego. 

## Todo (in order of priority)
- [x] Get basic Wordle game working
- [x] Integrate keyboard guess input
- [x] Get strategy-driver working; user needs to be able to pick top N best words given the current knowledge for each strategy.
- [ ] Versus mode: Human plays concurrently against chosen strategy, only revealing strategy-move after human move.
- [x] Polish UI and UX
- [x] Migrate alerts to toasts
- [ ] Cheatmode: Further sort Q-value best moves by simulating each move against Game and sorting them by largest knowledge gained (minimising summed response e.g. response 00022=4 > 00111=3, here 00111 is perhaps better, but doesn't reveal placement)
- [ ] Generate more robust strategies with moves for more paths.
- [ ] (Maybe) Add backend, allowing staff to pick moves, step back, forwards to demo specific features from separate device.

## Dev setup
Not using SvelteKit, so no need to install anything globally. Just run the following commands in the `WordAAL-svelte/` folder:
```
npm install
npm run dev
```

## Deployment
```
npm run build
```
Then copy the contents of `WordAAL-svelte/dist/` to the server.