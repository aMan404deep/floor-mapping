import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { screenToWorld, distanceToSegment, distance, polygonArea, polygonCentroid, projectPointOnSegment, getShapePoints, pointInPolygon } from '../lib/geometry';
import { Point } from '../types';
import { getTemplateDefinition } from '../lib/templates';

const FurnitureShape = ({ type, strokeColor, baseFill, strokeWidth }: { type: string, strokeColor: string, baseFill: string, strokeWidth: number }) => {
  return (
    <>
      {type === 'desk' && (
        <g>
          <rect x={-20} y={-12} width={40} height={24} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={2} />
          <rect x={-10} y={-10} width={20} height={4} fill={strokeColor} rx={1} opacity={0.6} />
          <rect x={-6} y={1} width={12} height={5} fill={strokeColor} rx={0.5} opacity={0.4} />
        </g>
      )}
      {type === 'table' && (
        <g>
          <path d="M -8 -15 Q 0 -20 8 -15" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2} opacity={0.6} />
          <path d="M -8 15 Q 0 20 8 15" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2} opacity={0.6} />
          <path d="M -15 -8 Q -20 0 -15 8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2} opacity={0.6} />
          <path d="M 15 -8 Q 20 0 15 8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2} opacity={0.6} />
          <circle r={15} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
      {type === 'chair' && (
        <g>
          <path d="M -9 2 C -9 -6, 9 -6, 9 2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2} strokeLinecap="round" />
          <rect x={-7} y={-3} width={14} height={12} rx={4} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
      {type === 'plant' && (
        <g>
          <circle cx={-4} cy={-4} r={7} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} opacity={0.8} />
          <circle cx={4} cy={-4} r={7} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} opacity={0.8} />
          <circle cx={-4} cy={4} r={7} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} opacity={0.8} />
          <circle cx={4} cy={4} r={7} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} opacity={0.8} />
          <circle cx={0} cy={0} r={4} fill="#451a03" stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
      {type === 'sofa' && (
        <g>
          <rect x={-20} y={-10} width={40} height={20} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={4} />
          <rect x={-18} y={-14} width={36} height={10} fill={strokeColor} rx={2} opacity={0.6} />
          <rect x={-22} y={-12} width={6} height={20} fill={strokeColor} rx={2} opacity={0.6} />
          <rect x={16} y={-12} width={6} height={20} fill={strokeColor} rx={2} opacity={0.6} />
        </g>
      )}
      {type === 'whiteboard' && (
        <g>
          <rect x={-20} y={-3} width={40} height={6} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={1} />
          <line x1={-15} y1={3} x2={-17} y2={8} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <line x1={15} y1={3} x2={17} y2={8} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </g>
      )}
      {type === 'cabinet' && (
        <g>
          <rect x={-12} y={-10} width={24} height={20} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={1} />
          <line x1={-8} y1={-5} x2={8} y2={-5} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" opacity={0.6} />
          <line x1={-8} y1={0} x2={8} y2={0} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" opacity={0.6} />
          <line x1={-8} y1={5} x2={8} y2={5} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" opacity={0.6} />
        </g>
      )}
      {type === 'watercooler' && (
        <g>
          <rect x={-6} y={-6} width={12} height={12} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={2} />
          <circle cx={0} cy={0} r={4} fill="#60a5fa" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} />
          <rect x={-3} y={6} width={6} height={3} fill={strokeColor} rx={1} opacity={0.6} />
        </g>
      )}
      {type === 'cubicle' && (
        <g>
          {/* Outer partition walls */}
          <path d="M -24 20 L -24 -20 L 24 -20 L 24 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 3} strokeLinecap="square" />
          {/* Desk inside */}
          <rect x={-20} y={-18} width={40} height={20} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={1} />
          {/* Monitor */}
          <rect x={-10} y={-16} width={20} height={4} fill={strokeColor} rx={1} opacity={0.6} />
          {/* Chair */}
          <rect x={-6} y={6} width={12} height={10} rx={4} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
          <path d="M -8 15 C -8 20, 8 20, 8 15" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
        </g>
      )}
      {type === 'toilet' && (
        <g>
          <rect x={-8} y={-14} width={16} height={10} rx={2} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx={0} cy={2} rx={7} ry={10} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
      {type === 'sink' && (
        <g>
          <rect x={-12} y={-10} width={24} height={16} rx={2} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx={0} cy={-2} rx={8} ry={5} fill={strokeColor} opacity={0.3} />
          <circle cx={0} cy={-8} r={1.5} fill={strokeColor} />
        </g>
      )}
      {type === 'server_rack' && (
        <g>
          <rect x={-12} y={-15} width={24} height={30} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={1} />
          <line x1={-8} y1={-10} x2={8} y2={-10} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.8} />
          <line x1={-8} y1={-5} x2={8} y2={-5} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.8} />
          <line x1={-8} y1={0} x2={8} y2={0} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.8} />
          <line x1={-8} y1={5} x2={8} y2={5} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.8} />
          <line x1={-8} y1={10} x2={8} y2={10} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.8} />
        </g>
      )}
      {type === 'printer' && (
        <g>
          <rect x={-14} y={-12} width={28} height={20} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={3} />
          <rect x={-8} y={-14} width={16} height={6} fill={strokeColor} opacity={0.3} />
          <rect x={-10} y={8} width={20} height={6} fill={strokeColor} opacity={0.3} />
        </g>
      )}
      {type === 'bookshelf' && (
        <g>
          <rect x={-18} y={-8} width={36} height={16} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} rx={1} />
          <line x1={-12} y1={-8} x2={-12} y2={8} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.5} />
          <line x1={-6} y1={-8} x2={-6} y2={8} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.5} />
          <line x1={0} y1={-8} x2={0} y2={8} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.5} />
          <line x1={6} y1={-8} x2={6} y2={8} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.5} />
          <line x1={12} y1={-8} x2={12} y2={8} stroke={strokeColor} strokeWidth={strokeWidth * 0.75} opacity={0.5} />
        </g>
      )}
      {type === 'tv' && (
        <g>
          <rect x={-20} y={-3} width={40} height={6} fill={strokeColor} rx={1} opacity={0.8} />
          <rect x={-22} y={-2} width={44} height={4} fill="#3b82f6" opacity={0.8} rx={1} />
          <line x1={-10} y1={3} x2={-10} y2={8} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1={10} y1={3} x2={10} y2={8} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1={-15} y1={8} x2={15} y2={8} stroke={strokeColor} strokeWidth={strokeWidth} />
        </g>
      )}
    </>
  );
};

