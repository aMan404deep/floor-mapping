import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { polygonArea } from '../lib/geometry';

export function RightSidebar() {
  const store = useEditorStore();
  const document = store.getDocument();
  const selectedIds = store.getSelectedIds();

  const getSelectedItem = () => {
    if (selectedIds.length !== 1) return null;
    const id = selectedIds[0];
    if (document.nodes[id]) return { type: 'node', item: document.nodes[id] };
    if (document.edges[id]) return { type: 'edge', item: document.edges[id] };
    if (document.regions[id]) return { type: 'region', item: document.regions[id] };
    if (document.furniture[id]) return { type: 'furniture', item: document.furniture[id] };
    return null;
  };

  const selected = getSelectedItem();

  return (
    <div className="w-64 bg-[#2c2c2c] border-l border-[#3e3e3e] flex flex-col h-full text-zinc-300 text-sm overflow-y-auto">
      <div className="p-4 font-semibold text-white border-b border-[#3e3e3e]">
        Properties
      </div>
      <div className="p-4 flex-1">
        {selectedIds.length === 0 && (
          <div className="text-zinc-500 text-center mt-4">
            No selection
          </div>
        )}
        
        {selectedIds.length > 1 && (
          <div className="text-zinc-500 text-center mt-4">
            Multiple selected
          </div>
        )}

        {selected && selected.type === 'node' && (
          <div className="space-y-4">
            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-2">Node</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500">X</label>
                <input 
                  type="text" 
                  value={(selected.item as any).position.x.toFixed(1)} 
                  readOnly 
                  className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Y</label>
                <input 
                  type="text" 
                  value={(selected.item as any).position.y.toFixed(1)} 
                  readOnly 
                  className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300"
                />
              </div>
            </div>
          </div>
        )}

        {selected && selected.type === 'edge' && (
          <div className="space-y-4">
            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-2">Wall / Edge</div>
            <div>
              <label className="text-xs text-zinc-500">Start Node</label>
              <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 truncate">
                {(selected.item as any).startNodeId}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500">End Node</label>
              <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 truncate">
                {(selected.item as any).endNodeId}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500">Length</label>
              <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 truncate">
                {(() => {
                   const start = document.nodes[(selected.item as any).startNodeId].position;
                   const end = document.nodes[(selected.item as any).endNodeId].position;
                   return Math.round(Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)));
                })()} px
              </div>
            </div>
          </div>
        )}

        {selected && selected.type === 'region' && (
          <div className="space-y-4">
            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-2">Region</div>
            <div>
              <label className="text-xs text-zinc-500">Name</label>
              <input 
                type="text" 
                value={(selected.item as any).name || ''}
                onChange={(e) => store.updateRegion(selectedIds[0], { name: e.target.value })}
                placeholder="e.g. Conference Room"
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Space Type</label>
              <select 
                value={(selected.item as any).spaceType || ''}
                onChange={(e) => store.updateRegion(selectedIds[0], { spaceType: e.target.value as any })}
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 focus:outline-none"
              >
                <option value="">Unassigned</option>
                <option value="cabin">Cabin / Private Office</option>
                <option value="bay">Open Bay / Zone</option>
                <option value="cubicle">Cubicle Bank</option>
                <option value="meeting">Meeting Room</option>
                <option value="open">Open Workspace</option>
                <option value="reception">Reception</option>
                <option value="circulation">Circulation / Corridor</option>
                <option value="pantry">Pantry / Kitchen</option>
                <option value="breakout">Breakout Area</option>
                <option value="washroom">Washroom / Restroom</option>
                <option value="server_room">Server / IT Room</option>
                <option value="storage">Storage / Supply Room</option>
                <option value="lounge">Lounge / Waiting Area</option>
                <option value="print_station">Print / Copy Station</option>
                <option value="wellness">Wellness / Mother's Room</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500">Capacity</label>
                <input 
                  type="number" 
                  value={(selected.item as any).capacity || ''}
                  onChange={(e) => store.updateRegion(selectedIds[0], { capacity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Area</label>
                <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 truncate">
                  {(() => {
                    const pts = (selected.item as any).boundaryEdgeIds.map((edgeId: string) => {
                      const edge = document.edges[edgeId];
                      return document.nodes[edge.startNodeId].position;
                    });
                    return Math.round(polygonArea(pts));
                  })()} sq
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-[#3e3e3e]">
              <label className="text-xs text-zinc-500">Assigned Team</label>
              <select 
                value={(selected.item as any).teamId || ''}
                onChange={(e) => store.updateRegion(selectedIds[0], { teamId: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {Object.values(document.teams || {}).map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selected && selected.type === 'furniture' && (
          <div className="space-y-4">
            <div className="uppercase text-[10px] tracking-wider text-zinc-500 font-semibold mb-2 flex justify-between items-center">
              <span>{(selected.item as any).type}</span>
              <button 
                onClick={() => store.deleteSelected()}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
                title="Delete Furniture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500">X Position</label>
                <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300">
                  {Math.round((selected.item as any).position.x)}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Y Position</label>
                <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300">
                  {Math.round((selected.item as any).position.y)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500">Rotation (deg)</label>
              <input 
                type="number"
                value={(selected.item as any).rotation || 0}
                onChange={(e) => store.updateFurniture(selectedIds[0], { rotation: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-[#3e3e3e]">
              <label className="text-xs text-zinc-500">Host Region</label>
              <div className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-500 truncate text-xs">
                {(selected.item as any).hostRegionId ? 
                  document.regions[(selected.item as any).hostRegionId]?.name || document.regions[(selected.item as any).hostRegionId]?.spaceType?.toUpperCase() || 'Unnamed Region' 
                  : 'Outside Region'}
              </div>
            </div>

            <div className="pt-2 border-t border-[#3e3e3e]">
              <label className="text-xs text-zinc-500">Assigned Team</label>
              <select 
                value={(selected.item as any).teamId || ''}
                onChange={(e) => store.updateFurniture(selectedIds[0], { teamId: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 focus:outline-none"
              >
                <option value="">
                  {((selected.item as any).hostRegionId && document.regions[(selected.item as any).hostRegionId]?.teamId) ? 
                    `(Inherited: ${document.teams[document.regions[(selected.item as any).hostRegionId].teamId!].name})` : 
                    'Unassigned'}
                </option>
                {Object.values(document.teams || {}).map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-[#3e3e3e]">
              <label className="text-xs text-zinc-500">Assigned Person</label>
              <select 
                value={(selected.item as any).personId || ''}
                onChange={(e) => store.updateFurniture(selectedIds[0], { personId: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 mt-1 text-zinc-300 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {Object.values(document.people || {}).map(person => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
