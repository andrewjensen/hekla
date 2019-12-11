declare module 'sticky-terminal-display' {

  export default class StickyTerminalDisplay {
    getLineRenderer: () => LineRenderer
  }

  export class LineRenderer {
    write: (message: string) => void
  }
}