export function Canvas() {
  const store = useEditorStore();
  const svgRef = useRef<SVGSVGElement>(null);
  
  const document = store.getDocument();
  const camera = store.getCamera();
  const activeTool = store.getActiveTool();
  const isPanning = store.getIsPanning();
  const drawingEdgeStartNodeId = store.getDrawingEdgeStartNodeId();
  const cursorWorldPosition = store.getCursorWorldPosition();
  const selectedIds = store.getSelectedIds();
  
  const draggingShapeType = store.getDraggingShapeType();
  const dragPreviewPosition = store.getDragPreviewPosition();

  // Local state for dragging nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ start: Point, current: Point } | null>(null);

  // Escape key to cancel operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.cancelDrawing();
        store.cancelCurve();
        setDraggingNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const getCanvasPoint = (e: React.PointerEvent | PointerEvent | WheelEvent): Point => {
    return { x: e.clientX, y: e.clientY };
  };

  const updateCursorPosition = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const pt = getCanvasPoint(e);
    const worldPt = screenToWorld(pt, camera, svgRef.current.getBoundingClientRect());
    store.setCursorWorldPosition(worldPt);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    
    // Middle click or space+click panning is handled globally or here.
    // For simplicity, let's say if space is held (handled in App) or middle mouse (button 1)
    if (e.button === 1 || isPanning) {
      // Start pan
      svgRef.current.setPointerCapture(e.pointerId);
      return;
    }

    const pt = getCanvasPoint(e);
    let worldPt = screenToWorld(pt, camera, svgRef.current.getBoundingClientRect());

    if (store.getGridSnapEnabled() && !e.shiftKey) {
      worldPt.x = Math.round(worldPt.x / 10) * 10;
      worldPt.y = Math.round(worldPt.y / 10) * 10;
    }

    store.setCursorWorldPosition(worldPt);

    if (activeTool === 'select') {
      // Try to find a node to drag or select
      let foundNode = null;
      for (const node of Object.values(document.nodes)) {
        if (distance(node.position, worldPt) < 10 / camera.zoom) {
          foundNode = node;
          break;
        }
      }
      
      if (foundNode) {
        store.commit(); // Save state before drag starts
        store.select(foundNode.id, e.shiftKey);
        setDraggingNodeId(foundNode.id);
        svgRef.current.setPointerCapture(e.pointerId);
        return;
      }
      
      // Try to find an edge to select
      let foundEdge = null;
      for (const edge of Object.values(document.edges)) {
        const p1 = document.nodes[edge.startNodeId].position;
        const p2 = document.nodes[edge.endNodeId].position;
        if (distanceToSegment(worldPt, p1, p2) < 5 / camera.zoom) {
          foundEdge = edge;
          break;
        }
      }
      
      if (foundEdge) {
        store.select(foundEdge.id, e.shiftKey);
      } else {
        store.clearSelection();
        // Start marquee selection
        setSelectionBox({ start: worldPt, current: worldPt });
        svgRef.current.setPointerCapture(e.pointerId);
      }
    } else if (activeTool === 'wall') {
      // Find if we clicked on an existing node to snap
      let snapNode = null;
      for (const node of Object.values(document.nodes)) {
        if (distance(node.position, worldPt) < 15 / camera.zoom) {
          snapNode = node;
          break;
        }
      }
      
      let startNodeId;
      if (snapNode) {
        store.commit();
        startNodeId = snapNode.id;
      } else {
        let snapEdge = null;
        let snapPoint = worldPt;
        for (const edge of Object.values(document.edges)) {
          const p1 = document.nodes[edge.startNodeId].position;
          const p2 = document.nodes[edge.endNodeId].position;
          if (distanceToSegment(worldPt, p1, p2) < 15 / camera.zoom) {
            snapEdge = edge;
            snapPoint = projectPointOnSegment(worldPt, p1, p2);
            break;
          }
        }
        if (snapEdge) {
          startNodeId = store.splitEdge(snapEdge.id, snapPoint);
        } else {
          store.commit();
          startNodeId = store.addNode(worldPt);
        }
      }
      
      store.startDrawing(startNodeId);
      svgRef.current.setPointerCapture(e.pointerId);
    } else if (activeTool === 'curve') {
      let targetNodeId;
      
      if (store.getCurveStep() !== 2) {
        let snapNode = null;
        for (const node of Object.values(document.nodes)) {
          if (distance(node.position, worldPt) < 15 / camera.zoom) {
            snapNode = node;
            break;
          }
        }
        
        if (snapNode) {
          targetNodeId = snapNode.id;
          if (store.getCurveStep() === 0) store.commit();
        } else {
          let snapEdge = null;
          let snapPoint = worldPt;
          for (const edge of Object.values(document.edges)) {
            const p1 = document.nodes[edge.startNodeId].position;
            const p2 = document.nodes[edge.endNodeId].position;
            if (distanceToSegment(worldPt, p1, p2) < 15 / camera.zoom) {
              snapEdge = edge;
              snapPoint = projectPointOnSegment(worldPt, p1, p2);
              break;
            }
          }
          if (snapEdge) {
            targetNodeId = store.splitEdge(snapEdge.id, snapPoint);
          } else {
            if (store.getCurveStep() === 0) store.commit();
            targetNodeId = store.addNode(worldPt);
          }
        }
      }

      if (store.getCurveStep() === 0) {
        store.startCurve(targetNodeId!);
      } else if (store.getCurveStep() === 1) {
        if (targetNodeId !== store.getCurveStartNodeId()) {
          store.setCurveEnd(worldPt, targetNodeId!);
        } else {
          store.cancelCurve();
        }
      } else if (store.getCurveStep() === 2) {
        store.finishCurve(worldPt);
      }
    } else if (activeTool === 'door' || activeTool === 'window') {
      let closestEdge = null;
      let minDistance = Infinity;
      let closestT = 0;
      for (const edge of Object.values(document.edges)) {
        const p1 = document.nodes[edge.startNodeId].position;
        const p2 = document.nodes[edge.endNodeId].position;
        const dist = distanceToSegment(worldPt, p1, p2);
        if (dist < 15 / camera.zoom && dist < minDistance) {
          minDistance = dist;
          closestEdge = edge;
          const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
          if (l2 === 0) closestT = 0;
          else closestT = ((worldPt.x - p1.x) * (p2.x - p1.x) + (worldPt.y - p1.y) * (p2.y - p1.y)) / l2;
          
          const wallLength = Math.sqrt(l2);
          const elementLength = 40;
          if (wallLength > elementLength) {
            const marginT = (elementLength / 2) / wallLength;
            closestT = Math.max(marginT, Math.min(1 - marginT, closestT));
          } else {
            closestT = 0.5;
          }
        }
      }
      if (closestEdge) {
        store.addEdgeElement(closestEdge.id, activeTool, closestT, 40);
        // store.setActiveTool('select'); // Optionally revert to select tool
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    let pt = getCanvasPoint(e);
    let worldPt = screenToWorld(pt, camera, svgRef.current!.getBoundingClientRect());

    // Grid snapping override
    if (store.getGridSnapEnabled() && !e.shiftKey) {
      worldPt.x = Math.round(worldPt.x / 10) * 10;
      worldPt.y = Math.round(worldPt.y / 10) * 10;
    }

    // Orthogonal snapping if shift is held while drawing
    if (activeTool === 'wall' && drawingEdgeStartNodeId && e.shiftKey) {
      const startPt = document.nodes[drawingEdgeStartNodeId].position;
      const dx = Math.abs(worldPt.x - startPt.x);
      const dy = Math.abs(worldPt.y - startPt.y);
      if (dx > dy) {
        worldPt.y = startPt.y; // Snap horizontal
      } else {
        worldPt.x = startPt.x; // Snap vertical
      }
    }

    store.setCursorWorldPosition(worldPt);
    
    if (isPanning && e.buttons > 0) {
      store.setCamera({
        ...camera,
        x: camera.x + e.movementX,
        y: camera.y + e.movementY,
      });
      return;
    }
    
    if (e.buttons === 4 || (e.buttons === 1 && e.button === 1)) {
      // middle mouse pan
      store.setCamera({
        ...camera,
        x: camera.x + e.movementX,
        y: camera.y + e.movementY,
      });
      return;
    }
    
    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, current: worldPt } : null);
      return;
    }

    if (draggingNodeId) {
      const pt = getCanvasPoint(e);
      let worldPt = screenToWorld(pt, camera, svgRef.current!.getBoundingClientRect());
      
      if (store.getGridSnapEnabled() && !e.shiftKey) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }

      if (document.furniture && document.furniture[draggingNodeId]) {
        store.moveFurniture(draggingNodeId, worldPt);
      } else {
        store.moveNode(draggingNodeId, worldPt);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (svgRef.current && svgRef.current.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    
    if (selectionBox) {
      // Find all objects inside the box
      const minX = Math.min(selectionBox.start.x, selectionBox.current.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.current.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.current.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.current.y);
      
      const inBox = (p: Point) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
      
      const selectedNodes = Object.values(document.nodes).filter(n => inBox(n.position)).map(n => n.id);
      const selectedFurniture = Object.values(document.furniture).filter(f => inBox(f.position)).map(f => f.id);
      
      if (!e.shiftKey) store.clearSelection();
      selectedNodes.forEach(id => store.select(id, true));
      selectedFurniture.forEach(id => store.select(id, true));
      
      setSelectionBox(null);
      return;
    }

    if (draggingNodeId) {
      if (document.furniture && document.furniture[draggingNodeId]) {
        store.finishMoveFurniture();
      }
      setDraggingNodeId(null);
    }

    if (activeTool === 'wall' && drawingEdgeStartNodeId) {
      const pt = getCanvasPoint(e);
      let worldPt = screenToWorld(pt, camera, svgRef.current!.getBoundingClientRect());
      const startPos = document.nodes[drawingEdgeStartNodeId].position;

      // Grid snapping override
      if (store.getGridSnapEnabled() && !e.shiftKey) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }

      if (e.shiftKey) {
        const dx = Math.abs(worldPt.x - startPos.x);
        const dy = Math.abs(worldPt.y - startPos.y);
        if (dx > dy) {
          worldPt.y = startPos.y; // Snap horizontal
        } else {
          worldPt.x = startPos.x; // Snap vertical
        }
      }

      // Cancel if dragged less than 5 units
      if (distance(startPos, worldPt) < 5 / camera.zoom) {
        store.cancelDrawing();
        return;
      }
      
      // Check snap
      let snapNode = null;
      for (const node of Object.values(document.nodes)) {
        // Don't snap to the start node
        if (node.id === drawingEdgeStartNodeId) continue;
        if (distance(node.position, worldPt) < 15 / camera.zoom) {
          snapNode = node;
          break;
        }
      }
      
      let endNodeId;
      if (snapNode) {
        endNodeId = snapNode.id;
      } else {
        let snapEdge = null;
        let snapPoint = worldPt;
        for (const edge of Object.values(document.edges)) {
          const p1 = document.nodes[edge.startNodeId].position;
          const p2 = document.nodes[edge.endNodeId].position;
          if (distanceToSegment(worldPt, p1, p2) < 15 / camera.zoom) {
            snapEdge = edge;
            snapPoint = projectPointOnSegment(worldPt, p1, p2);
            break;
          }
        }
        if (snapEdge) {
          endNodeId = store.splitEdge(snapEdge.id, snapPoint);
        } else {
          endNodeId = store.addNode(worldPt);
        }
      }
      
      store.finishDrawing(endNodeId);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const shapeType = store.getDraggingShapeType() || e.dataTransfer.getData('shapeType');
    const furnitureType = e.dataTransfer.getData('furnitureType');
    const templateType = e.dataTransfer.getData('templateType');
    const personId = e.dataTransfer.getData('personId');
    const teamId = e.dataTransfer.getData('teamId');
    
    store.setDragPreviewPosition(null);
    store.setDraggingShapeType(null);
    
    if (!svgRef.current) return;
    
    const pt = { x: e.clientX, y: e.clientY };
    let worldPt = screenToWorld(pt, camera, svgRef.current.getBoundingClientRect());
      
    if (shapeType) {
      if (store.getGridSnapEnabled()) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }
      store.addShapeTemplate(shapeType, worldPt);
    } else if (templateType) {
      if (store.getGridSnapEnabled()) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }
      store.addTemplate(templateType, worldPt);
    } else if (furnitureType) {
      if (store.getGridSnapEnabled()) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }
      const id = store.addFurniture(furnitureType as any, worldPt);
      store.select(id, false);
    } else if (personId || teamId) {
      let droppedFurnitureId: string | null = null;
      for (const f of Object.values(document.furniture)) {
        if (distance(worldPt, f.position) < 30) {
          droppedFurnitureId = f.id;
          break;
        }
      }

      if (droppedFurnitureId) {
        if (personId) {
          store.updateFurniture(droppedFurnitureId, { personId });
          const person = document.people[personId];
          if (person && person.teamId) {
            store.updateFurniture(droppedFurnitureId, { teamId: person.teamId });
          }
        } else if (teamId) {
          store.updateFurniture(droppedFurnitureId, { teamId });
        }
        store.select(droppedFurnitureId, false);
      } else {
        // Find which region we dropped onto
        let droppedRegionId: string | null = null;
        for (const region of Object.values(document.regions)) {
          const pts: Point[] = [];
          if (region.boundaryEdgeIds.length > 0) {
            let currentEdge = document.edges[region.boundaryEdgeIds[0]];
            let currentNodeId = currentEdge.startNodeId;
            for (const edgeId of region.boundaryEdgeIds) {
              const edge = document.edges[edgeId];
              pts.push(document.nodes[currentNodeId].position);
              currentNodeId = edge.startNodeId === currentNodeId ? edge.endNodeId : edge.startNodeId;
            }
          }
          if (pts.length > 2 && pointInPolygon(worldPt, pts)) {
            droppedRegionId = region.id;
            break; // Found the region
          }
        }
  
        if (droppedRegionId) {
          if (teamId) {
            store.updateRegion(droppedRegionId, { teamId });
          }
          if (personId) {
            const person = document.people[personId];
            if (person && person.teamId) {
               store.updateRegion(droppedRegionId, { teamId: person.teamId });
            }
          }
          store.select(droppedRegionId, false);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if ((store.getDraggingShapeType() || store.getDraggingFurnitureType() || store.getDraggingTemplateType()) && svgRef.current) {
      const pt = { x: e.clientX, y: e.clientY };
      let worldPt = screenToWorld(pt, camera, svgRef.current.getBoundingClientRect());
      
      if (store.getGridSnapEnabled()) {
        worldPt.x = Math.round(worldPt.x / 10) * 10;
        worldPt.y = Math.round(worldPt.y / 10) * 10;
      }
      store.setDragPreviewPosition(worldPt);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    store.setDragPreviewPosition(null);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      // Zoom
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const zoomDelta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(0.1, camera.zoom * (1 + zoomDelta)), 10);
      
      if (!svgRef.current) return;
      // Zoom around cursor
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
      const newY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);
      
      store.setCamera({ x: newX, y: newY, zoom: newZoom });
    } else {
      // Pan with trackpad
      store.setCamera({
        ...camera,
        x: camera.x - e.deltaX,
        y: camera.y - e.deltaY,
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const pt = { x: e.clientX, y: e.clientY };
    const worldPt = screenToWorld(pt, camera, svgRef.current!.getBoundingClientRect());
    
    // Find what we clicked on
    let targetId = undefined;
    let targetType: 'furniture' | 'node' | 'edge' | 'region' | undefined = undefined;

    // Check furniture
    for (const f of Object.values(document.furniture)) {
      if (distance(f.position, worldPt) < 20 / camera.zoom) {
        targetId = f.id;
        targetType = 'furniture';
        break;
      }
    }
    
    if (targetId) {
      if (!selectedIds.includes(targetId)) {
        store.select(targetId, false);
      }
      store.setContextMenu({ x: e.clientX, y: e.clientY, targetId, targetType });
      return;
    }

    store.setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Pre-calculate rendering stuff
  const strokeWidth = 2 / camera.zoom;
  const nodeRadius = 4 / camera.zoom;
  
  const viewMode = store.getViewMode();
  const highlightTeamId = store.getHighlightTeamId();
  const isPreviewMode = store.getIsPreviewMode();

  return (
    <>
      <svg 
        ref={svgRef}
        className={`w-full h-full bg-[#1e1e1e] touch-none ${isPanning ? 'cursor-grab active:cursor-grabbing' : activeTool === 'wall' ? 'cursor-crosshair' : 'cursor-default'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onContextMenu={handleContextMenu}
      >
        <defs>
          {/* Grid patterns */}
          <pattern id="smallGrid" width={10 * camera.zoom} height={10 * camera.zoom} patternUnits="userSpaceOnUse" patternTransform={`translate(${camera.x}, ${camera.y})`}>
            <path d={`M ${10 * camera.zoom} 0 L 0 0 0 ${10 * camera.zoom}`} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          <pattern id="grid" width={50 * camera.zoom} height={50 * camera.zoom} patternUnits="userSpaceOnUse" patternTransform={`translate(${camera.x}, ${camera.y})`}>
            <rect width={50 * camera.zoom} height={50 * camera.zoom} fill="url(#smallGrid)" />
            <path d={`M ${50 * camera.zoom} 0 L 0 0 0 ${50 * camera.zoom}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        {!isPreviewMode && <rect width="100%" height="100%" fill="url(#grid)" />}
        
        <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
          {/* Render regions (faces) */}
          {Object.values(document.regions).map(region => {
          // Construct path from edges
          // We know the edges form a cycle, we just need the nodes in order.
          const pts: Point[] = [];
          if (region.boundaryEdgeIds.length > 0) {
            let currentEdge = document.edges[region.boundaryEdgeIds[0]];
            let currentNodeId = currentEdge.startNodeId;
            
            for (const edgeId of region.boundaryEdgeIds) {
              const edge = document.edges[edgeId];
              pts.push(document.nodes[currentNodeId].position);
              currentNodeId = edge.startNodeId === currentNodeId ? edge.endNodeId : edge.startNodeId;
            }
          }
          
          if (pts.length < 3) return null;
          
          const pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
          const area = Math.round(polygonArea(pts));
          const centroid = polygonCentroid(pts);
          const isSelected = selectedIds.includes(region.id);
          
          const team = region.teamId ? document.teams[region.teamId] : null;
          
          // Hex to rgba helper
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };
          
          let baseFill = team ? hexToRgba(team.color, 0.15) : "rgba(107, 114, 128, 0.05)";
          let selectedFill = team ? hexToRgba(team.color, 0.35) : "rgba(59, 130, 246, 0.3)";
          let strokeColor = team ? team.color : "none";
          let regionOpacity = 1;

          if (viewMode === 'team_highlight' && highlightTeamId) {
            if (team?.id !== highlightTeamId) {
              baseFill = "rgba(0, 0, 0, 0.2)";
              selectedFill = "rgba(0, 0, 0, 0.4)";
              strokeColor = "none";
              regionOpacity = 0.2;
            } else {
              baseFill = hexToRgba(team.color, 0.3); // Brighter when highlighted
            }
          } else if (viewMode === 'vacancies') {
            baseFill = "rgba(0, 0, 0, 0.2)";
            selectedFill = "rgba(0, 0, 0, 0.4)";
            strokeColor = "none";
            regionOpacity = 0.2;
          }

          return (
            <g key={region.id} opacity={regionOpacity}>
              <path
                d={pathD}
                fill={isSelected ? selectedFill : baseFill}
                stroke={strokeColor}
                strokeWidth={strokeWidth / 2}
                strokeOpacity={0.2}
                className="cursor-pointer"
                onPointerDown={(e) => {
                  if (activeTool === 'select' && !isPanning) {
                    e.stopPropagation();
                    store.select(region.id, e.shiftKey);
                  }
                }}
              />
            </g>
          );
        })}
        
        {/* Render Edges */}
        {Object.values(document.edges).map(edge => {
          const start = document.nodes[edge.startNodeId].position;
          const end = document.nodes[edge.endNodeId].position;
          const isSelected = selectedIds.includes(edge.id);
          const len = distance(start, end);
          return (
            <g key={edge.id}>
              <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={isSelected ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isSelected ? strokeWidth * 1.5 : strokeWidth}
                strokeLinecap="round"
              />
            </g>
          );
        })}
        
        {/* Render Edge Elements (Doors/Windows) */}
        {Object.values(document.edges).map(edge => {
          if (!edge.elements || edge.elements.length === 0) return null;
          const start = document.nodes[edge.startNodeId].position;
          const end = document.nodes[edge.endNodeId].position;
          const len = distance(start, end);
          if (len === 0) return null;
          
          const dx = (end.x - start.x) / len;
          const dy = (end.y - start.y) / len;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          return (
            <g key={`elements-${edge.id}`}>
              {edge.elements.map(el => {
                const cx = start.x + dx * (el.t * len);
                const cy = start.y + dy * (el.t * len);
                const isSelected = selectedIds.includes(el.id);
                const color = isSelected ? '#3b82f6' : '#9ca3af';
                
                return (
                  <g 
                    key={el.id} 
                    transform={`translate(${cx}, ${cy}) rotate(${angle})`}
                    className="cursor-pointer"
                    onPointerDown={(e) => {
                      if (activeTool === 'select' && !isPanning) {
                        e.stopPropagation();
                        store.select(el.id, e.shiftKey);
                      }
                    }}
                  >
                    {/* Background to 'break' the wall line visually */}
                    <rect x={-el.length/2} y={-strokeWidth} width={el.length} height={strokeWidth*2} fill="#1e1e1e" />
                    
                    {el.type === 'door' && (
                      <g>
                        <line x1={-el.length/2} y1={0} x2={-el.length/2} y2={el.length} stroke={color} strokeWidth={strokeWidth} />
                        <path d={`M ${-el.length/2} ${el.length} A ${el.length} ${el.length} 0 0 1 ${el.length/2} 0`} fill="none" stroke={color} strokeWidth={strokeWidth * 0.5} strokeDasharray="2,2" />
                      </g>
                    )}
                    {el.type === 'window' && (
                      <g>
                        <rect x={-el.length/2} y={-2/camera.zoom} width={el.length} height={4/camera.zoom} fill="none" stroke={color} strokeWidth={strokeWidth * 0.5} />
                        <line x1={-el.length/2} y1={0} x2={el.length/2} y2={0} stroke="#60a5fa" strokeWidth={strokeWidth * 0.5} />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        
        {/* Render Furniture */}
        {Object.values(document.furniture).map(f => {
          const isSelected = selectedIds.includes(f.id);
          const team = f.teamId ? document.teams[f.teamId] : (f.hostRegionId && document.regions[f.hostRegionId]?.teamId ? document.teams[document.regions[f.hostRegionId].teamId!] : null);
          const person = f.personId ? document.people[f.personId] : null;

          let baseFill = team ? team.color : (f.type === 'plant' ? '#166534' : (f.type === 'chair' ? '#6b7280' : (f.type === 'whiteboard' ? '#e4e4e7' : '#4b5563')));
          let strokeColor = isSelected ? "#3b82f6" : (f.type === 'plant' ? '#14532d' : (f.type === 'whiteboard' ? '#a1a1aa' : '#1f2937'));
          let fOpacity = 1;

          if (viewMode === 'team_highlight' && highlightTeamId) {
            if (team?.id !== highlightTeamId) {
              baseFill = "rgba(100, 100, 100, 0.2)";
              strokeColor = "rgba(100, 100, 100, 0.5)";
              fOpacity = 0.5;
            }
          } else if (viewMode === 'vacancies') {
            if (f.type === 'desk' && !f.personId) {
              baseFill = "#ef4444"; // Red for vacant desks
              strokeColor = "#b91c1c";
            } else {
              baseFill = "rgba(100, 100, 100, 0.2)";
              strokeColor = "rgba(100, 100, 100, 0.5)";
              fOpacity = 0.5;
            }
          }

          return (
            <g 
              key={f.id}
              transform={`translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})`}
              className="cursor-pointer"
              opacity={fOpacity}
              onPointerDown={(e) => {
                if (activeTool === 'select' && !isPanning) {
                  e.stopPropagation();
                  store.select(f.id, e.shiftKey);
                  // Allow dragging
                  if (!e.shiftKey) {
                    setDraggingNodeId(f.id); // Reusing this for simplicity
                  }
                }
              }}
            >
              <FurnitureShape type={f.type} strokeColor={strokeColor} baseFill={baseFill} strokeWidth={strokeWidth} />
            </g>
          );
        })}

        {/* Render Active Drawing Line */}
        {activeTool === 'wall' && drawingEdgeStartNodeId && (
          <g>
            <line
              x1={document.nodes[drawingEdgeStartNodeId].position.x}
              y1={document.nodes[drawingEdgeStartNodeId].position.y}
              x2={cursorWorldPosition.x}
              y2={cursorWorldPosition.y}
              stroke="#9ca3af"
              strokeWidth={strokeWidth}
              strokeDasharray={`${5/camera.zoom},${5/camera.zoom}`}
            />
          </g>
        )}

        {/* Render Active Curve Drawing */}
        {activeTool === 'curve' && store.getCurveStep() === 1 && store.getCurveStartNodeId() && (
          <line
            x1={document.nodes[store.getCurveStartNodeId()!].position.x}
            y1={document.nodes[store.getCurveStartNodeId()!].position.y}
            x2={cursorWorldPosition.x}
            y2={cursorWorldPosition.y}
            stroke="#9ca3af"
            strokeWidth={strokeWidth}
            strokeDasharray={`${5/camera.zoom},${5/camera.zoom}`}
          />
        )}
        {activeTool === 'curve' && store.getCurveStep() === 2 && store.getCurveStartNodeId() && store.getCurveEndTarget() && (
          <g>
            <path
              d={`M ${document.nodes[store.getCurveStartNodeId()!].position.x} ${document.nodes[store.getCurveStartNodeId()!].position.y} Q ${cursorWorldPosition.x} ${cursorWorldPosition.y} ${store.getCurveEndTarget()!.pos.x} ${store.getCurveEndTarget()!.pos.y}`}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={strokeWidth}
              strokeDasharray={`${5/camera.zoom},${5/camera.zoom}`}
            />
            {/* Control lines */}
            <line x1={document.nodes[store.getCurveStartNodeId()!].position.x} y1={document.nodes[store.getCurveStartNodeId()!].position.y} x2={cursorWorldPosition.x} y2={cursorWorldPosition.y} stroke="#6b7280" strokeWidth={strokeWidth * 0.5} strokeDasharray="2,2" />
            <line x1={store.getCurveEndTarget()!.pos.x} y1={store.getCurveEndTarget()!.pos.y} x2={cursorWorldPosition.x} y2={cursorWorldPosition.y} stroke="#6b7280" strokeWidth={strokeWidth * 0.5} strokeDasharray="2,2" />
            {/* Control point handle */}
            <circle cx={cursorWorldPosition.x} cy={cursorWorldPosition.y} r={nodeRadius} fill="#6b7280" />
          </g>
        )}

        {/* Render Nodes */}
        {Object.values(document.nodes).map(node => {
          const isSelected = selectedIds.includes(node.id);
          // Highlight node if drawing edge is close
          const isHovered = activeTool === 'wall' && distance(node.position, cursorWorldPosition) < 15 / camera.zoom;
          
          return (
            <circle
              key={node.id}
              cx={node.position.x}
              cy={node.position.y}
              r={nodeRadius * (isHovered ? 1.5 : 1)}
              fill={isSelected ? '#3b82f6' : isHovered ? '#10b981' : '#f3f4f6'}
              stroke="#1e1e1e"
              strokeWidth={strokeWidth * 0.5}
            />
          );
        })}

        {/* Render Drag Preview */}
        {store.getDraggingShapeType() && dragPreviewPosition && (
          <path
            d={`M ${getShapePoints(store.getDraggingShapeType()!, dragPreviewPosition).map(p => `${p.x} ${p.y}`).join(' L ')} Z`}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${5/camera.zoom},${5/camera.zoom}`}
            pointerEvents="none"
          />
        )}
        {store.getDraggingFurnitureType() && dragPreviewPosition && (
          <g transform={`translate(${dragPreviewPosition.x}, ${dragPreviewPosition.y})`} opacity={0.6} pointerEvents="none">
             <FurnitureShape type={store.getDraggingFurnitureType()!} strokeColor="#3b82f6" baseFill="rgba(59, 130, 246, 0.2)" strokeWidth={strokeWidth} />
          </g>
        )}
        {store.getDraggingTemplateType() && dragPreviewPosition && (
          <g transform={`translate(${dragPreviewPosition.x}, ${dragPreviewPosition.y})`} opacity={0.6} pointerEvents="none">
            {(() => {
              const def = getTemplateDefinition(store.getDraggingTemplateType()!);
              return (
                <g>
                  {def.edges.map((e, i) => (
                    <line key={`e-${i}`} x1={def.nodes[e[0]].x} y1={def.nodes[e[0]].y} x2={def.nodes[e[1]].x} y2={def.nodes[e[1]].y} stroke="#3b82f6" strokeWidth={strokeWidth * 2} />
                  ))}
                  {def.furniture.map((f, i) => (
                    <g key={`f-${i}`} transform={`translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})`}>
                      <FurnitureShape type={f.type} strokeColor="#3b82f6" baseFill="rgba(59, 130, 246, 0.2)" strokeWidth={strokeWidth} />
                    </g>
                  ))}
                </g>
              );
            })()}
          </g>
        )}
        {/* Render Texts (Always on top) */}
        <g pointerEvents="none">
          {/* Region Texts */}
          {Object.values(document.regions).map(region => {
            const isSelected = selectedIds.includes(region.id);
            const team = region.teamId ? document.teams[region.teamId] : null;
            
            const pts: Point[] = [];
            if (region.boundaryEdgeIds.length > 0) {
              let currentEdge = document.edges[region.boundaryEdgeIds[0]];
              if (currentEdge) {
                let currentNodeId = currentEdge.startNodeId;
                for (const edgeId of region.boundaryEdgeIds) {
                  const edge = document.edges[edgeId];
                  if (!edge || !document.nodes[currentNodeId]) break;
                  pts.push(document.nodes[currentNodeId].position);
                  currentNodeId = edge.startNodeId === currentNodeId ? edge.endNodeId : edge.startNodeId;
                }
              }
            }
            if (pts.length < 3) return null;
            const centroid = polygonCentroid(pts);
            
            let regionOpacity = 1;
            if (viewMode === 'team_highlight' && highlightTeamId && team?.id !== highlightTeamId) {
              regionOpacity = 0.2;
            } else if (viewMode === 'vacancies') {
              regionOpacity = 0.2;
            }

            return (
              <g key={`text-region-${region.id}`} opacity={regionOpacity}>
                <text
                  x={centroid.x}
                  y={centroid.y}
                  fill={isSelected ? (team ? team.color : "#60a5fa") : (team ? team.color : "#6b7280")}
                  fontSize={12 / camera.zoom}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono"
                  opacity={team ? 1 : 0.6}
                >
                  {region.name || (region.spaceType ? region.spaceType.toUpperCase() : 'AREA')}
                </text>
                {team && (
                   <text
                   x={centroid.x}
                   y={centroid.y + (16 / camera.zoom)}
                   fill={team.color}
                   fontSize={10 / camera.zoom}
                   textAnchor="middle"
                   dominantBaseline="middle"
                   className="font-mono font-bold"
                 >
                   {team.name}
                 </text>
                )}
              </g>
            );
          })}

          {/* Edge Texts */}
          {Object.values(document.edges).map(edge => {
            const start = document.nodes[edge.startNodeId].position;
            const end = document.nodes[edge.endNodeId].position;
            const isSelected = selectedIds.includes(edge.id);
            const len = distance(start, end);
            
            if (!isSelected) return null;

            return (
              <text
                key={`text-edge-${edge.id}`}
                x={(start.x + end.x) / 2}
                y={(start.y + end.y) / 2 - (10 / camera.zoom)}
                fill="#3b82f6"
                fontSize={12 / camera.zoom}
                textAnchor="middle"
                className="font-mono"
              >
                {Math.round(len)} px
              </text>
            );
          })}

          {/* Furniture Texts */}
          {Object.values(document.furniture).map(f => {
            const team = f.teamId ? document.teams[f.teamId] : (f.hostRegionId && document.regions[f.hostRegionId]?.teamId ? document.teams[document.regions[f.hostRegionId].teamId!] : null);
            const person = f.personId ? document.people[f.personId] : null;
            
            let fOpacity = 1;
            if (viewMode === 'team_highlight' && highlightTeamId && team?.id !== highlightTeamId) {
              fOpacity = 0.5;
            } else if (viewMode === 'vacancies' && !(f.type === 'desk' && !f.personId)) {
              fOpacity = 0.5;
            }

            return (
              <g key={`text-furn-${f.id}`} transform={`translate(${f.position.x}, ${f.position.y})`} opacity={fOpacity}>
                {person && (
                  <text y={f.type === 'desk' ? -15 : -20} fill={team ? team.color : "#d1d5db"} fontSize={8 / camera.zoom} textAnchor="middle" className="font-semibold">
                    {person.name}
                  </text>
                )}
                {viewMode === 'vacancies' && f.type === 'desk' && !f.personId && (
                  <text y={-15} fill="#ef4444" fontSize={8 / camera.zoom} textAnchor="middle" className="font-bold">
                    VACANT
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Drawing Line Text */}
          {activeTool === 'wall' && drawingEdgeStartNodeId && (
            <text
              x={(document.nodes[drawingEdgeStartNodeId].position.x + cursorWorldPosition.x) / 2}
              y={(document.nodes[drawingEdgeStartNodeId].position.y + cursorWorldPosition.y) / 2 - (10 / camera.zoom)}
              fill="#9ca3af"
              fontSize={12 / camera.zoom}
              textAnchor="middle"
              className="font-mono"
            >
              {Math.round(distance(document.nodes[drawingEdgeStartNodeId].position, cursorWorldPosition))} px
            </text>
          )}
        </g>
        {/* Render Marquee Selection Box */}
        {selectionBox && (
          <rect
            x={Math.min(selectionBox.start.x, selectionBox.current.x)}
            y={Math.min(selectionBox.start.y, selectionBox.current.y)}
            width={Math.abs(selectionBox.start.x - selectionBox.current.x)}
            height={Math.abs(selectionBox.start.y - selectionBox.current.y)}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth={1 / camera.zoom}
            pointerEvents="none"
          />
        )}
      </g>
    </svg>
    </>
  );
}
