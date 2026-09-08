import React, { useEffect } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { TopMenu } from './TopMenu';
import { ViewModes } from './ViewModes';
import { store } from '../store/EditorStore';

export function Editor() {
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
      }

      // Spacebar for panning
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
        store.setIsPanning(true);
      }
      
      // Delete selected
      if (e.key === 'Backspace' || e.key === 'Delete') {
        store.deleteSelected();
      }

      // Tool shortcuts
      if (e.key === 'v' && (e.target as HTMLElement).tagName !== 'INPUT') {
        store.setActiveTool('select');
      }
      if (e.key === 'w' && (e.target as HTMLElement).tagName !== 'INPUT') {
        store.setActiveTool('wall');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        store.setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-[#1e1e1e] overflow-hidden text-zinc-300 font-sans select-none">
      <TopMenu />
      
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar />
        
        <div className="flex-1 relative overflow-hidden">
          <Toolbar />
          <Canvas />
          <ViewModes />
        </div>
        
        <RightSidebar />
      </div>
    </div>
  );
}
