export type NodeKind = "server" | "computer" | "router";
export type ThreatType = "malware" | "phishing" | "exfiltration" | "ransomware" | "botnet";

export interface NetNode {
  id: number;
  kind: NodeKind;
  label: string;
  pos: [number, number, number];
}

export interface ThreatInfo {
  name: string;
  color: string;
  growth: number;
  tip: string;
  category: string;
  activity: string;
  affected: string;
  indicators: string[];
  severity: "HIGH" | "CRITICAL";
}

export const THREATS: Record<ThreatType, ThreatInfo> = {
  malware: { name: "Worm.Glitchbyte", color: "#ee315f", growth: 0.035, category: "Self-propagating network worm", activity: "Scanning adjacent hosts, copying payloads, and opening a remote command channel.", affected: "Shared drives, engineering workstations, and signed-in accounts.", indicators: ["SMB connection burst", "Unsigned service created", "Repeated internal scans"], severity: "HIGH", tip: "Patch systems and isolate infected hosts to stop lateral spread." },
  phishing: { name: "Lure.FakeInvoice", color: "#f0a929", growth: 0.025, category: "Credential phishing kit", activity: "Displaying a forged invoice login and relaying captured credentials externally.", affected: "Finance mailbox, payment approvals, and the employee using this workstation.", indicators: ["Look-alike login domain", "New inbox forwarding rule", "Impossible sign-in location"], severity: "HIGH", tip: "Verify senders, inspect links, and report suspicious mail." },
  exfiltration: { name: "Leak.NightOwl", color: "#bd72e8", growth: 0.03, category: "Covert data exfiltration", activity: "Compressing sensitive files and sending encrypted outbound chunks after hours.", affected: "Customer records, legal documents, and the organization’s reputation.", indicators: ["Unusual outbound volume", "Archive process detected", "Unknown cloud endpoint"], severity: "CRITICAL", tip: "Block the destination and inspect unusual outbound traffic." },
  ransomware: { name: "Lock.CryptoMoth", color: "#ef6937", growth: 0.04, category: "File-encrypting ransomware", activity: "Deleting recovery copies, encrypting documents, and probing mapped drives.", affected: "Local files, shared storage, backups, and every connected team.", indicators: ["Rapid file renames", "Backup deletion command", "High-volume encryption"], severity: "CRITICAL", tip: "Disconnect affected hosts and protect offline backups." },
  botnet: { name: "Swarm.Hivemind", color: "#51d99b", growth: 0.028, category: "Command-and-control botnet", activity: "Polling an external controller and preparing distributed traffic.", affected: "Network bandwidth, internet-facing services, and connected office equipment.", indicators: ["Beacon every 30 seconds", "DNS to rotating domains", "Unexpected traffic spikes"], severity: "HIGH", tip: "Change defaults and block calls to unknown controllers." },
};

export const CAMPAIGN: ThreatType[] = ["phishing", "malware", "botnet", "exfiltration", "ransomware"];
export const TOTAL_THREATS = CAMPAIGN.length;
export const OPENING_DELAY = 2.5;
export const WAVE_DELAY = 2;

function buildNetwork() {
  const nodes: NetNode[] = [];
  const links: [number, number][] = [];
  const routers: [number, number][] = [[0, 0], [-7, -4], [7, -4], [0, 7]];
  routers.forEach(([x, z], i) => nodes.push({ id: nodes.length, kind: "router", label: `RTR-0${i + 1}`, pos: [x, 0, z] }));
  let srv = 1;
  let ws = 1;
  routers.forEach(([rx, rz], ri) => {
    for (let k = 0; k < 3; k++) {
      const a = (ri * 1.7 + k * ((Math.PI * 2) / 3)) % (Math.PI * 2);
      const id = nodes.length;
      const isServer = k === 0;
      nodes.push({
        id,
        kind: isServer ? "server" : "computer",
        label: isServer ? `SRV-${String(srv++).padStart(2, "0")}` : `WS-${String(ws++).padStart(2, "0")}`,
        pos: [rx + Math.cos(a) * 3.2, 0, rz + Math.sin(a) * 3.2],
      });
      links.push([ri, id]);
    }
  });
  links.push([0, 1], [0, 2], [0, 3], [1, 2], [4, 7], [10, 13], [5, 14]);
  const neighbors: number[][] = nodes.map(() => []);
  links.forEach(([a, b]) => {
    const first = neighbors[a];
    const second = neighbors[b];
    if (!first || !second) return;
    first.push(b);
    second.push(a);
  });
  return { nodes, links, neighbors };
}

export const NETWORK = buildNetwork();

export const RANKS = [
  { min: 0, name: "Trainee Analyst" },
  { min: 1200, name: "SOC Analyst I" },
  { min: 2600, name: "SOC Analyst II" },
  { min: 4200, name: "Threat Hunter" },
  { min: 6200, name: "Incident Commander" },
];

export function rankFor(score: number) {
  let rank = "Trainee Analyst";
  for (const candidate of RANKS) if (score >= candidate.min) rank = candidate.name;
  return rank;
}
