import { useSyncExternalStore } from 'react';
import { store } from './EditorStore';

export function useEditorStore() {
  const subscribe = (listener: () => void) => store.subscribe(listener);
  const getSnapshot = () => store.getVersion();
  useSyncExternalStore(subscribe, getSnapshot);
  return store;
}
