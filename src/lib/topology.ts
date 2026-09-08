import { SpatialNode, SpatialEdge, SpatialRegion } from '../types';

interface HalfEdge {
  id: string;
  edgeId: string;
  startNodeId: string;
  endNodeId: string;
  angle: number;
  next?: HalfEdge;
  visited: boolean;
}

export function extractRegions(
  nodes: Record<string, SpatialNode>,
  edges: Record<string, SpatialEdge>
): SpatialRegion[] {
  // 1. Create half-edges
  const halfEdges: Record<string, HalfEdge> = {};
  const outgoingFromNode: Record<string, HalfEdge[]> = {};
  
  for (const nodeId in nodes) {
    outgoingFromNode[nodeId] = [];
  }

  for (const edge of Object.values(edges)) {
    const p1 = nodes[edge.startNodeId].position;
    const p2 = nodes[edge.endNodeId].position;
    
    // Angle from p1 to p2
    const angle12 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    // Angle from p2 to p1
    const angle21 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    
    const he1: HalfEdge = {
      id: `${edge.id}_fwd`,
      edgeId: edge.id,
      startNodeId: edge.startNodeId,
      endNodeId: edge.endNodeId,
      angle: angle12,
      visited: false
    };
    
    const he2: HalfEdge = {
      id: `${edge.id}_rev`,
      edgeId: edge.id,
      startNodeId: edge.endNodeId,
      endNodeId: edge.startNodeId,
      angle: angle21,
      visited: false
    };
    
    halfEdges[he1.id] = he1;
    halfEdges[he2.id] = he2;
    
    outgoingFromNode[edge.startNodeId].push(he1);
    outgoingFromNode[edge.endNodeId].push(he2);
  }

  // 2. Sort half-edges angularly (counter-clockwise)
  for (const nodeId in outgoingFromNode) {
    outgoingFromNode[nodeId].sort((a, b) => a.angle - b.angle);
  }

  // 3. Link half-edges (next)
  for (const he of Object.values(halfEdges)) {
    // The incoming half-edge goes to he.endNodeId.
    // We want to find the reverse half edge in the outgoing list of he.endNodeId.
    const outgoing = outgoingFromNode[he.endNodeId];
    if (outgoing.length === 0) continue; // Should not happen
    
    // Find the reverse edge. Its angle is roughly (he.angle + Math.PI) % 2PI
    const reverseHeId = he.id.endsWith('_fwd') ? `${he.edgeId}_rev` : `${he.edgeId}_fwd`;
    const reverseIdx = outgoing.findIndex(e => e.id === reverseHeId);
    
    if (reverseIdx !== -1) {
      // The "next" edge to form a face is the one immediately *before* the reverse edge 
      // in the counter-clockwise sorted list.
      const nextIdx = (reverseIdx - 1 + outgoing.length) % outgoing.length;
      he.next = outgoing[nextIdx];
    }
  }

  // 4. Extract faces
  const regions: SpatialRegion[] = [];
  
  for (const he of Object.values(halfEdges)) {
    if (he.visited || !he.next) continue;
    
    // Traverse the cycle
    const cycle: HalfEdge[] = [];
    let current = he;
    let isCycle = false;
    
    while (!current.visited) {
      current.visited = true;
      cycle.push(current);
      if (!current.next) break;
      current = current.next;
      if (current === he) {
        isCycle = true;
        break;
      }
    }
    
    if (isCycle && cycle.length >= 3) {
      // Calculate signed area
      let signedArea = 0;
      for (const edge of cycle) {
        const p1 = nodes[edge.startNodeId].position;
        const p2 = nodes[edge.endNodeId].position;
        signedArea += (p1.x * p2.y - p2.x * p1.y);
      }
      signedArea /= 2;
      
      // If area > 0 (counter-clockwise in standard math, but SVG y points down),
      // Actually SVG y is down, so cross product polarity is flipped.
      // Let's just find the area magnitude, and classify based on signedArea.
      // In SVG coordinates (y points down):
      // Clockwise polygon has signedArea > 0 (this is an internal face).
      // Counter-clockwise polygon has signedArea < 0 (this is the outer boundary).
      // We only care about internal faces for regions.
      // We will skip outer boundary or zero-area (sticks).
      
      if (signedArea > 1e-6) {
        regions.push({
          id: `region_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          boundaryEdgeIds: cycle.map(c => c.edgeId),
          area: Math.abs(signedArea)
        });
      }
    }
  }

  return regions;
}
