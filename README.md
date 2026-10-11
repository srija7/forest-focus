# 🌲 Forest Focus

A simple Pomodoro-style focus timer with a forest theme. Set a timer, plant a seed, and watch it grow into a tree while you work. Finish the session and the tree is added to your forest.

**Live demo:** https://srija7.github.io/forest-focus/

## How it works

1. Pick a focus length (15, 25, 45 or 60 minutes, or type your own).
2. Tap **Plant** to start the countdown.
3. As time passes, the plant grows through five stages:

   | Stage | Appears at |
   |-------|-----------|
   | 🌰 Seed | 0% |
   | 🌱 Sprout | 10% |
   | 🌿 Sapling | 35% |
   | 🌲 Young tree | 65% |
   | 🌳 Full tree | 95% |

4. When the timer reaches zero, the tree is saved to your forest.
5. Tap **Give Up** during a session to cancel. No tree is planted.

## Features

- Countdown timer with presets and a custom length (1-180 minutes)
- Animated plant that grows through five stages, with a progress ring
- Forest that fills with a tree for every completed session (hover a tree to see when you planted it and for how long)
- Progress saved in your browser with `localStorage`, so your forest stays between visits on the same device
- Accurate timing based on the system clock, so it stays correct if the tab runs in the background
- Remaining time shown in the browser tab title
- Responsive layout that works on phones and desktops
- No frameworks, no build step, no dependencies

## Project structure

```
forest-focus/
├── index.html   # page structure and the SVG plant stages
├── style.css    # forest theme and layout
├── script.js    # timer logic, growth stages, saved forest
└── README.md
```

## Run locally

No install needed. Download the files into one folder and open `index.html` in your browser.

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Push all files to the root of a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. After about a minute, the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Notes

- Your forest is stored only in your browser. Clearing site data or switching browsers/devices starts a fresh forest.
- Closing or switching tabs does not affect the timer in this version.

## Roadmap

- [ ] Tree withers if you leave the tab (Deep Focus mode)
- [ ] Calming forest sounds
- [ ] Tag sessions by activity (study, work, reading...)
- [ ] Daily, weekly and monthly stats and trends
- [ ] Compete or focus together with friends
- [ ] Lock-screen countdown (Live Activities on iPhone)

## License

MIT. Free to use and modify.
