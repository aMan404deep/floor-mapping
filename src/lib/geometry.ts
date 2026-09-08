import { Point, SpatialNode, SpatialEdge } from '../types';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Distance from a point to a line segment
export function distanceToSegment(p: Point, v: Point, w: Point): number {
  const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

export function projectPointOnSegment(p: Point, v: Point, w: Point): Point {
  const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
  if (l2 === 0) return v;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
}

export function screenToWorld(
  screenPoint: Point,
  camera: { x: number; y: number; zoom: number },
  canvasRect: DOMRect
): Point {
  return {
    x: (screenPoint.x - canvasRect.left - camera.x) / camera.zoom,
    y: (screenPoint.y - canvasRect.top - camera.y) / camera.zoom,
  };
}

export function worldToScreen(
  worldPoint: Point,
  camera: { x: number; y: number; zoom: number },
  canvasRect: DOMRect
): Point {
  return {
    x: worldPoint.x * camera.zoom + camera.x + canvasRect.left,
    y: worldPoint.y * camera.zoom + camera.y + canvasRect.top,
  };
}

// Check if two line segments (p1, p2) and (p3, p4) intersect.
// Returns the intersection point or null.
export function segmentIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null; // Lines are parallel

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

  // Is the intersection along the segments?
  // We use a small epsilon to avoid splitting at exact endpoints if they touch.
  const epsilon = 1e-6;
  if (ua > epsilon && ua < 1 - epsilon && ub > epsilon && ub < 1 - epsilon) {
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  }
  return null;
}

export function polygonArea(points: Point[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function polygonCentroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  if (points.length === 2) return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };

  let cx = 0, cy = 0, area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const cross = (p1.x * p2.y - p2.x * p1.y);
    area += cross;
    cx += (p1.x + p2.x) * cross;
    cy += (p1.y + p2.y) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-6) return points[0];
  return { x: cx / (6 * area), y: cy / (6 * area) };
}

export function pointInPolygon(point: Point, vs: Point[]): boolean {
  // Ray-casting algorithm
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x, yi = vs[i].y;
    let xj = vs[j].x, yj = vs[j].y;

    let intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getShapePoints(shapeType: string, center: Point, size: number = 150): Point[] {
  let pts: Point[] = [];
  const cx = center.x;
  const cy = center.y;
  
  if (shapeType === 'square') {
    pts = [
      { x: cx - size, y: cy - size },
      { x: cx + size, y: cy - size },
      { x: cx + size, y: cy + size },
      { x: cx - size, y: cy + size },
    ];
  } else if (shapeType === 'rectangle') {
    pts = [
      { x: cx - size*1.5, y: cy - size },
      { x: cx + size*1.5, y: cy - size },
      { x: cx + size*1.5, y: cy + size },
      { x: cx - size*1.5, y: cy + size },
    ];
  } else if (shapeType === 'l-shape') {
    pts = [
      { x: cx - size, y: cy - size },
      { x: cx + size/2, y: cy - size },
      { x: cx + size/2, y: cy },
      { x: cx + size, y: cy },
      { x: cx + size, y: cy + size },
      { x: cx - size, y: cy + size },
    ];
  } else if (shapeType === 't-shape') {
    pts = [
      { x: cx - size, y: cy - size },
      { x: cx + size, y: cy - size },
      { x: cx + size, y: cy },
      { x: cx + size/3, y: cy },
      { x: cx + size/3, y: cy + size },
      { x: cx - size/3, y: cy + size },
      { x: cx - size/3, y: cy },
      { x: cx - size, y: cy },
    ];
  } else if (shapeType === 'u-shape') {
    pts = [
      { x: cx - size, y: cy - size },
      { x: cx - size/2, y: cy - size },
      { x: cx - size/2, y: cy + size/2 },
      { x: cx + size/2, y: cy + size/2 },
      { x: cx + size/2, y: cy - size },
      { x: cx + size, y: cy - size },
      { x: cx + size, y: cy + size },
      { x: cx - size, y: cy + size },
    ];
  } else if (shapeType === 'cross') {
    pts = [
      { x: cx - size/3, y: cy - size }, { x: cx + size/3, y: cy - size },
      { x: cx + size/3, y: cy - size/3 }, { x: cx + size, y: cy - size/3 },
      { x: cx + size, y: cy + size/3 }, { x: cx + size/3, y: cy + size/3 },
      { x: cx + size/3, y: cy + size }, { x: cx - size/3, y: cy + size },
      { x: cx - size/3, y: cy + size/3 }, { x: cx - size, y: cy + size/3 },
      { x: cx - size, y: cy - size/3 }, { x: cx - size/3, y: cy - size/3 }
    ];
  } else if (shapeType === 'h-shape') {
    pts = [
      { x: cx - size, y: cy - size }, { x: cx - size/3, y: cy - size },
      { x: cx - size/3, y: cy - size/3 }, { x: cx + size/3, y: cy - size/3 },
      { x: cx + size/3, y: cy - size }, { x: cx + size, y: cy - size },
      { x: cx + size, y: cy + size }, { x: cx + size/3, y: cy + size },
      { x: cx + size/3, y: cy + size/3 }, { x: cx - size/3, y: cy + size/3 },
      { x: cx - size/3, y: cy + size }, { x: cx - size, y: cy + size }
    ];
  } else if (shapeType === 'octagon') {
    const a = size * 0.414; // offset for roughly regular octagon in grid
    pts = [
      { x: cx - size, y: cy - a }, { x: cx - a, y: cy - size },
      { x: cx + a, y: cy - size }, { x: cx + size, y: cy - a },
      { x: cx + size, y: cy + a }, { x: cx + a, y: cy + size },
      { x: cx - a, y: cy + size }, { x: cx - size, y: cy + a }
    ];
  }
  
  return pts;
}
