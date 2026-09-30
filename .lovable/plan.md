# Interactive MediaPipe Cyber Raid Upgrade

## Goal
Import the uploaded Cyber Raid game and make the 3D office respond to real-time hand and face gestures while keeping mouse, touch, and keyboard controls as reliable fallbacks.

## What will change
- Import the existing 3D office game without its Git history, generated files, or macOS metadata.
- Add an opt-in camera control panel with clear permission, loading, ready, and unavailable states.
- Use MediaPipe hand and face landmarks locally in the browser; camera frames are not uploaded or stored.
- Support full 360° office viewing:
  - Move an open hand left/right to orbit horizontally.
  - Move the hand up/down to adjust the viewing angle.
  - Use head movement as a secondary view control when a hand is not actively steering.
- Support gesture zoom:
  - Pinch → L shape zooms in.
  - L shape → pinch zooms out.
  - Keep mouse wheel and visible zoom buttons as fallbacks.
- Support security actions:
  - Aim the hand cursor at a flashing device and pinch to investigate.
  - Blink deliberately to isolate an already investigated device, with cooldown and progress feedback to avoid accidental actions.
- Show an investigation report after a successful pinch, including malware family, current malicious activity, affected people/systems, risk level, indicators, and recommended containment.
- Enlarge the office and its devices, add realistic office/server details, and make active threats visually distinct with attack traffic, alerts, encryption/data-leak effects, and infected-screen activity.
- Update the briefing and in-game guidance so all gestures and privacy behavior are clear.

## Reliability and performance
- Load vision tracking only after the player enables the camera.
- Run tracking at a controlled rate and smooth landmarks to reduce jitter and laptop load.
- Debounce pinch, L-shape, and blink actions with visible cooldowns.
- Keep gameplay fully usable when camera permission is denied or MediaPipe cannot load.
- Preserve the existing five-incident campaign, scoring, pause, firewall, and local leaderboard.

## Validation
- Verify the game builds without errors.
- Open the game at desktop and mobile sizes and confirm the office, controls, threat report, and fallback actions fit without overlap.
- Exercise selection, investigation, isolation, orbit, and zoom fallbacks in the browser.
- Confirm camera failure states remain playable and no camera data leaves the browser.
