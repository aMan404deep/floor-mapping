import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { MousePointer2, PenLine, Hand, Grid3X3, DoorOpen, AppWindow, Spline } from 'lucide-react';

export function Toolbar() {
  const store = useEditorStore();
  const activeTool = store.getActiveTool();
  const isPanning = store.getIsPanning();
  const gridSnapEnabled = store.getGridSnapEnabled();

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'wall', icon: PenLine, label: 'Wall Tool (W)' },
    { id: 'curve', icon: Spline, label: 'Curved Wall' },
    { id: 'door', icon: DoorOpen, label: 'Door' },
    { id: 'window', icon: AppWindow, label: 'Window' },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#2c2c2c] border border-[#3e3e3e] rounded-lg shadow-xl z-10">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`relative p-2 rounded-md flex items-center justify-center transition-colors group ${
            !isPanning && activeTool === tool.id ? 'bg-[#404040] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
          }`}
          onClick={() => {
            store.setIsPanning(false);
            store.setActiveTool(tool.id);
          }}
        >
          <tool.icon size={18} />
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            {tool.label}
          </div>
        </button>
      ))}
      <div className="w-[1px] h-6 bg-[#3e3e3e] mx-1" />
      <button
        className={`relative p-2 rounded-md flex items-center justify-center transition-colors group ${
          isPanning ? 'bg-[#404040] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
        }`}
        onClick={() => store.setIsPanning(!isPanning)}
      >
        <Hand size={18} />
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
          Pan (Spacebar)
        </div>
      </button>
      <div className="w-[1px] h-6 bg-[#3e3e3e] mx-1" />
      <button
        className={`relative p-2 rounded-md flex items-center justify-center transition-colors group ${
          gridSnapEnabled ? 'bg-[#404040] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
        }`}
        onClick={() => store.toggleGridSnap()}
      >
        <Grid3X3 size={18} />
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
          Toggle Grid Snapping
        </div>
      </button>
    </div>
  );
}
