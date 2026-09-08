import React, { useEffect, useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { TopMenu } from './TopMenu';
import { ViewModes } from './ViewModes';
import { useEditorStore } from '../store/useEditorStore';
import { store } from '../store/EditorStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, X, Copy, RotateCw, Trash2, UserPlus, Users } from 'lucide-react';

export function Editor() {
  const currentStore = useEditorStore();
  const leftSidebarOpen = currentStore.getLeftSidebarOpen();
  const selectedIds = currentStore.getSelectedIds();
  const contextMenu = currentStore.getContextMenu();
  const isPreviewMode = currentStore.getIsPreviewMode();
  
  const [contextMenuAssign, setContextMenuAssign] = useState<'team' | 'person' | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (store.getIsPreviewMode()) {
          store.setIsPreviewMode(false);
          return;
        }
        store.setContextMenu(null);
      }
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
      if (e.key === 'b' && (e.target as HTMLElement).tagName !== 'INPUT') {
        store.setLeftSidebarOpen(!store.getLeftSidebarOpen());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        store.setIsPanning(false);
      }
    };

    const handleClick = () => {
      if (store.getContextMenu()) {
        store.setContextMenu(null);
        setContextMenuAssign(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handleClick);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-[#1e1e1e] overflow-hidden text-zinc-300 font-sans select-none">
      {!isPreviewMode && <TopMenu />}
      
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence initial={false}>
          {!isPreviewMode && leftSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="h-full flex-shrink-0 z-20 bg-[#252525] border-r border-[#3e3e3e] overflow-hidden"
            >
              <div className="w-64 h-full">
                <LeftSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {!isPreviewMode && <Toolbar />}
          <Canvas />
          {!isPreviewMode && <ViewModes />}

          {/* Floating Sidebar Toggle */}
          {!isPreviewMode && (
            <button
              onClick={() => store.setLeftSidebarOpen(!leftSidebarOpen)}
              className="absolute top-4 left-4 z-30 bg-[#2c2c2c] border border-[#3e3e3e] text-zinc-400 hover:text-white p-2 rounded-md shadow-md transition-colors"
              title="Toggle Left Sidebar (B)"
            >
              {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          )}

          {/* Exit Preview Button */}
          {isPreviewMode && (
            <button
              onClick={() => store.setIsPreviewMode(false)}
              className="absolute top-4 right-4 z-50 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transition-colors font-medium text-sm border border-blue-400/30"
            >
              <X size={16} /> Exit Preview (Esc)
            </button>
          )}
          
          {/* Floating Properties */}
          <AnimatePresence>
            {!isPreviewMode && selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="absolute top-4 right-4 z-30 w-72 max-h-[calc(100vh-120px)] overflow-y-auto bg-[#2c2c2c]/95 backdrop-blur-md border border-[#3e3e3e] shadow-2xl rounded-lg"
              >
                <RightSidebar />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Context Menu */}
          <AnimatePresence>
            {contextMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{ top: contextMenu.y, left: contextMenu.x }}
                className="absolute z-50 min-w-[160px] bg-[#2c2c2c] border border-[#3e3e3e] rounded-md shadow-2xl py-1 text-sm overflow-hidden"
              >
                {contextMenu.targetId ? (
                  contextMenuAssign === 'team' ? (
                    <div className="max-h-48 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] uppercase text-zinc-500 font-semibold">Assign Team</div>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); store.updateFurniture(contextMenu.targetId!, { teamId: undefined }); store.setContextMenu(null); setContextMenuAssign(null); }}>
                        Unassign
                      </button>
                      {Object.values(currentStore.getDocument().teams || {}).map(t => (
                        <button key={t.id} className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors truncate"
                          onClick={(e) => { e.stopPropagation(); store.updateFurniture(contextMenu.targetId!, { teamId: t.id }); store.setContextMenu(null); setContextMenuAssign(null); }}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  ) : contextMenuAssign === 'person' ? (
                    <div className="max-h-48 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] uppercase text-zinc-500 font-semibold">Assign Person</div>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); store.updateFurniture(contextMenu.targetId!, { personId: undefined }); store.setContextMenu(null); setContextMenuAssign(null); }}>
                        Unassign
                      </button>
                      {Object.values(currentStore.getDocument().people || {}).map(p => (
                        <button key={p.id} className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors truncate"
                          onClick={(e) => { e.stopPropagation(); store.updateFurniture(contextMenu.targetId!, { personId: p.id }); store.setContextMenu(null); setContextMenuAssign(null); }}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                  <>
                    <button 
                      className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                      onClick={() => {
                         store.deleteSelected();
                         store.setContextMenu(null);
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    {contextMenu.targetType === 'furniture' && (
                      <>
                        <button 
                          className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                          onClick={() => {
                            store.duplicateFurniture(contextMenu.targetId!);
                            store.setContextMenu(null);
                          }}
                        >
                          <Copy size={14} /> Duplicate
                        </button>
                        <button 
                          className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                          onClick={() => {
                             const doc = store.getDocument();
                             const f = doc.furniture[contextMenu.targetId!];
                             if (f) store.updateFurniture(f.id, { rotation: (f.rotation + 90) % 360 });
                             store.setContextMenu(null);
                          }}
                        >
                          <RotateCw size={14} /> Rotate 90°
                        </button>
                        <div className="h-[1px] bg-[#3e3e3e] my-1 mx-2" />
                        <button 
                          className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                          onClick={(e) => {
                             e.stopPropagation();
                             setContextMenuAssign('team');
                          }}
                        >
                          <Users size={14} /> Assign Team...
                        </button>
                        <button 
                          className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                          onClick={(e) => {
                             e.stopPropagation();
                             setContextMenuAssign('person');
                          }}
                        >
                          <UserPlus size={14} /> Assign Person...
                        </button>
                      </>
                    )}
                  </>
                  )
                ) : (
                  <>
                    <button 
                      className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white transition-colors flex items-center gap-2"
                      onClick={() => {
                         store.clearDocument();
                         store.setContextMenu(null);
                      }}
                    >
                      <Trash2 size={14} /> Clear Canvas
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
