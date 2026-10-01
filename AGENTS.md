<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Cyber Raid client-only and centralize mission state in the Zustand store, because the WebGL scene, camera gestures, and HUD share one deterministic campaign.
- Run MediaPipe only after explicit camera opt-in and preserve mouse, touch, and keyboard fallbacks, because camera availability and permission vary.
- Keep recognition models bundled and process camera frames in-browser, because player video must not be stored or uploaded.
