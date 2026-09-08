import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { polygonArea, polygonCentroid, distance } from '../lib/geometry';
import { Point } from '../types';

export function TopMenu() {
  const store = useEditorStore();
  const spatialDoc = store.getDocument();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      store.clearDocument();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // reset after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const getSvgString = () => {
    // Generate a standalone SVG string of the floorplan
    // Find bounds to set viewBox
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of Object.values(spatialDoc.nodes)) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x);
      maxY = Math.max(maxY, node.position.y);
    }
    
    if (minX === Infinity) return null; // Empty

    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" style="background-color: white;">`;

    // Regions
    for (const region of Object.values(spatialDoc.regions)) {
      const pts: Point[] = [];
      if (region.boundaryEdgeIds.length > 0) {
        let currentEdge = spatialDoc.edges[region.boundaryEdgeIds[0]];
        let currentNodeId = currentEdge.startNodeId;
        
        for (const edgeId of region.boundaryEdgeIds) {
          const edge = spatialDoc.edges[edgeId];
          pts.push(spatialDoc.nodes[currentNodeId].position);
          currentNodeId = edge.startNodeId === currentNodeId ? edge.endNodeId : edge.startNodeId;
        }
      }
      
      if (pts.length >= 3) {
        const pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
        const area = Math.round(polygonArea(pts));
        const centroid = polygonCentroid(pts);
        
        const team = region.teamId ? spatialDoc.teams[region.teamId] : null;
        
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        const baseFill = team ? hexToRgba(team.color, 0.15) : "rgba(107, 114, 128, 0.05)";
        
        svgContent += `<path d="${pathD}" fill="${baseFill}" stroke="${team ? team.color : 'none'}" stroke-width="1" stroke-opacity="0.2" />`;
        svgContent += `<text x="${centroid.x}" y="${centroid.y}" fill="${team ? team.color : '#4b5563'}" font-size="12" font-family="monospace" text-anchor="middle" dominant-baseline="middle" opacity="${team ? 1 : 0.8}">${region.name || (region.spaceType ? region.spaceType.toUpperCase() : 'AREA')}</text>`;
        
        if (team) {
          svgContent += `<text x="${centroid.x}" y="${centroid.y + 14}" fill="${team.color}" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${team.name}</text>`;
          if (team.managerName) {
            svgContent += `<text x="${centroid.x}" y="${centroid.y + 26}" fill="${team.color}" font-size="8" font-family="monospace" text-anchor="middle" dominant-baseline="middle">Mgr: ${team.managerName}</text>`;
          }
          if (team.department) {
            svgContent += `<text x="${centroid.x}" y="${centroid.y + 36}" fill="${team.color}" font-size="8" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${team.department}</text>`;
          }
        }
      }
    }

    // Edges & Elements
    for (const edge of Object.values(spatialDoc.edges)) {
      const start = spatialDoc.nodes[edge.startNodeId].position;
      const end = spatialDoc.nodes[edge.endNodeId].position;
      const len = distance(start, end);
      
      svgContent += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="#4b5563" stroke-width="2" stroke-linecap="round" />`;
      
      if (edge.elements && edge.elements.length > 0) {
        const dx = (end.x - start.x) / len;
        const dy = (end.y - start.y) / len;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        for (const el of edge.elements) {
          const cx = start.x + dx * (el.t * len);
          const cy = start.y + dy * (el.t * len);
          
          svgContent += `<g transform="translate(${cx}, ${cy}) rotate(${angle})">`;
          svgContent += `<rect x="${-el.length/2}" y="-2" width="${el.length}" height="4" fill="white" />`; // cut line
          
          if (el.type === 'door') {
            svgContent += `<line x1="${-el.length/2}" y1="0" x2="${-el.length/2}" y2="${el.length}" stroke="#6b7280" stroke-width="2" />`;
            svgContent += `<path d="M ${-el.length/2} ${el.length} A ${el.length} ${el.length} 0 0 1 ${el.length/2} 0" fill="none" stroke="#6b7280" stroke-width="1" stroke-dasharray="2,2" />`;
          } else if (el.type === 'window') {
            svgContent += `<rect x="${-el.length/2}" y="-2" width="${el.length}" height="4" fill="none" stroke="#9ca3af" stroke-width="1" />`;
            svgContent += `<line x1="${-el.length/2}" y1="0" x2="${el.length/2}" y2="0" stroke="#3b82f6" stroke-width="2" />`;
          }
          svgContent += `</g>`;
        }
      }
    }

    // Furniture
    for (const f of Object.values(spatialDoc.furniture)) {
      const team = f.teamId ? spatialDoc.teams[f.teamId] : (f.hostRegionId && spatialDoc.regions[f.hostRegionId]?.teamId ? spatialDoc.teams[spatialDoc.regions[f.hostRegionId].teamId!] : null);
      const person = f.personId ? spatialDoc.people[f.personId] : null;

      // Darker colors for light background export
      const baseFill = team ? team.color : (f.type === 'plant' ? '#166534' : (f.type === 'chair' ? '#9ca3af' : (f.type === 'whiteboard' ? '#f4f4f5' : '#d1d5db')));
      const strokeColor = f.type === 'plant' ? '#14532d' : (f.type === 'whiteboard' ? '#71717a' : '#4b5563');
      const sw = 2; // Fixed stroke width for export

      svgContent += `<g transform="translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})">`;
      
      if (f.type === 'desk') {
        svgContent += `<rect x="-20" y="-12" width="40" height="24" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="2" />`;
        svgContent += `<rect x="-10" y="-10" width="20" height="4" fill="${strokeColor}" rx="1" opacity="0.6" />`;
        svgContent += `<rect x="-6" y="1" width="12" height="5" fill="${strokeColor}" rx="0.5" opacity="0.4" />`;
      } else if (f.type === 'table') {
        svgContent += `<path d="M -8 -15 Q 0 -20 8 -15" fill="none" stroke="${strokeColor}" stroke-width="${sw * 2}" opacity="0.6" />`;
        svgContent += `<path d="M -8 15 Q 0 20 8 15" fill="none" stroke="${strokeColor}" stroke-width="${sw * 2}" opacity="0.6" />`;
        svgContent += `<path d="M -15 -8 Q -20 0 -15 8" fill="none" stroke="${strokeColor}" stroke-width="${sw * 2}" opacity="0.6" />`;
        svgContent += `<path d="M 15 -8 Q 20 0 15 8" fill="none" stroke="${strokeColor}" stroke-width="${sw * 2}" opacity="0.6" />`;
        svgContent += `<circle r="15" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
      } else if (f.type === 'chair') {
        svgContent += `<path d="M -9 2 C -9 -6, 9 -6, 9 2" fill="none" stroke="${strokeColor}" stroke-width="${sw * 2}" stroke-linecap="round" />`;
        svgContent += `<rect x="-7" y="-3" width="14" height="12" rx="4" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
      } else if (f.type === 'plant') {
        svgContent += `<circle cx="-4" cy="-4" r="7" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" opacity="0.8" />`;
        svgContent += `<circle cx="4" cy="-4" r="7" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" opacity="0.8" />`;
        svgContent += `<circle cx="-4" cy="4" r="7" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" opacity="0.8" />`;
        svgContent += `<circle cx="4" cy="4" r="7" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" opacity="0.8" />`;
        svgContent += `<circle cx="0" cy="0" r="4" fill="#451a03" stroke="${strokeColor}" stroke-width="${sw}" />`;
      } else if (f.type === 'sofa') {
        svgContent += `<rect x="-20" y="-10" width="40" height="20" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="4" />`;
        svgContent += `<rect x="-18" y="-14" width="36" height="10" fill="${strokeColor}" rx="2" opacity="0.6" />`;
        svgContent += `<rect x="-22" y="-12" width="6" height="20" fill="${strokeColor}" rx="2" opacity="0.6" />`;
        svgContent += `<rect x="16" y="-12" width="6" height="20" fill="${strokeColor}" rx="2" opacity="0.6" />`;
      } else if (f.type === 'whiteboard') {
        svgContent += `<rect x="-20" y="-3" width="40" height="6" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="1" />`;
        svgContent += `<line x1="-15" y1="3" x2="-17" y2="8" stroke="${strokeColor}" stroke-width="${sw}" stroke-linecap="round" />`;
        svgContent += `<line x1="15" y1="3" x2="17" y2="8" stroke="${strokeColor}" stroke-width="${sw}" stroke-linecap="round" />`;
      } else if (f.type === 'cabinet') {
        svgContent += `<rect x="-12" y="-10" width="24" height="20" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="1" />`;
        svgContent += `<line x1="-8" y1="-5" x2="8" y2="-5" stroke="${strokeColor}" stroke-width="${sw * 0.75}" stroke-linecap="round" opacity="0.6" />`;
        svgContent += `<line x1="-8" y1="0" x2="8" y2="0" stroke="${strokeColor}" stroke-width="${sw * 0.75}" stroke-linecap="round" opacity="0.6" />`;
        svgContent += `<line x1="-8" y1="5" x2="8" y2="5" stroke="${strokeColor}" stroke-width="${sw * 0.75}" stroke-linecap="round" opacity="0.6" />`;
      } else if (f.type === 'watercooler') {
        svgContent += `<rect x="-6" y="-6" width="12" height="12" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="2" />`;
        svgContent += `<circle cx="0" cy="0" r="4" fill="#60a5fa" stroke="${strokeColor}" stroke-width="${sw * 0.5}" />`;
        svgContent += `<rect x="-3" y="6" width="6" height="3" fill="${strokeColor}" rx="1" opacity="0.6" />`;
      } else if (f.type === 'cubicle') {
        svgContent += `<path d="M -24 20 L -24 -20 L 24 -20 L 24 20" fill="none" stroke="${strokeColor}" stroke-width="${sw * 3}" stroke-linecap="square" />`;
        svgContent += `<rect x="-20" y="-18" width="40" height="20" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="1" />`;
        svgContent += `<rect x="-10" y="-16" width="20" height="4" fill="${strokeColor}" rx="1" opacity="0.6" />`;
        svgContent += `<rect x="-6" y="6" width="12" height="10" rx="4" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
        svgContent += `<path d="M -8 15 C -8 20, 8 20, 8 15" fill="none" stroke="${strokeColor}" stroke-width="${sw * 1.5}" stroke-linecap="round" />`;
      } else if (f.type === 'toilet') {
        svgContent += `<rect x="-8" y="-14" width="16" height="10" rx="2" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
        svgContent += `<ellipse cx="0" cy="2" rx="7" ry="10" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
      } else if (f.type === 'sink') {
        svgContent += `<rect x="-12" y="-10" width="24" height="16" rx="2" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" />`;
        svgContent += `<ellipse cx="0" cy="-2" rx="8" ry="5" fill="${strokeColor}" opacity="0.3" />`;
        svgContent += `<circle cx="0" cy="-8" r="1.5" fill="${strokeColor}" />`;
      } else if (f.type === 'server_rack') {
        svgContent += `<rect x="-12" y="-15" width="24" height="30" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="1" />`;
        svgContent += `<line x1="-8" y1="-10" x2="8" y2="-10" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.8" />`;
        svgContent += `<line x1="-8" y1="-5" x2="8" y2="-5" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.8" />`;
        svgContent += `<line x1="-8" y1="0" x2="8" y2="0" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.8" />`;
        svgContent += `<line x1="-8" y1="5" x2="8" y2="5" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.8" />`;
        svgContent += `<line x1="-8" y1="10" x2="8" y2="10" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.8" />`;
      } else if (f.type === 'printer') {
        svgContent += `<rect x="-14" y="-12" width="28" height="20" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="3" />`;
        svgContent += `<rect x="-8" y="-14" width="16" height="6" fill="${strokeColor}" opacity="0.3" />`;
        svgContent += `<rect x="-10" y="8" width="20" height="6" fill="${strokeColor}" opacity="0.3" />`;
      } else if (f.type === 'bookshelf') {
        svgContent += `<rect x="-18" y="-8" width="36" height="16" fill="${baseFill}" stroke="${strokeColor}" stroke-width="${sw}" rx="1" />`;
        svgContent += `<line x1="-12" y1="-8" x2="-12" y2="8" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.5" />`;
        svgContent += `<line x1="-6" y1="-8" x2="-6" y2="8" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.5" />`;
        svgContent += `<line x1="0" y1="-8" x2="0" y2="8" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.5" />`;
        svgContent += `<line x1="6" y1="-8" x2="6" y2="8" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.5" />`;
        svgContent += `<line x1="12" y1="-8" x2="12" y2="8" stroke="${strokeColor}" stroke-width="${sw * 0.75}" opacity="0.5" />`;
      } else if (f.type === 'tv') {
        svgContent += `<rect x="-20" y="-3" width="40" height="6" fill="${strokeColor}" rx="1" opacity="0.8" />`;
        svgContent += `<rect x="-22" y="-2" width="44" height="4" fill="#3b82f6" opacity="0.8" rx="1" />`;
        svgContent += `<line x1="-10" y1="3" x2="-10" y2="8" stroke="${strokeColor}" stroke-width="${sw}" />`;
        svgContent += `<line x1="10" y1="3" x2="10" y2="8" stroke="${strokeColor}" stroke-width="${sw}" />`;
        svgContent += `<line x1="-15" y1="8" x2="15" y2="8" stroke="${strokeColor}" stroke-width="${sw}" />`;
      }

      if (person) {
        const textY = f.type === 'desk' || f.type === 'cubicle' ? -15 : -20;
        svgContent += `<text y="${textY}" fill="${team ? team.color : '#4b5563'}" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">${person.name}</text>`;
        if (person.role) {
          svgContent += `<text y="${textY + 10}" fill="${team ? team.color : '#6b7280'}" font-size="6" font-family="sans-serif" text-anchor="middle">${person.role}</text>`;
        }
        if (team) {
          svgContent += `<text y="${textY + 18}" fill="${team.color}" font-size="5" font-family="sans-serif" text-anchor="middle">${team.name}</text>`;
        }
      }

      svgContent += `</g>`;
    }

    svgContent += `</svg>`;
    return svgContent;
  };

  const handleExportSvg = () => {
    const svgContent = getSvgString();
    if (!svgContent) {
      return;
    }
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floorplan.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = () => {
    const svgContent = getSvgString();
    if (!svgContent) {
      return;
    }
    
    // We need to render the SVG string to a canvas, then export to PNG
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'floorplan.png';
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="h-12 bg-[#2c2c2c] border-b border-[#3e3e3e] flex items-center justify-between px-4 shrink-0 z-50">
      <div className="font-semibold tracking-wide text-white">Spatial Editor</div>
      
      <div className="flex items-center gap-2">
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-[#3e3e3e] rounded border border-transparent transition-colors"
          onClick={handleExportSvg}
        >
          <Download size={14} /> Export SVG
        </button>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-[#3e3e3e] rounded border border-transparent transition-colors"
          onClick={handleExportPng}
        >
          <ImageIcon size={14} /> Export PNG
        </button>
        <div className="w-[1px] h-4 bg-[#4a4a4a] mx-2" />
        <button 
          className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-transparent transition-colors ${
            confirmClear 
              ? 'text-white bg-red-600 hover:bg-red-700' 
              : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
          }`}
          onClick={handleClear}
        >
          <Trash2 size={14} /> {confirmClear ? 'Click again to confirm' : 'Clear'}
        </button>
      </div>
    </div>
  );
}
