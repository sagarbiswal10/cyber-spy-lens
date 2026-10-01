import { createFileRoute } from "@tanstack/react-router";
import { GameScene } from "@/components/game/Scene";
import { HUD } from "@/components/game/HUD";
import { Menu, PauseScreen, Results } from "@/components/game/Screens";
import { VisionControls } from "@/components/game/VisionControls";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Cyber Raid — Gesture-Controlled SOC Defense" },
    { name: "description", content: "Investigate live cyber threats in a realistic 3D security operations center using hand and face gestures." },
    { property: "og:title", content: "Cyber Raid — Gesture-Controlled SOC Defense" },
    { property: "og:description", content: "Use gestures to investigate and contain live threats across a 3D office network." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Game,
});

function Game() {
  const phase = useGame((state) => state.phase);
  return <main className="fixed inset-0 overflow-hidden bg-background text-foreground"><GameScene/><div className="vignette pointer-events-none fixed inset-0 z-[5]"/>{(phase === "playing" || phase === "paused") && <><HUD/><VisionControls/></>}{phase === "menu" && <Menu/>}{phase === "paused" && <PauseScreen/>}{phase === "results" && <Results/>}</main>;
}