import { Point, SpatialFurniture } from '../types';

export interface TemplateDefinition {
  nodes: Point[];
  edges: [number, number][]; // pairs of node indices
  furniture: { type: SpatialFurniture['type'], position: Point, rotation: number }[];
}

export function getTemplateDefinition(templateType: string): TemplateDefinition {
  const nodes: Point[] = [];
  const edges: [number, number][] = [];
  const furniture: { type: SpatialFurniture['type'], position: Point, rotation: number }[] = [];

  const addN = (x: number, y: number) => {
    nodes.push({ x, y });
    return nodes.length - 1;
  };
  const addE = (n1: number, n2: number) => {
    edges.push([n1, n2]);
  };
  const addF = (type: SpatialFurniture['type'], x: number, y: number, rot: number) => {
    furniture.push({ type, position: { x, y }, rotation: rot });
  };

  if (templateType === '4-person-pod') {
    addF('desk', -22, -15, 0);
    addF('desk', 22, -15, 0);
    addF('desk', -22, 15, 180);
    addF('desk', 22, 15, 180);
  } else if (templateType === 'manager-office') {
    addF('desk', 0, -10, 0);
    addF('bookshelf', 0, -35, 0);
    addF('plant', -35, -30, 0);
    addF('chair', -15, 15, 0);
    addF('chair', 15, 15, 0);
  } else if (templateType === 'meeting-area') {
    addF('table', 0, 0, 0);
    addF('tv', 0, -30, 0);
    addF('chair', -25, 0, 90);
    addF('chair', 25, 0, -90);
    addF('chair', -10, -20, 180);
    addF('chair', 10, -20, 180);
    addF('chair', -10, 20, 0);
    addF('chair', 10, 20, 0);
  } else if (templateType === 'lounge-area') {
    addF('sofa', 0, -20, 0);
    addF('sofa', -20, 0, 90);
    addF('sofa', 20, 0, -90);
    addF('table', 0, 0, 0);
    addF('plant', -30, -30, 0);
  } else if (templateType === 'startup-office') {
    const n0 = addN(0, 0);
    const n1 = addN(150, 0);
    const n2 = addN(400, 0);
    const n3 = addN(400, 150);
    const n4 = addN(400, 300);
    const n5 = addN(150, 300);
    const n6 = addN(0, 300);
    const n7 = addN(150, 150);
    
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n4); addE(n4, n5); addE(n5, n6); addE(n6, n0);
    addE(n1, n7); addE(n7, n5);
    addE(n7, n3);
    
    addF('desk', 75, 150, 90);
    addF('sofa', 40, 50, 180);
    addF('plant', 20, 20, 0);
    
    addF('table', 275, 75, 0);
    addF('chair', 225, 75, 90);
    addF('chair', 325, 75, -90);
    addF('chair', 275, 45, 180);
    addF('chair', 275, 105, 0);
    addF('tv', 275, 10, 0);
    
    addF('desk', 253, 210, 0);
    addF('desk', 297, 210, 0);
    addF('desk', 253, 240, 180);
    addF('desk', 297, 240, 180);
    addF('printer', 370, 170, -90);
  } else if (templateType === 'team-room') {
    const n0 = addN(0, 0);
    const n1 = addN(200, 0);
    const n2 = addN(200, 200);
    const n3 = addN(0, 200);
    
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n0);
    
    addF('desk', 78, 85, 0);
    addF('desk', 122, 85, 0);
    addF('desk', 78, 115, 180);
    addF('desk', 122, 115, 180);
    addF('whiteboard', 100, 10, 0);
    addF('plant', 20, 20, 0);
    addF('bookshelf', 180, 100, -90);
  } else if (templateType === 'open-bay') {
    const n0 = addN(0, 0);
    const n1 = addN(400, 0);
    const n2 = addN(400, 200);
    const n3 = addN(0, 200);
    
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n0);
    
    addF('desk', 78, 100, 0);
    addF('desk', 122, 100, 0);
    addF('desk', 78, 130, 180);
    addF('desk', 122, 130, 180);
    
    addF('desk', 278, 100, 0);
    addF('desk', 322, 100, 0);
    addF('desk', 278, 130, 180);
    addF('desk', 322, 130, 180);
    
    addF('watercooler', 200, 20, 0);
    addF('plant', 20, 20, 0);
    addF('plant', 380, 20, 0);
  } else if (templateType === 'l-shape-room') {
    const n0 = addN(0, 0);
    const n1 = addN(200, 0);
    const n2 = addN(200, 100);
    const n3 = addN(100, 100);
    const n4 = addN(100, 200);
    const n5 = addN(0, 200);
    
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n4); addE(n4, n5); addE(n5, n0);
  } else if (templateType === 'full-floor') {
    const n0 = addN(0, 0);
    const n1 = addN(800, 0);
    const n2 = addN(800, 600);
    const n3 = addN(0, 600);
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n0);
    
    const c0 = addN(300, 200);
    const c1 = addN(500, 200);
    const c2 = addN(500, 400);
    const c3 = addN(300, 400);
    addE(c0, c1); addE(c1, c2); addE(c2, c3); addE(c3, c0);
    
    addF('plant', 30, 30, 0);
    addF('plant', 770, 30, 0);
    addF('plant', 770, 570, 0);
    addF('plant', 30, 570, 0);
    
    for (let i = 0; i < 4; i++) {
      addF('desk', 100 + i * 50, 100, 0);
      addF('desk', 100 + i * 50, 130, 180);
    }
  } else if (templateType === 'full-office') {
    const n0 = addN(0, 0);
    const n1 = addN(600, 0);
    const n2 = addN(600, 400);
    const n3 = addN(0, 400);
    addE(n0, n1); addE(n1, n2); addE(n2, n3); addE(n3, n0);
    
    const m1 = addN(200, 0);
    const m2 = addN(200, 400);
    addE(m1, m2);
    
    const m3 = addN(400, 0);
    const m4 = addN(400, 400);
    addE(m3, m4);
    
    const r1 = addN(0, 200);
    const r2 = addN(200, 200);
    addE(r1, r2);
    
    addF('desk', 100, 100, 90);
    addF('desk', 100, 300, 90);
    addF('table', 300, 200, 0);
    addF('chair', 270, 200, 90);
    addF('chair', 330, 200, -90);
  }

  return { nodes, edges, furniture };
}
