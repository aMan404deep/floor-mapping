import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Layers, Shapes, Users, Plus, Trash2 } from 'lucide-react';

export function LeftSidebar() {
  const store = useEditorStore();
  const document = store.getDocument();
  const selectedIds = store.getSelectedIds();
  
  const [activeTab, setActiveTab] = useState<'layers' | 'templates' | 'org'>('org');

  const handleDragStart = (e: React.DragEvent, shapeType: string) => {
    e.dataTransfer.setData('shapeType', shapeType);
    e.dataTransfer.effectAllowed = 'copy';
    store.setDraggingShapeType(shapeType);
  };

  const handleAddTeam = () => {
    store.addTeam(`Team ${Object.keys(document.teams).length + 1}`);
  };

  const handleAddPerson = () => {
    store.addPerson(`Person ${Object.keys(document.people).length + 1}`);
  };

  return (
    <div className="w-64 bg-[#2c2c2c] border-r border-[#3e3e3e] flex flex-col h-full text-zinc-300 text-sm overflow-hidden">
      <div className="flex border-b border-[#3e3e3e]">
        <button 
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 ${activeTab === 'templates' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-400'}`}
          onClick={() => setActiveTab('templates')}
        >
          <Shapes size={14} /> Shapes
        </button>
        <button 
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 ${activeTab === 'org' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-400'}`}
          onClick={() => setActiveTab('org')}
        >
          <Users size={14} /> Org
        </button>
        <button 
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 ${activeTab === 'layers' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-400'}`}
          onClick={() => setActiveTab('layers')}
        >
          <Layers size={14} /> Layers
        </button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        {activeTab === 'layers' && (
          <>
            <div className="mb-2 uppercase text-[10px] tracking-wider text-zinc-500 px-2 font-semibold">
              Regions ({Object.keys(document.regions).length})
            </div>
            {Object.values(document.regions).map(region => {
              const isSelected = selectedIds.includes(region.id);
              return (
                <div 
                  key={region.id}
                  className={`px-2 py-1.5 rounded flex items-center cursor-pointer ${isSelected ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#383838]'}`}
                  onClick={(e) => store.select(region.id, e.shiftKey)}
                >
                  <span className="truncate">{region.name || `Region ${region.id.split('_')[2]}`}</span>
                </div>
              );
            })}

            <div className="mt-4 mb-2 uppercase text-[10px] tracking-wider text-zinc-500 px-2 font-semibold">
              Walls ({Object.keys(document.edges).length})
            </div>
            {Object.values(document.edges).map(edge => {
              const isSelected = selectedIds.includes(edge.id);
              return (
                <div 
                  key={edge.id}
                  className={`px-2 py-1.5 rounded flex items-center cursor-pointer ${isSelected ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#383838]'}`}
                  onClick={(e) => store.select(edge.id, e.shiftKey)}
                >
                  <span className="truncate">Wall {edge.id.split('_')[2]}</span>
                </div>
              );
            })}
            
            <div className="mt-4 mb-2 uppercase text-[10px] tracking-wider text-zinc-500 px-2 font-semibold">
              Nodes ({Object.keys(document.nodes).length})
            </div>
            {Object.values(document.nodes).map(node => {
              const isSelected = selectedIds.includes(node.id);
              return (
                <div 
                  key={node.id}
                  className={`px-2 py-1.5 rounded flex items-center cursor-pointer ${isSelected ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#383838]'}`}
                  onClick={(e) => store.select(node.id, e.shiftKey)}
                >
                  <span className="truncate">Node {node.id.split('_')[2]}</span>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'templates' && (
          <div className="p-2 overflow-y-auto max-h-[calc(100vh-42px)] pb-20">
            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-3 px-1">Rooms</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'square')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-8 h-8 border-2 border-zinc-500 mb-2"></div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Square</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'rectangle')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-10 h-6 border-2 border-zinc-500 mb-2 mt-1"></div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Rect</span>
              </div>
              
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'l-shape')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-8 h-8 flex flex-col mb-2">
                  <div className="w-4 h-4 border-l-2 border-t-2 border-r-2 border-zinc-500"></div>
                  <div className="w-8 h-4 border-l-2 border-b-2 border-r-2 border-zinc-500 border-t-2"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">L-Shape</span>
              </div>
              
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 't-shape')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-10 h-8 flex flex-col items-center mb-2">
                  <div className="w-10 h-4 border-2 border-zinc-500"></div>
                  <div className="w-4 h-4 border-l-2 border-r-2 border-b-2 border-zinc-500"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">T-Shape</span>
              </div>
              
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'u-shape')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-10 h-8 flex mb-2 relative">
                  <div className="w-4 h-8 border-2 border-zinc-500 absolute left-0"></div>
                  <div className="w-4 h-8 border-2 border-zinc-500 absolute right-0"></div>
                  <div className="w-full h-4 border-b-2 border-zinc-500 absolute bottom-0"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">U-Shape</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'cross')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-8 h-8 flex flex-col items-center justify-center relative mb-2">
                  <div className="w-8 h-3 border-2 border-zinc-500 absolute"></div>
                  <div className="w-3 h-8 border-2 border-zinc-500 absolute"></div>
                  <div className="w-3 h-3 bg-[#1e1e1e] absolute"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Cross</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'h-shape')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-8 h-8 flex flex-col items-center justify-center relative mb-2">
                  <div className="w-2 h-8 border-2 border-zinc-500 absolute left-0"></div>
                  <div className="w-2 h-8 border-2 border-zinc-500 absolute right-0"></div>
                  <div className="w-8 h-2 border-y-2 border-zinc-500 absolute"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">H-Shape</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, 'octagon')}
                onDragEnd={() => store.setDraggingShapeType(null)}
              >
                <div className="w-8 h-8 flex items-center justify-center mb-2">
                  <div className="w-8 h-8 border-2 border-zinc-500" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Octagon</span>
              </div>
            </div>

            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-3 px-1 mt-6">Structural Layouts (With Walls)</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'startup-office');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('startup-office');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-10 h-8 border-2 border-zinc-500 rounded-sm"></div>
                  <div className="w-6 h-8 border-l-2 border-zinc-500 absolute right-0"></div>
                  <div className="w-6 h-4 border-b-2 border-zinc-500 absolute right-0 top-1"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Startup Office</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'team-room');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('team-room');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-8 h-8 border-2 border-zinc-500 rounded-sm absolute"></div>
                  <div className="w-4 h-3 bg-zinc-600 rounded-sm absolute"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Team Room</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'open-bay');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('open-bay');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-10 h-6 border-2 border-zinc-500 rounded-sm absolute"></div>
                  <div className="w-2 h-2 bg-zinc-600 rounded-sm absolute left-2"></div>
                  <div className="w-2 h-2 bg-zinc-600 rounded-sm absolute right-2"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Open Bay</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'l-shape-room');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('l-shape-room');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-6 h-8 border-l-2 border-t-2 border-zinc-500 absolute left-2 top-1"></div>
                  <div className="w-6 h-4 border-r-2 border-b-2 border-zinc-500 absolute right-2 bottom-1"></div>
                  <div className="w-2 h-4 border-l-2 border-b-2 border-zinc-500 absolute left-4 top-1"></div>
                  <div className="w-4 h-2 border-t-2 border-r-2 border-zinc-500 absolute left-2 top-5"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">L-Room</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'full-floor');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('full-floor');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex flex-col items-center justify-center relative border-2 border-zinc-500 rounded-sm p-1">
                  <div className="w-4 h-4 border-2 border-zinc-500"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Full Floor</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'full-office');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('full-office');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative border-2 border-zinc-500 rounded-sm p-1 gap-1">
                   <div className="w-2 h-full border-r-2 border-zinc-500"></div>
                   <div className="w-2 h-full border-l-2 border-zinc-500"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Full Office</span>
              </div>
            </div>

            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-3 px-1 mt-6">Furniture Layouts (No Walls)</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', '4-person-pod');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('4-person-pod');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center flex-wrap gap-0.5">
                  <div className="w-4 h-3 bg-zinc-600 rounded-sm"></div>
                  <div className="w-4 h-3 bg-zinc-600 rounded-sm"></div>
                  <div className="w-4 h-3 bg-zinc-600 rounded-sm"></div>
                  <div className="w-4 h-3 bg-zinc-600 rounded-sm"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">4-Person Pod</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'manager-office');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('manager-office');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <div className="w-6 h-4 bg-zinc-500 rounded-sm absolute mb-3"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full absolute mt-3 ml-3"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full absolute mt-3 mr-3"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Manager Cabin</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'meeting-area');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('meeting-area');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-5 h-7 bg-zinc-600 rounded-md"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full absolute left-1 top-2"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full absolute left-1 bottom-2"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full absolute right-1 top-2"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full absolute right-1 bottom-2"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Meeting Room</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('templateType', 'lounge-area');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingTemplateType('lounge-area');
                }}
                onDragEnd={() => store.setDraggingTemplateType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
                  <div className="w-3 h-3 bg-zinc-500 rounded-full"></div>
                  <div className="w-6 h-2 bg-zinc-600 rounded-sm absolute top-1"></div>
                  <div className="w-2 h-6 bg-zinc-600 rounded-sm absolute left-1"></div>
                  <div className="w-2 h-6 bg-zinc-600 rounded-sm absolute right-1"></div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Lounge</span>
              </div>
            </div>

            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-3 px-1 mt-6">Individual Furniture</div>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'desk');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('desk');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-25 -20 50 40" width="100%" height="100%">
                    <rect x={-20} y={-12} width={40} height={24} fill="#52525b" stroke="#71717a" strokeWidth={2} rx={2} />
                    <rect x={-10} y={-10} width={20} height={4} fill="#71717a" rx={1} />
                    <rect x={-6} y={1} width={12} height={5} fill="#71717a" rx={0.5} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Desk</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'table');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('table');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-25 -25 50 50" width="100%" height="100%">
                    <path d="M -8 -15 Q 0 -20 8 -15" fill="none" stroke="#71717a" strokeWidth={3} />
                    <path d="M -8 15 Q 0 20 8 15" fill="none" stroke="#71717a" strokeWidth={3} />
                    <path d="M -15 -8 Q -20 0 -15 8" fill="none" stroke="#71717a" strokeWidth={3} />
                    <path d="M 15 -8 Q 20 0 15 8" fill="none" stroke="#71717a" strokeWidth={3} />
                    <circle r={15} fill="#52525b" stroke="#71717a" strokeWidth={2} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Table</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'chair');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('chair');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <path d="M -9 2 C -9 -6, 9 -6, 9 2" fill="none" stroke="#71717a" strokeWidth={3} strokeLinecap="round" />
                    <rect x={-7} y={-3} width={14} height={12} rx={4} fill="#52525b" stroke="#71717a" strokeWidth={2} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Chair</span>
              </div>
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'plant');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('plant');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <circle cx={-4} cy={-4} r={7} fill="#166534" stroke="#14532d" strokeWidth={2} opacity={0.8} />
                    <circle cx={4} cy={-4} r={7} fill="#166534" stroke="#14532d" strokeWidth={2} opacity={0.8} />
                    <circle cx={-4} cy={4} r={7} fill="#166534" stroke="#14532d" strokeWidth={2} opacity={0.8} />
                    <circle cx={4} cy={4} r={7} fill="#166534" stroke="#14532d" strokeWidth={2} opacity={0.8} />
                    <circle cx={0} cy={0} r={4} fill="#451a03" stroke="#14532d" strokeWidth={2} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Plant</span>
              </div>
              
              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'sofa');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('sofa');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-25 -20 50 40" width="100%" height="100%">
                    <rect x={-20} y={-10} width={40} height={20} fill="#52525b" stroke="#71717a" strokeWidth={2} rx={4} />
                    <rect x={-18} y={-14} width={36} height={10} fill="#71717a" rx={2} />
                    <rect x={-22} y={-12} width={6} height={20} fill="#71717a" rx={2} />
                    <rect x={16} y={-12} width={6} height={20} fill="#71717a" rx={2} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Sofa</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'whiteboard');
                  e.dataTransfer.effectAllowed = 'copy';
                  store.setDraggingFurnitureType('whiteboard');
                }}
                onDragEnd={() => store.setDraggingFurnitureType(null)}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-25 -10 50 20" width="100%" height="100%">
                    <rect x={-20} y={-3} width={40} height={6} fill="#e4e4e7" stroke="#a1a1aa" strokeWidth={1} rx={1} />
                    <line x1={-15} y1={3} x2={-17} y2={8} stroke="#71717a" strokeWidth={2} strokeLinecap="round" />
                    <line x1={15} y1={3} x2={17} y2={8} stroke="#71717a" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Board</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'cabinet');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <rect x={-12} y={-10} width={24} height={20} fill="#52525b" stroke="#71717a" strokeWidth={2} rx={1} />
                    <line x1={-8} y1={-5} x2={8} y2={-5} stroke="#71717a" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={-8} y1={0} x2={8} y2={0} stroke="#71717a" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={-8} y1={5} x2={8} y2={5} stroke="#71717a" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Cabinet</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'watercooler');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <rect x={-6} y={-6} width={12} height={12} fill="#52525b" stroke="#71717a" strokeWidth={2} rx={2} />
                    <circle cx={0} cy={0} r={4} fill="#60a5fa" stroke="#3b82f6" strokeWidth={1} />
                    <rect x={-3} y={6} width={6} height={3} fill="#71717a" rx={1} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Water</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'cubicle');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-30 -25 60 50" width="100%" height="100%">
                    <path d="M -24 20 L -24 -20 L 24 -20 L 24 20" fill="none" stroke="#71717a" strokeWidth={4} strokeLinecap="square" />
                    <rect x={-20} y={-18} width={40} height={20} fill="#52525b" stroke="#71717a" strokeWidth={1.5} rx={1} />
                    <rect x={-10} y={-16} width={20} height={4} fill="#71717a" rx={1} />
                    <rect x={-6} y={6} width={12} height={10} rx={4} fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
                    <path d="M -8 15 C -8 20, 8 20, 8 15" fill="none" stroke="#71717a" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Cubicle</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'toilet');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <rect x={-8} y={-14} width={16} height={10} rx={2} fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
                    <ellipse cx={0} cy={2} rx={7} ry={10} fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Toilet</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'sink');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-15 -15 30 30" width="100%" height="100%">
                    <rect x={-12} y={-10} width={24} height={16} rx={2} fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
                    <ellipse cx={0} cy={-2} rx={8} ry={5} fill="#71717a" opacity={0.3} />
                    <circle cx={0} cy={-8} r={1.5} fill="#71717a" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Sink</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'server_rack');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-20 -20 40 40" width="100%" height="100%">
                    <rect x={-12} y={-15} width={24} height={30} fill="#52525b" stroke="#71717a" strokeWidth={1.5} rx={1} />
                    <line x1={-8} y1={-10} x2={8} y2={-10} stroke="#71717a" strokeWidth={1} />
                    <line x1={-8} y1={-5} x2={8} y2={-5} stroke="#71717a" strokeWidth={1} />
                    <line x1={-8} y1={0} x2={8} y2={0} stroke="#71717a" strokeWidth={1} />
                    <line x1={-8} y1={5} x2={8} y2={5} stroke="#71717a" strokeWidth={1} />
                    <line x1={-8} y1={10} x2={8} y2={10} stroke="#71717a" strokeWidth={1} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Server</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'printer');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-20 -20 40 40" width="100%" height="100%">
                    <rect x={-14} y={-12} width={28} height={20} fill="#52525b" stroke="#71717a" strokeWidth={1.5} rx={3} />
                    <rect x={-8} y={-14} width={16} height={6} fill="#71717a" opacity={0.3} />
                    <rect x={-10} y={8} width={20} height={6} fill="#71717a" opacity={0.3} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Printer</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'bookshelf');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-25 -15 50 30" width="100%" height="100%">
                    <rect x={-18} y={-8} width={36} height={16} fill="#52525b" stroke="#71717a" strokeWidth={1.5} rx={1} />
                    <line x1={-12} y1={-8} x2={-12} y2={8} stroke="#71717a" strokeWidth={1} opacity={0.5} />
                    <line x1={-6} y1={-8} x2={-6} y2={8} stroke="#71717a" strokeWidth={1} opacity={0.5} />
                    <line x1={0} y1={-8} x2={0} y2={8} stroke="#71717a" strokeWidth={1} opacity={0.5} />
                    <line x1={6} y1={-8} x2={6} y2={8} stroke="#71717a" strokeWidth={1} opacity={0.5} />
                    <line x1={12} y1={-8} x2={12} y2={8} stroke="#71717a" strokeWidth={1} opacity={0.5} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Books</span>
              </div>

              <div 
                className="bg-[#1e1e1e] border border-[#3e3e3e] rounded flex flex-col items-center justify-center p-3 cursor-grab hover:border-blue-500 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('furnitureType', 'tv');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                  <svg viewBox="-30 -15 60 30" width="100%" height="100%">
                    <rect x={-20} y={-3} width={40} height={6} fill="#71717a" rx={1} />
                    <rect x={-22} y={-2} width={44} height={4} fill="#3b82f6" opacity={0.8} rx={1} />
                    <line x1={-10} y1={3} x2={-10} y2={8} stroke="#71717a" strokeWidth={1.5} />
                    <line x1={10} y1={3} x2={10} y2={8} stroke="#71717a" strokeWidth={1.5} />
                    <line x1={-15} y1={8} x2={15} y2={8} stroke="#71717a" strokeWidth={1.5} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Screen</span>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'org' && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-3 mt-1">
              <span className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold px-1">Teams ({Object.keys(document.teams).length})</span>
              <button 
                onClick={handleAddTeam}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#3e3e3e] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {Object.keys(document.teams).length === 0 && (
              <div className="text-xs text-zinc-500 italic px-2 mb-4">No teams created.</div>
            )}
            
            <div className="flex flex-col gap-2 mb-6">
              {Object.values(document.teams).map(team => (
                <div 
                  key={team.id} 
                  className="group flex flex-col gap-2 p-2 rounded bg-[#2c2c2c] border border-[#3e3e3e]"
                  draggable
                  onDragStart={(e) => {
                    // Prevent drag if we're focused on an input
                    if ((e.target as HTMLElement).tagName === 'INPUT') {
                      e.preventDefault();
                      return;
                    }
                    e.dataTransfer.setData('teamId', team.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) => store.updateTeam(team.id, { color: e.target.value })}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => store.updateTeam(team.id, { name: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-zinc-500"
                        placeholder="Team Name"
                      />
                    </div>
                    <button 
                      onClick={() => store.deleteTeam(team.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded ml-2"
                      title="Remove Team"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1 pl-6">
                    <input
                      type="text"
                      value={team.managerName || ''}
                      onChange={(e) => store.updateTeam(team.id, { managerName: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Manager Name"
                    />
                    <input
                      type="text"
                      value={team.department || ''}
                      onChange={(e) => store.updateTeam(team.id, { department: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Department / Cost Center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold px-1">People ({Object.keys(document.people).length})</span>
              <button 
                onClick={handleAddPerson}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#3e3e3e] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            
            {Object.keys(document.people).length === 0 && (
              <div className="text-xs text-zinc-500 italic px-2">No people created.</div>
            )}
            
            <div className="flex flex-col gap-2">
              {Object.values(document.people).map(person => (
                <div 
                  key={person.id} 
                  className="group flex flex-col gap-2 p-2 rounded bg-[#2c2c2c] border border-[#3e3e3e]"
                  draggable
                  onDragStart={(e) => {
                    // Prevent drag if we're focused on an input or select
                    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') {
                      e.preventDefault();
                      return;
                    }
                    e.dataTransfer.setData('personId', person.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {person.name.charAt(0).toUpperCase() || '?'}
                      </div>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => store.updatePerson(person.id, { name: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-zinc-500"
                        placeholder="Person Name"
                      />
                    </div>
                    <button 
                      onClick={() => store.deletePerson(person.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded ml-2"
                      title="Remove Person"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 pl-7">
                    <input
                      type="text"
                      value={person.role || ''}
                      onChange={(e) => store.updatePerson(person.id, { role: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Role / Job Title"
                    />
                    <input
                      type="text"
                      value={person.field || ''}
                      onChange={(e) => store.updatePerson(person.id, { field: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Field / Specialization"
                    />
                    <input
                      type="email"
                      value={person.email || ''}
                      onChange={(e) => store.updatePerson(person.id, { email: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Email Address"
                    />
                    <input
                      type="tel"
                      value={person.phone || ''}
                      onChange={(e) => store.updatePerson(person.id, { phone: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                      placeholder="Phone Number"
                    />
                    <select
                      value={person.teamId || ''}
                      onChange={(e) => store.updatePerson(person.id, { teamId: e.target.value })}
                      className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-1 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Unassigned Team</option>
                      {Object.values(document.teams).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
