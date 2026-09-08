import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Eye, Users, AlertCircle } from 'lucide-react';

export function ViewModes() {
  const store = useEditorStore();
  const viewMode = store.getViewMode();
  const highlightTeamId = store.getHighlightTeamId();
  const document = store.getDocument();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
      
      {viewMode === 'team_highlight' && (
        <div className="bg-[#2c2c2c] border border-[#3e3e3e] rounded-lg p-2 flex items-center gap-2 shadow-xl">
          <span className="text-xs text-zinc-400 font-semibold px-2 uppercase tracking-wider">Highlight Team:</span>
          <select 
            className="bg-[#1e1e1e] border border-[#3e3e3e] rounded px-2 py-1 text-sm focus:outline-none text-zinc-200"
            value={highlightTeamId || ''}
            onChange={(e) => store.setViewMode('team_highlight', e.target.value)}
          >
            <option value="" disabled>Select a team...</option>
            {Object.values(document.teams).map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1 p-1 bg-[#2c2c2c] border border-[#3e3e3e] rounded-lg shadow-xl">
        <button
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
            viewMode === 'default' ? 'bg-[#404040] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
          }`}
          onClick={() => store.setViewMode('default')}
        >
          <Eye size={16} />
          <span>Default</span>
        </button>
        
        <div className="w-[1px] h-4 bg-[#3e3e3e] mx-1" />
        
        <button
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
            viewMode === 'team_highlight' ? 'bg-[#404040] text-blue-400' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
          }`}
          onClick={() => store.setViewMode('team_highlight', highlightTeamId || Object.values(document.teams)[0]?.id)}
        >
          <Users size={16} />
          <span>Teams</span>
        </button>
        
        <div className="w-[1px] h-4 bg-[#3e3e3e] mx-1" />
        
        <button
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
            viewMode === 'vacancies' ? 'bg-[#404040] text-red-400' : 'text-zinc-400 hover:text-white hover:bg-[#383838]'
          }`}
          onClick={() => store.setViewMode('vacancies')}
        >
          <AlertCircle size={16} />
          <span>Vacancies</span>
        </button>
      </div>

    </div>
  );
}
