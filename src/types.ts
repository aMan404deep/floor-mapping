export type Point = { x: number; y: number };

export type NodeId = string;
export type EdgeId = string;
export type RegionId = string;

export interface SpatialNode {
  id: NodeId;
  position: Point;
  // A node can optionally hold references to connected edges if we want,
  // but keeping a flat list of edges referencing nodes is often easier for React state.
}

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'curve';

export interface EdgeElement {
  id: string;
  type: 'door' | 'window';
  // Position along the edge from 0 to 1
  t: number;
  length: number; // pixel length of the door/window
}

export interface SpatialEdge {
  id: EdgeId;
  startNodeId: NodeId;
  endNodeId: NodeId;
  type: 'line' | 'curve';
  controlPoint?: Point; // For quadratic bezier
  elements?: EdgeElement[];
}

export interface SpatialRegion {
  id: RegionId;
  boundaryEdgeIds: EdgeId[];
  // Precomputed area or metadata
  area?: number;
  name?: string;
  type?: 'room' | 'corridor' | 'exterior';
  
  // Organizational metadata
  spaceType?: 'cabin' | 'meeting' | 'open' | 'reception' | 'circulation' | 'bay' | 'cubicle' | 'pantry' | 'breakout' | 'washroom' | 'server_room' | 'storage' | 'lounge' | 'print_station' | 'wellness';
  capacity?: number;
  teamId?: string; // Assigned Team
}

export type FurnitureId = string;

export interface SpatialFurniture {
  id: FurnitureId;
  type: 'desk' | 'table' | 'chair' | 'plant' | 'sofa' | 'whiteboard' | 'cabinet' | 'watercooler' | 'cubicle' | 'toilet' | 'sink' | 'server_rack' | 'printer' | 'bookshelf' | 'tv';
  position: Point;
  rotation: number;
  
  // Hierarchy & Organizational metadata
  hostRegionId?: string; // Calculated region it sits in
  teamId?: string;       // Explicitly assigned to a team
  personId?: string;     // Explicitly assigned to a person
}

export interface Team {
  id: string;
  name: string;
  color: string;
  managerName?: string;
  department?: string;
}

export interface Person {
  id: string;
  name: string;
  teamId?: string;
  role?: string;
  email?: string;
  phone?: string;
  field?: string;
}

export interface SpatialDocument {
  nodes: Record<NodeId, SpatialNode>;
  edges: Record<EdgeId, SpatialEdge>;
  regions: Record<RegionId, SpatialRegion>;
  furniture: Record<FurnitureId, SpatialFurniture>;
  teams: Record<string, Team>;
  people: Record<string, Person>;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface EditorState {
  document: SpatialDocument;
  camera: Camera;
  activeTool: ToolType;
  selectedIds: string[];
  
  // Interaction state
  isDragging: boolean;
  isPanning: boolean;
  drawingEdgeStartNodeId: NodeId | null;
  cursorWorldPosition: Point;
}
