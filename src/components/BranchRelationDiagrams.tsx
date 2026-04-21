import React from "react";

const BRANCHES_CIRCLE = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// Position branches in a clock-like circle (starting from top = 午, going clockwise)
// Traditional layout: 午 at top, 子 at bottom
const BRANCH_ORDER_CLOCK = ["巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰"];

function getBranchPositions(cx: number, cy: number, r: number) {
  const positions: Record<string, { x: number; y: number }> = {};
  BRANCH_ORDER_CLOCK.forEach((branch, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    positions[branch] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
  return positions;
}

// ===== 三会图 =====
const SAN_HUI_GROUPS = [
  { branches: ["寅", "卯", "辰"], label: "东方木", color: "#16a34a" },
  { branches: ["巳", "午", "未"], label: "南方火", color: "#dc2626" },
  { branches: ["申", "酉", "戌"], label: "西方金", color: "#ca8a04" },
  { branches: ["亥", "子", "丑"], label: "北方水", color: "#2563eb" },
];

const SanHuiDiagram: React.FC = () => {
  const cx = 150, cy = 150, r = 110;
  const pos = getBranchPositions(cx, cy, r);
  const branchR = 18;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-center">地支三会图</h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
        {/* Group arcs */}
        {SAN_HUI_GROUPS.map((group) => {
          const pts = group.branches.map(b => pos[b]);
          const midX = (pts[0].x + pts[1].x + pts[2].x) / 3;
          const midY = (pts[0].y + pts[1].y + pts[2].y) / 3;
          
          // Draw curved enclosure
          const padR = branchR + 8;
          return (
            <g key={group.label}>
              {/* Connecting arc background */}
              <path
                d={`M ${pts[0].x} ${pts[0].y} Q ${midX + (midX - cx) * 0.3} ${midY + (midY - cy) * 0.3} ${pts[2].x} ${pts[2].y}`}
                fill="none"
                stroke={group.color}
                strokeWidth="2.5"
                strokeDasharray="6 3"
                opacity="0.5"
              />
              {/* Arrows between branches */}
              <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y}
                stroke={group.color} strokeWidth="2" opacity="0.6" />
              <line x1={pts[1].x} y1={pts[1].y} x2={pts[2].x} y2={pts[2].y}
                stroke={group.color} strokeWidth="2" opacity="0.6" />
              {/* Label */}
              <text x={midX + (midX - cx) * 0.45} y={midY + (midY - cy) * 0.45}
                textAnchor="middle" dominantBaseline="middle"
                fill={group.color} fontSize="10" fontWeight="bold">
                {group.label}
              </text>
            </g>
          );
        })}
        {/* Branch nodes */}
        {BRANCH_ORDER_CLOCK.map((branch) => {
          const p = pos[branch];
          const group = SAN_HUI_GROUPS.find(g => g.branches.includes(branch));
          return (
            <g key={branch}>
              <circle cx={p.x} cy={p.y} r={branchR} fill="white" stroke={group?.color || "#888"} strokeWidth="2" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="bold" fill={group?.color || "#333"}>
                {branch}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-muted-foreground space-y-0.5 px-2">
        {SAN_HUI_GROUPS.map(g => (
          <div key={g.label}>
            <span>{g.branches.join("")}三会</span>
            <span style={{ color: g.color }} className="font-medium ml-1">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== 六合图 =====
const LIU_HE_PAIRS = [
  { a: "子", b: "丑", result: "湿土", color: "#ca8a04" },
  { a: "寅", b: "亥", result: "木", color: "#16a34a" },
  { a: "卯", b: "戌", result: "火", color: "#dc2626" },
  { a: "辰", b: "酉", result: "金", color: "#ca8a04" },
  { a: "巳", b: "申", result: "水", color: "#2563eb" },
  { a: "午", b: "未", result: "燥土", color: "#ca8a04" },
];

const LiuHeDiagram: React.FC = () => {
  const cx = 150, cy = 150, r = 110;
  const pos = getBranchPositions(cx, cy, r);
  const branchR = 18;

  const pairColors = ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#06b6d4", "#9333ea"];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-center">地支六合图</h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
        {/* Connecting lines for pairs */}
        {LIU_HE_PAIRS.map((pair, i) => {
          const pa = pos[pair.a], pb = pos[pair.b];
          return (
            <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={pairColors[i]} strokeWidth="2" opacity="0.7" />
          );
        })}
        {/* Branch nodes */}
        {BRANCH_ORDER_CLOCK.map((branch) => {
          const p = pos[branch];
          return (
            <g key={branch}>
              <circle cx={p.x} cy={p.y} r={branchR} fill="white" stroke="#666" strokeWidth="1.5" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="bold" fill="#333">
                {branch}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-muted-foreground space-y-0.5 px-2">
        {LIU_HE_PAIRS.map((p, i) => (
          <div key={i}>
            <span>{p.a}{p.b}合</span>
            <span style={{ color: p.color }} className="font-medium ml-1">{p.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== 三合图 =====
const SAN_HE_GROUPS = [
  { branches: ["申", "子", "辰"], label: "水局", color: "#2563eb" },
  { branches: ["亥", "卯", "未"], label: "木局", color: "#16a34a" },
  { branches: ["寅", "午", "戌"], label: "火局", color: "#dc2626" },
  { branches: ["巳", "酉", "丑"], label: "金局", color: "#ca8a04" },
];

const SanHeDiagram: React.FC = () => {
  const cx = 150, cy = 150, r = 110;
  const pos = getBranchPositions(cx, cy, r);
  const branchR = 18;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-center">地支三合图</h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
        {/* Circle */}
        <circle cx={cx} cy={cy} r={r - 25} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        {/* Triangles */}
        {SAN_HE_GROUPS.map((group) => {
          const pts = group.branches.map(b => pos[b]);
          return (
            <polygon
              key={group.label}
              points={pts.map(p => `${p.x},${p.y}`).join(" ")}
              fill={group.color}
              fillOpacity="0.08"
              stroke={group.color}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          );
        })}
        {/* Branch nodes */}
        {BRANCH_ORDER_CLOCK.map((branch) => {
          const p = pos[branch];
          return (
            <g key={branch}>
              <circle cx={p.x} cy={p.y} r={branchR} fill="white" stroke="#666" strokeWidth="1.5" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="bold" fill="#333">
                {branch}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-muted-foreground space-y-0.5 px-2">
        {SAN_HE_GROUPS.map(g => (
          <div key={g.label}>
            <span>{g.branches.join("")}三合</span>
            <span style={{ color: g.color }} className="font-medium ml-1">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BranchRelationDiagrams: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="p-4 rounded-lg border border-border bg-card">
        <SanHuiDiagram />
      </div>
      <div className="p-4 rounded-lg border border-border bg-card">
        <LiuHeDiagram />
      </div>
      <div className="p-4 rounded-lg border border-border bg-card">
        <SanHeDiagram />
      </div>
    </div>
  );
};

export default BranchRelationDiagrams;
