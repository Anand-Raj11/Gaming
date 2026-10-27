# Mossbound

An original, responsive browser platformer. Three worlds, moving mushroom enemies, coins, three lives, midpoint checkpoints, optional synthesized sound, pause, and touch controls.

## Play locally

From this directory run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the server in a browser. Move with Left/Right or A/D, jump with Space/Up/W, and pause with P or Escape. Tap the on-screen buttons on touch devices. Tap Sound off to enable sound.

Jump onto mushrooms to defeat them. Reach the final flag to advance. Short taps produce shorter jumps. Falling or touching an enemy costs a life; the midpoint flag saves your respawn location.

No build step or dependencies. Fonts have local fallbacks. Deploy these static files to any static web host to share a public link.
