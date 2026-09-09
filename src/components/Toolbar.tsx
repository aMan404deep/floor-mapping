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
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[#475569] border-4 border-black rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`relative p-3 rounded-xl flex items-center justify-center border-4 border-transparent transition-transform active:scale-90 group ${
            !isPanning && activeTool === tool.id ? 'bg-[#38bdf8] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)]' : 'bg-[#94a3b8] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)] hover:bg-[#cbd5e1]'
          }`}
          onClick={() => {
            store.setIsPanning(false);
            store.setActiveTool(tool.id);
          }}
        >
          <tool.icon size={22} strokeWidth={3} />
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border-2 border-white">
            {tool.label}
          </div>
        </button>
      ))}
      <div className="w-[4px] h-8 bg-black rounded-full mx-1" />
      <button
        className={`relative p-3 rounded-xl flex items-center justify-center border-4 border-transparent transition-transform active:scale-90 group ${
          isPanning ? 'bg-[#38bdf8] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)]' : 'bg-[#94a3b8] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)] hover:bg-[#cbd5e1]'
        }`}
        onClick={() => store.setIsPanning(!isPanning)}
      >
        <Hand size={22} strokeWidth={3} />
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border-2 border-white">
          Pan (Spacebar)
        </div>
      </button>
      <div className="w-[4px] h-8 bg-black rounded-full mx-1" />
      <button
        className={`relative p-3 rounded-xl flex items-center justify-center border-4 border-transparent transition-transform active:scale-90 group ${
          gridSnapEnabled ? 'bg-[#a3e635] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)]' : 'bg-[#94a3b8] border-black text-black shadow-[inset_0px_-3px_0px_rgba(0,0,0,0.2)] hover:bg-[#cbd5e1]'
        }`}
        onClick={() => store.toggleGridSnap()}
      >
        <Grid3X3 size={22} strokeWidth={3} />
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border-2 border-white">
          Toggle Grid Snapping
        </div>
      </button>
    </div>
  );
}
