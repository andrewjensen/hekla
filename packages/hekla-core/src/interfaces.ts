import { SyncHook, AsyncSeriesHook } from 'tapable';
import Module from './Module';

export interface IHeklaConfig {
  rootPath: string
  outputPath?: string
  exclude?: string[]
  plugins?: IHeklaPlugin[]
}

export interface IHeklaPlugin {
  apply: (analyzer: IAnalyzer) => void
}

export interface IAnalyzer {
  hooks: IAnalyzerHooks
  processModule: (module: Module) => Promise<void>
}

export interface IAnalyzerHooks {
  moduleRawSource: SyncHook
  moduleSyntaxTreeJS: SyncHook
  moduleSyntaxTreeHTML: SyncHook
  statusUpdate: SyncHook
  reporter: AsyncSeriesHook
}

export interface IAnalysis {

}

export type ReadFileCallback = (err: null | Error, buffer?: Buffer) => void

export interface IFilesystem {
  readFile: (filename: string, callback: ReadFileCallback) => void
}
