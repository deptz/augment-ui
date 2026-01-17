import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Composable for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  function handleKeyDown(event: KeyboardEvent) {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                        event.code.toLowerCase() === shortcut.key.toLowerCase();
      
      if (!keyMatches) continue;

      const ctrlMatches = shortcut.ctrl === undefined || (shortcut.ctrl === event.ctrlKey);
      const shiftMatches = shortcut.shift === undefined || (shortcut.shift === event.shiftKey);
      const altMatches = shortcut.alt === undefined || (shortcut.alt === event.altKey);
      const metaMatches = shortcut.meta === undefined || (shortcut.meta === event.metaKey);

      if (ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler();
        break;
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
