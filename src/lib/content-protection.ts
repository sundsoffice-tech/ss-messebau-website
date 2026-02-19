/**
 * Content Protection Module
 *
 * Schutzmechanismen gegen:
 * - Screenshots (PrintScreen, Snipping Tool Tastenkombinationen)
 * - Bild-Downloads (Rechtsklick speichern, Drag & Drop)
 * - Fenster-Duplikation (Ctrl+N, window.open)
 *
 * Hinweis: Clientseitige Maßnahmen können von technisch versierten
 * Nutzern umgangen werden. Sie bieten aber eine effektive Hürde
 * gegen gängiges Kopieren von Inhalten.
 */

/** Blockiert Rechtsklick-Kontextmenü auf der gesamten Seite */
function blockContextMenu(e: MouseEvent) {
  e.preventDefault()
  return false
}

/** Blockiert Tastenkombinationen für Screenshots und Speichern */
function blockKeyboardShortcuts(e: KeyboardEvent) {
  // PrintScreen
  if (e.key === 'PrintScreen') {
    e.preventDefault()
    blankScreenBriefly()
    return false
  }

  // Ctrl/Cmd + S (Seite speichern)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    return false
  }

  // Ctrl/Cmd + U (Quelltext anzeigen)
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault()
    return false
  }

  // Ctrl/Cmd + Shift + I (DevTools)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
    e.preventDefault()
    return false
  }

  // Ctrl/Cmd + Shift + S (Screenshot in manchen Browsern)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault()
    return false
  }

  // Ctrl/Cmd + P (Drucken)
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault()
    return false
  }

  // Ctrl/Cmd + N (Neues Fenster)
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    return false
  }

  // F12 (DevTools)
  if (e.key === 'F12') {
    e.preventDefault()
    return false
  }

  // Windows: Win + Shift + S (Snipping Tool)
  if (e.shiftKey && e.key === 'S' && (e.metaKey || e.getModifierState?.('OS'))) {
    e.preventDefault()
    blankScreenBriefly()
    return false
  }
}

/** Kurzes Ausblenden des Seiteninhalts bei Screenshot-Versuch */
function blankScreenBriefly() {
  const overlay = document.getElementById('ss-protection-overlay')
  if (overlay) {
    overlay.style.display = 'block'
    setTimeout(() => {
      overlay.style.display = 'none'
    }, 1200)
  }
}

/** Blockiert Drag & Drop von Bildern */
function blockImageDrag(e: DragEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG' || target.closest('img')) {
    e.preventDefault()
    return false
  }
}

/** Blockiert Bild-Auswahl per Doppelklick */
function blockSelectStart(e: Event) {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    e.preventDefault()
    return false
  }
}

/** Blockiert window.open Aufrufe, um das Öffnen neuer Fenster zu verhindern */
function patchWindowOpen() {
  const originalOpen = window.open
  window.open = function (..._args: Parameters<typeof window.open>) {
    // Erlaube nur Same-Origin Navigationen via Links (z.B. target="_blank" für tel:/mailto:)
    // Blockiere generische window.open Aufrufe
    const url = _args[0]
    if (typeof url === 'string' && (url.startsWith('tel:') || url.startsWith('mailto:'))) {
      return originalOpen.apply(window, _args)
    }
    return null
  }
}

/** Erstellt das Schutz-Overlay Element (für Screenshot-Blockierung) */
function createProtectionOverlay() {
  if (document.getElementById('ss-protection-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'ss-protection-overlay'
  overlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: #fff;
    pointer-events: none;
  `
  document.body.appendChild(overlay)
}

/** Erkennt Visibility-Änderungen (Tab-Wechsel / Fenster minimieren) */
function handleVisibilityChange() {
  // Wenn Seite wieder sichtbar wird, Overlay sicherheitshalber ausblenden
  if (!document.hidden) {
    const overlay = document.getElementById('ss-protection-overlay')
    if (overlay) {
      overlay.style.display = 'none'
    }
  }
}

/** Verhindert das Kopieren von Bildern über die Zwischenablage */
function blockCopyImages(e: ClipboardEvent) {
  const selection = window.getSelection()
  if (selection) {
    const selectedNode = selection.anchorNode?.parentElement
    if (selectedNode?.tagName === 'IMG' || selectedNode?.closest('img')) {
      e.preventDefault()
      return false
    }
  }
}

/**
 * Aktiviert alle Schutzmaßnahmen.
 * Gibt eine Cleanup-Funktion zurück zum Deaktivieren.
 */
export function initContentProtection(): () => void {
  createProtectionOverlay()
  patchWindowOpen()

  document.addEventListener('contextmenu', blockContextMenu)
  document.addEventListener('keydown', blockKeyboardShortcuts)
  document.addEventListener('dragstart', blockImageDrag)
  document.addEventListener('selectstart', blockSelectStart)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  document.addEventListener('copy', blockCopyImages)

  // Alle Bilder: draggable deaktivieren
  const disableImageDrag = () => {
    document.querySelectorAll('img').forEach((img) => {
      img.setAttribute('draggable', 'false')
      img.style.pointerEvents = 'none'
    })
  }

  disableImageDrag()

  // MutationObserver für dynamisch geladene Bilder
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLImageElement) {
          node.setAttribute('draggable', 'false')
          node.style.pointerEvents = 'none'
        }
        if (node instanceof HTMLElement) {
          node.querySelectorAll('img').forEach((img) => {
            img.setAttribute('draggable', 'false')
            img.style.pointerEvents = 'none'
          })
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Cleanup-Funktion
  return () => {
    document.removeEventListener('contextmenu', blockContextMenu)
    document.removeEventListener('keydown', blockKeyboardShortcuts)
    document.removeEventListener('dragstart', blockImageDrag)
    document.removeEventListener('selectstart', blockSelectStart)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('copy', blockCopyImages)
    observer.disconnect()

    const overlay = document.getElementById('ss-protection-overlay')
    if (overlay) overlay.remove()
  }
}
