/**
 * Kleinste Typangabe für `node:fs` in Tests. Das Projekt führt kein
 * `@types/node`; der Vertragstest der Hausstatistik liest damit
 * `public/api/collect.php` (läuft unter vitest in Node).
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
  // Für den Wächter der Ersteinrichtung (setup-schalter.test.ts): alle PHP-Dateien unter public/api.
  export function readdirSync(
    path: string,
    options: { withFileTypes: true },
  ): Array<{ name: string; isDirectory(): boolean }>
}
