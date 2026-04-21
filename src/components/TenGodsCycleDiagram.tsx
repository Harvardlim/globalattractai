import React from 'react';

/**
 * 十神生克循环图 - SVG 组件
 * 印枭(top) → 比劫(right) → 食伤(bottom-right) → 财(bottom-left) → 官杀(left) → 印枭
 * 外圈：生（蓝色箭头，顺时针）
 * 内部：克（红色箭头，星形交叉）
 */
const TenGodsCycleDiagram: React.FC<{ className?: string }> = ({ className }) => {
  // Pentagon positions (cx, cy) - center at (300, 280), radius ~180
  const nodes = [
    { id: '印枭', x: 300, y: 80, sub: [{ name: '枭神', type: '同性' }, { name: '正印', type: '异性' }] },
    { id: '比劫', x: 471, y: 219, sub: [{ name: '比肩', type: '同性' }, { name: '劫财', type: '异性' }] },
    { id: '食伤', x: 406, y: 430, sub: [{ name: '食神', type: '同性' }, { name: '伤官', type: '异性' }] },
    { id: '财', x: 194, y: 430, sub: [{ name: '偏财', type: '同性' }, { name: '正财', type: '异性' }] },
    { id: '官杀', x: 129, y: 219, sub: [{ name: '七杀', type: '同性' }, { name: '正官', type: '异性' }] },
  ];

  // 生 cycle: 0→1→2→3→4→0 (clockwise)
  const shengPairs = [[0,1],[1,2],[2,3],[3,4],[4,0]];
  // 克 cycle: 0→2, 1→3, 2→4, 3→0, 4→1 (star pattern)
  const kePairs = [[0,2],[1,3],[2,4],[3,0],[4,1]];

  const arrowId = 'arrowBlue';
  const arrowRedId = 'arrowRed';

  // Calculate midpoint offset for curved arrows
  const getMidpoint = (x1: number, y1: number, x2: number, y2: number, offset: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Perpendicular offset (outward for 生)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * offset;
    const ny = dx / len * offset;
    return { mx: mx + nx, my: my + ny };
  };

  return (
    <svg viewBox="0 0 600 540" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
        </marker>
        <marker id={arrowRedId} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
        </marker>
      </defs>

      {/* 生 arrows (blue, curved outward) */}
      {shengPairs.map(([i, j], idx) => {
        const n1 = nodes[i], n2 = nodes[j];
        const { mx, my } = getMidpoint(n1.x, n1.y, n2.x, n2.y, -40);
        // Shorten the path to not overlap circles
        return (
          <g key={`sheng-${idx}`}>
            <path
              d={`M ${n1.x} ${n1.y} Q ${mx} ${my} ${n2.x} ${n2.y}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              markerEnd={`url(#${arrowId})`}
              strokeDasharray="none"
            />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#16a34a" fontWeight="bold">生</text>
          </g>
        );
      })}

      {/* 克 arrows (red, straight through center) */}
      {kePairs.map(([i, j], idx) => {
        const n1 = nodes[i], n2 = nodes[j];
        return (
          <line
            key={`ke-${idx}`}
            x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
            stroke="#ef4444"
            strokeWidth="1.5"
            markerEnd={`url(#${arrowRedId})`}
            opacity={0.7}
          />
        );
      })}

      {/* 克 label in center */}
      <text x="300" y="280" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#ef4444" fontWeight="bold">克</text>

      {/* Main nodes */}
      {nodes.map((node, idx) => (
        <g key={node.id}>
          {/* Circle */}
          <circle cx={node.x} cy={node.y} r="32" fill="white" stroke="#1f2937" strokeWidth="2" />
          <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fill="#1f2937">
            {node.id}
          </text>

          {/* Sub-nodes */}
          {node.sub.map((sub, si) => {
            // Position sub-nodes outside the main circle
            const angle = (Math.PI * 2 / 5) * idx - Math.PI / 2;
            const subOffset = si === 0 ? -1 : 1; // left/right of radial
            const radialX = Math.cos(angle);
            const radialY = Math.sin(angle);
            // Perpendicular direction
            const perpX = -radialY * subOffset * 55;
            const perpY = radialX * subOffset * 55;
            // Further out
            const sx = node.x + radialX * 65 + perpX;
            const sy = node.y + radialY * 65 + perpY;

            return (
              <g key={sub.name}>
                <circle cx={sx} cy={sy} r="24" fill="white" stroke="#9ca3af" strokeWidth="1.5" />
                <text x={sx} y={sy - 5} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#374151">
                  {sub.name}
                </text>
                <text x={sx} y={sy + 10} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#9ca3af">
                  {sub.type}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export default TenGodsCycleDiagram;
