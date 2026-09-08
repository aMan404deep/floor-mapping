import { Point, NodeId, EdgeId, RegionId, SpatialNode, SpatialEdge, SpatialRegion, SpatialDocument, Camera, ToolType, Person, Team, SpatialFurniture } from '../types';
import { distance, segmentIntersection, distanceToSegment, getShapePoints } from '../lib/geometry';
import { extractRegions } from '../lib/topology';
import { getTemplateDefinition } from '../lib/templates';

type Listener = () => void;


class EditorStore {
  private document: SpatialDocument = { nodes: {}, edges: {}, regions: {}, furniture: {}, teams: {}, people: {} };
  private camera: Camera = { x: 0, y: 0, zoom: 1 };
  private activeTool: ToolType = 'select';
  private selectedIds: Set<string> = new Set();
  
  private isPanning: boolean = false;
  private gridSnapEnabled: boolean = false;
  private drawingEdgeStartNodeId: NodeId | null = null;
  private curveStep: 0 | 1 | 2 = 0;
  private curveStartNodeId: NodeId | null = null;
  private curveEndTarget: { nodeId?: NodeId, pos: Point } | null = null;
  private cursorWorldPosition: Point = { x: 0, y: 0 };
  
  private draggingShapeType: string | null = null;
  private draggingFurnitureType: string | null = null;
  private draggingTemplateType: string | null = null;
  private dragPreviewPosition: Point | null = null;
  
  private viewMode: 'default' | 'vacancies' | 'team_highlight' = 'default';
  private highlightTeamId: string | null = null;
  
  // UX enhancements
  private leftSidebarOpen: boolean = true;
  private rightSidebarOpen: boolean = true;
  private isPreviewMode: boolean = false;
  private selectionBox: { start: Point; end: Point } | null = null;
  private contextMenu: { x: number; y: number; targetId?: string; targetType?: 'furniture' | 'node' | 'edge' | 'region' } | null = null;

  private listeners: Set<Listener> = new Set();
  
  // History
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  private version: number = 0;
  private saveTimeout: number | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  getVersion() { return this.version; }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.version++;
    this.listeners.forEach((l) => l());
    
