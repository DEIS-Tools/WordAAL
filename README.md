# WordAAL
Interactive Wordle-like demo showcasing the resulting strategies from the paper ['Playing Wordle with Uppaal Stratego' by Peter G. Jensen, Kim G. Larsen, and Marius Mikučionis.](https://link.springer.com/chapter/10.1007/978-3-031-15629-8_15)

## Todo (in order of priority)
- [x] Get basic Wordle game working
- [ ] Get strategy-driver working; user needs to be able to pick top N best words given the current knowledge for each strategy.
- [ ] Versus mode: Human plays concurrently against chosen strategy, only revealing strategy-move after human move.
- [ ] Polish UI and UX
- [ ] Cheatmode: Further sort Q-value best moves by simulating each move against Game and sorting them by largest knowledge gained (minimising summed response e.g. response 00022=4 > 00111=3, here 00111 is perhaps better, but doesn't reveal placement)
- [ ] (Maybe) Add backend, allowing staff to pick moves, step back, forwards to demo specific features from separate device.

## Dev setup
Not using SvelteKit, so no need to install anything globaly. Just run the following commands in the `WordAAL-svelte/` folder:
```
npm install
npm run dev
```