    if (this.saveTimeout) window.clearTimeout(this.saveTimeout);
    this.saveTimeout = window.setTimeout(() => this.saveToLocalStorage(), 1000);
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('spatial_document', JSON.stringify(this.document));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('spatial_document');
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.furniture) parsed.furniture = {};
        if (!parsed.teams) parsed.teams = {};
        if (!parsed.people) parsed.people = {};
        this.document = parsed;
      }
    } catch (e) {
      console.error('Failed to load from local storage', e);
    }
  }

  clearDocument() {
    this.commit();
    this.document = { nodes: {}, edges: {}, regions: {}, furniture: {}, teams: {}, people: {} };
    this.selectedIds.clear();
    this.emit();
  }

  // History Management
  commit() {
    this.undoStack.push(JSON.stringify(this.document));
    this.redoStack = [];
    if (this.undoStack.length > 50) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(JSON.stringify(this.document));
    this.document = JSON.parse(this.undoStack.pop()!);
    this.selectedIds.clear();
    this.emit();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(JSON.stringify(this.document));
    this.document = JSON.parse(this.redoStack.pop()!);
    this.selectedIds.clear();
    this.emit();
  }

  updateRegion(id: string, data: Partial<SpatialRegion>) {
    if (this.document.regions[id]) {
      this.commit();
      this.document.regions[id] = { ...this.document.regions[id], ...data };
      this.emit();
    }
  }

  updateFurniture(id: string, data: Partial<SpatialFurniture>) {
    if (this.document.furniture[id]) {
      this.commit();
      this.document.furniture[id] = { ...this.document.furniture[id], ...data };
      this.emit();
    }
  }

  // Getters
  getDocument() { return this.document; }
  getCamera() { return this.camera; }
  getActiveTool() { return this.activeTool; }
  getSelectedIds() { return Array.from(this.selectedIds); }
  getIsPanning() { return this.isPanning; }
  getGridSnapEnabled() { return this.gridSnapEnabled; }
  getDrawingEdgeStartNodeId() { return this.drawingEdgeStartNodeId; }
  getCurveStep() { return this.curveStep; }
  getCurveStartNodeId() { return this.curveStartNodeId; }
  getCurveEndTarget() { return this.curveEndTarget; }
  getCursorWorldPosition() { return this.cursorWorldPosition; }
  getDraggingShapeType() { return this.draggingShapeType; }
  getDragPreviewPosition() { return this.dragPreviewPosition; }
  getViewMode() { return this.viewMode; }
  getHighlightTeamId() { return this.highlightTeamId; }
  
  // UX Getters
  getLeftSidebarOpen() { return this.leftSidebarOpen; }
  getRightSidebarOpen() { return this.rightSidebarOpen; }
  getIsPreviewMode() { return this.isPreviewMode; }
  getSelectionBox() { return this.selectionBox; }
  getContextMenu() { return this.contextMenu; }

  // Setters
  setLeftSidebarOpen(open: boolean) { this.leftSidebarOpen = open; this.emit(); }
  setRightSidebarOpen(open: boolean) { this.rightSidebarOpen = open; this.emit(); }
  setIsPreviewMode(preview: boolean) { this.isPreviewMode = preview; this.emit(); }
  setSelectionBox(box: { start: Point; end: Point } | null) { this.selectionBox = box; this.emit(); }
  setContextMenu(menu: { x: number; y: number; targetId?: string; targetType?: 'furniture' | 'node' | 'edge' | 'region' } | null) { this.contextMenu = menu; this.emit(); }

  setViewMode(mode: 'default' | 'vacancies' | 'team_highlight', teamId?: string) {
    this.viewMode = mode;
    if (teamId !== undefined) {
      this.highlightTeamId = teamId;
    }
    this.emit();
  }

  setCamera(camera: Camera) {
    this.camera = camera;
    this.emit();
  }

  setActiveTool(tool: ToolType) {
    this.activeTool = tool;
    this.drawingEdgeStartNodeId = null;
    this.cancelCurve();
    this.emit();
  }

  setCursorWorldPosition(pos: Point) {
    this.cursorWorldPosition = pos;
    this.emit();
  }

  setIsPanning(isPanning: boolean) {
    this.isPanning = isPanning;
    this.emit();
  }
  
  setDraggingShapeType(type: string | null) {
    this.draggingShapeType = type;
    this.emit();
  }

  getDraggingFurnitureType() { return this.draggingFurnitureType; }
  setDraggingFurnitureType(type: string | null) {
    this.draggingFurnitureType = type;
    this.emit();
  }

  getDraggingTemplateType() { return this.draggingTemplateType; }
  setDraggingTemplateType(type: string | null) {
    this.draggingTemplateType = type;
    this.emit();
  }

  setDragPreviewPosition(pos: Point | null) {
    this.dragPreviewPosition = pos;
    this.emit();
  }

  toggleGridSnap() {
    this.gridSnapEnabled = !this.gridSnapEnabled;
    this.emit();
  }

  select(id: string, additive: boolean = false) {
    if (!additive) this.selectedIds.clear();
    this.selectedIds.add(id);
    this.emit();
  }

  clearSelection() {
    this.selectedIds.clear();
    this.emit();
  }
  
  startCurve(nodeId: NodeId) {
    this.curveStartNodeId = nodeId;
    this.curveStep = 1;
    this.emit();
  }

  setCurveEnd(pos: Point, nodeId?: NodeId) {
    this.curveEndTarget = { pos, nodeId };
    this.curveStep = 2;
    this.emit();
  }

  finishCurve(controlPos: Point) {
    if (!this.curveStartNodeId || !this.curveEndTarget) return;

    this.commit();

    const p0 = this.document.nodes[this.curveStartNodeId].position;
    const p1 = controlPos;
    const p2 = this.curveEndTarget.pos;

    const approxLen = distance(p0, p1) + distance(p1, p2);
    const N = Math.max(4, Math.min(16, Math.floor(approxLen / 20)));

    let prevNodeId = this.curveStartNodeId;

    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
      const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
      
      let currNodeId: NodeId;
      if (i === N) {
        currNodeId = this.curveEndTarget.nodeId ? this.curveEndTarget.nodeId : this.addNode({ x, y });
      } else {
        currNodeId = this.addNode({ x, y });
      }

      this.addAndResolveEdge(prevNodeId, currNodeId);
      prevNodeId = currNodeId;
    }

    this.curveStartNodeId = null;
    this.curveEndTarget = null;
    this.curveStep = 0;
    this.evaluateRegions();
    this.emit();
  }

  cancelCurve() {
    this.curveStartNodeId = null;
    this.curveEndTarget = null;
    this.curveStep = 0;
    this.emit();
  }
  
  private evaluateRegions() {
    const newRegions = extractRegions(this.document.nodes, this.document.edges);
    const regionsMap: Record<string, SpatialRegion> = {};
    for (const r of newRegions) {
      // copy old region data if exists
      if (this.document.regions[r.id]) {
        regionsMap[r.id] = { ...this.document.regions[r.id], ...r };
      } else {
        regionsMap[r.id] = r;
      }
    }
    this.document.regions = regionsMap;
    this.evaluateFurnitureRegions();
  }

  addTeam(name: string) {
    this.commit();
    const id = `team_${Date.now()}`;
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
    const color = colors[Object.keys(this.document.teams).length % colors.length];
    this.document.teams[id] = { id, name, color };
    this.emit();
  }

  addPerson(name: string) {
    this.commit();
    const id = `person_${Date.now()}`;
    this.document.people[id] = { id, name };
    this.emit();
  }

  updateTeam(id: string, updates: Partial<Team>) {
    this.commit();
    if (this.document.teams[id]) {
      this.document.teams[id] = { ...this.document.teams[id], ...updates };
      this.emit();
    }
  }

  updatePerson(id: string, updates: Partial<Person>) {
    this.commit();
    if (this.document.people[id]) {
      this.document.people[id] = { ...this.document.people[id], ...updates };
      this.emit();
    }
  }

  deletePerson(id: string) {
    this.commit();
    delete this.document.people[id];
    // Also remove from any furniture they were assigned to
    Object.values(this.document.furniture).forEach(f => {
      if (f.personId === id) f.personId = undefined;
    });
    this.emit();
  }

  deleteTeam(id: string) {
    this.commit();
    delete this.document.teams[id];
    
    // Remove from regions
    Object.values(this.document.regions).forEach(r => {
      if (r.teamId === id) r.teamId = undefined;
    });
    // Remove from people
    Object.values(this.document.people).forEach(p => {
      if (p.teamId === id) p.teamId = undefined;
    });
    // Remove from furniture
    Object.values(this.document.furniture).forEach(f => {
      if (f.teamId === id) f.teamId = undefined;
    });
    this.emit();
  }

  addFurniture(type: SpatialFurniture['type'], position: Point) {
    this.commit();
    const id = `furniture_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.document.furniture[id] = { id, type, position, rotation: 0 };
    this.evaluateFurnitureRegions();
    this.emit();
    return id;
  }

  addTemplate(templateType: string, position: Point) {
    this.commit();
    const idsToSelect: string[] = [];
    
    const def = getTemplateDefinition(templateType);
    
    // Track node index to ID mapping
    const nodeIds: string[] = [];
    
    def.nodes.forEach(n => {
      const id = crypto.randomUUID();
      nodeIds.push(id);
      this.document.nodes[id] = { id, position: { x: position.x + n.x, y: position.y + n.y } };
    });
    
    def.edges.forEach(e => {
      const id = crypto.randomUUID();
      this.document.edges[id] = { id, startNodeId: nodeIds[e[0]], endNodeId: nodeIds[e[1]], type: 'line' };
    });
    
    def.furniture.forEach(f => {
      const id = crypto.randomUUID();
      this.document.furniture[id] = {
        id,
        type: f.type,
        position: { x: position.x + f.position.x, y: position.y + f.position.y },
        rotation: f.rotation
      };
      idsToSelect.push(id);
    });

    this.selectedIds.clear();
    idsToSelect.forEach(id => this.selectedIds.add(id));
    
    // Auto-evaluate new regions and set furniture assignments
    if (['startup-office', 'team-room', 'open-bay', 'l-shape-room', 'full-floor', 'full-office'].includes(templateType)) {
      this.evaluateRegions();
    }
    this.evaluateFurnitureRegions();
    this.emit();
  }

  updateFurniture(id: string, updates: Partial<SpatialFurniture>) {
    this.commit();
    if (this.document.furniture[id]) {
      this.document.furniture[id] = { ...this.document.furniture[id], ...updates };
      if (updates.position) {
        this.evaluateFurnitureRegions();
      }
      this.emit();
    }
  }

  moveFurniture(id: string, newPosition: Point) {
    if (this.document.furniture[id]) {
      this.document.furniture[id].position = newPosition;
      this.emit();
    }
  }
  
  finishMoveFurniture() {
    this.commit();
    this.evaluateFurnitureRegions();
    this.emit();
  }

  evaluateFurnitureRegions() {
    for (const fId in this.document.furniture) {
      const f = this.document.furniture[fId];
      let foundRegionId: string | undefined = undefined;
      let teamId: string | undefined = undefined;
      
      for (const rId in this.document.regions) {
        const r = this.document.regions[rId];
        const pts: Point[] = [];
        if (r.boundaryEdgeIds.length > 0) {
          let currentEdge = this.document.edges[r.boundaryEdgeIds[0]];
          if (!currentEdge) continue;
          let currentNodeId = currentEdge.startNodeId;
          for (const edgeId of r.boundaryEdgeIds) {
            const edge = this.document.edges[edgeId];
            if (!edge || !this.document.nodes[currentNodeId]) break;
            pts.push(this.document.nodes[currentNodeId].position);
            currentNodeId = edge.startNodeId === currentNodeId ? edge.endNodeId : edge.startNodeId;
          }
        }
        
        // Very basic point-in-polygon logic for store
        let x = f.position.x, y = f.position.y;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          let xi = pts[i].x, yi = pts[i].y;
          let xj = pts[j].x, yj = pts[j].y;
          let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        
        if (inside) {
          foundRegionId = rId;
          teamId = r.teamId;
          break;
        }
      }
      f.hostRegionId = foundRegionId;
      if (!f.teamId && teamId) {
        // Inherit team from region if not explicitly assigned
      }
    }
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.commit();
    const toDelete = Array.from(this.selectedIds);
    toDelete.forEach(id => {
      // Check if it's an edge
      if (this.document.edges[id]) {
        delete this.document.edges[id];
      }
      // Check if it's a node
      else if (this.document.nodes[id]) {
        delete this.document.nodes[id];
        // Clean up connected edges
        for (const edgeId in this.document.edges) {
          const edge = this.document.edges[edgeId];
          if (edge.startNodeId === id || edge.endNodeId === id) {
            delete this.document.edges[edgeId];
          }
        }
      }
      // Check if it's a region
      else if (this.document.regions[id]) {
        // We can't really delete regions explicitly since they are auto-evaluated, but maybe user selected one
      }
      // Check if it's furniture
      else if (this.document.furniture[id]) {
        delete this.document.furniture[id];
      }
      // Check if it's an edge element
      else {
        for (const edge of Object.values(this.document.edges)) {
          if (edge.elements) {
            const idx = edge.elements.findIndex(el => el.id === id);
            if (idx !== -1) {
              edge.elements.splice(idx, 1);
            }
          }
        }
      }
    });
    this.selectedIds.clear();
    this.evaluateRegions();
    this.evaluateFurnitureRegions();
    this.emit();
  }

  addEdgeElement(edgeId: EdgeId, type: 'door' | 'window', t: number, length: number) {
    const edge = this.document.edges[edgeId];
    if (edge) {
      this.commit();
      if (!edge.elements) edge.elements = [];
      const id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      edge.elements.push({ id, type, t, length });
      this.emit();
    }
  }

  addShapeTemplate(shapeType: string, center: Point) {
    this.commit();
    const pts = getShapePoints(shapeType, center);

    if (pts.length > 0) {
      // create nodes
      const nodeIds = pts.map(p => {
         const id = `node_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
         this.document.nodes[id] = { id, position: p };
         return id;
      });
      // create edges using robust intersection
      for (let i = 0; i < nodeIds.length; i++) {
         const startId = nodeIds[i];
         const endId = nodeIds[(i + 1) % nodeIds.length];
         this.addAndResolveEdge(startId, endId);
      }
      this.evaluateRegions();
    }
    this.emit();
  }

  // Document Operations
  addNode(p: Point): NodeId {
    const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.document.nodes[id] = { id, position: p };
    this.emit();
    return id;
  }

  addEdge(startNodeId: NodeId, endNodeId: NodeId): EdgeId {
    const id = `edge_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.document.edges[id] = { id, startNodeId, endNodeId, type: 'line' };
    this.evaluateRegions();
    this.emit();
    return id;
  }

  moveNode(id: NodeId, p: Point) {
    if (this.document.nodes[id]) {
      this.document.nodes[id].position = p;
      this.evaluateRegions();
      this.emit();
    }
  }

  // Drawing Interaction
  startDrawing(nodeId: NodeId) {
    this.drawingEdgeStartNodeId = nodeId;
    this.emit();
  }

  cancelDrawing() {
    this.drawingEdgeStartNodeId = null;
    this.emit();
  }

  finishDrawing(endNodeId: NodeId) {
    if (this.drawingEdgeStartNodeId && this.drawingEdgeStartNodeId !== endNodeId) {
      // Check if an edge already exists
      const exists = Object.values(this.document.edges).some(
        e => (e.startNodeId === this.drawingEdgeStartNodeId && e.endNodeId === endNodeId) ||
             (e.startNodeId === endNodeId && e.endNodeId === this.drawingEdgeStartNodeId)
      );
      if (!exists) {
        this.addAndResolveEdge(this.drawingEdgeStartNodeId, endNodeId);
      }
    }
    this.drawingEdgeStartNodeId = null;
    this.evaluateRegions();
    this.emit();
  }

  
  splitEdge(edgeId: EdgeId, point: Point): NodeId {
    const edge = this.document.edges[edgeId];
    if (!edge) {
      return this.addNode(point);
    }
    this.commit();
    const newNodeId = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.document.nodes[newNodeId] = { id: newNodeId, position: point };
    
    const startId = edge.startNodeId;
    const endId = edge.endNodeId;
    
    delete this.document.edges[edgeId];
    
    this.addEdgeIfNotExists(startId, newNodeId);
    this.addEdgeIfNotExists(newNodeId, endId);
    
    this.evaluateRegions();
    this.emit();
    return newNodeId;
  }

  private addEdgeIfNotExists(startNodeId: NodeId, endNodeId: NodeId) {
    if (startNodeId === endNodeId) return;
    const exists = Object.values(this.document.edges).some(
      e => (e.startNodeId === startNodeId && e.endNodeId === endNodeId) ||
           (e.startNodeId === endNodeId && e.endNodeId === startNodeId)
    );
    if (!exists) {
      const id = `edge_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      this.document.edges[id] = { id, startNodeId, endNodeId, type: 'line' };
    }
  }
  
  // Advanced: Add an edge and split intersecting edges
  private addAndResolveEdge(startNodeId: NodeId, endNodeId: NodeId) {
    const p1 = this.document.nodes[startNodeId].position;
    const p2 = this.document.nodes[endNodeId].position;
    
    type IntersectPoint = { point: Point, edgeId?: EdgeId, nodeId?: NodeId };
    let intersections: IntersectPoint[] = [];
    
    // 1. Cross intersections with existing edges
    for (const edge of Object.values(this.document.edges)) {
      if (edge.startNodeId === startNodeId || edge.endNodeId === startNodeId ||
          edge.startNodeId === endNodeId || edge.endNodeId === endNodeId) {
          continue;
      }
      const p3 = this.document.nodes[edge.startNodeId].position;
      const p4 = this.document.nodes[edge.endNodeId].position;
      const intersectionPoint = segmentIntersection(p1, p2, p3, p4);
      if (intersectionPoint) {
        intersections.push({ point: intersectionPoint, edgeId: edge.id });
      }
    }
    
    // 2. Nodes that lie on the new segment (handles collinear overlaps & grazing)
    for (const node of Object.values(this.document.nodes)) {
      if (node.id === startNodeId || node.id === endNodeId) continue;
      if (distanceToSegment(node.position, p1, p2) < 1e-4) {
         intersections.push({ point: node.position, nodeId: node.id });
      }
    }

    intersections.sort((a, b) => distance(p1, a.point) - distance(p1, b.point));
    
    // Deduplicate closely gathered points
    const uniqueIntersections: IntersectPoint[] = [];
    for (const int of intersections) {
       if (uniqueIntersections.length === 0 || distance(uniqueIntersections[uniqueIntersections.length - 1].point, int.point) > 1e-4) {
          uniqueIntersections.push(int);
       } else {
          if (int.nodeId && !uniqueIntersections[uniqueIntersections.length - 1].nodeId) {
             uniqueIntersections[uniqueIntersections.length - 1].nodeId = int.nodeId;
          }
          if (int.edgeId && !uniqueIntersections[uniqueIntersections.length - 1].edgeId) {
             uniqueIntersections[uniqueIntersections.length - 1].edgeId = int.edgeId;
          }
       }
    }
    
    let currentStartId = startNodeId;
    
    for (const int of uniqueIntersections) {
      let newNodeId = int.nodeId;
      if (!newNodeId) {
        newNodeId = `node_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        this.document.nodes[newNodeId] = { id: newNodeId, position: int.point };
      }
      
      this.addEdgeIfNotExists(currentStartId, newNodeId);
      
      if (int.edgeId) {
        const crossedEdge = this.document.edges[int.edgeId];
        if (crossedEdge) {
          delete this.document.edges[int.edgeId];
          this.addEdgeIfNotExists(crossedEdge.startNodeId, newNodeId);
          this.addEdgeIfNotExists(newNodeId, crossedEdge.endNodeId);
        }
      }
      
      currentStartId = newNodeId;
    }
    
    this.addEdgeIfNotExists(currentStartId, endNodeId);
  }
}

export const store = new EditorStore();
