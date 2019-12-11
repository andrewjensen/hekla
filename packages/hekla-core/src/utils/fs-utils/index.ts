import fs from 'fs';
import glob from 'glob';

interface GetProjectFilesOptions {
  ignorePatterns?: string[],
  globPattern?: string
}

const defaultOptions = {
  ignorePatterns: [],
  globPattern: '**'
};
export function getProjectFiles(rootPath: string, options: GetProjectFilesOptions): Promise<string[]> {
  const combinedOptions = { ...defaultOptions, ...options };
  return new Promise((resolve, reject) => {
    const globOptions = {
      cwd: rootPath,
      ignore: combinedOptions.ignorePatterns,
      absolute: true,
      nodir: true
    };
    glob(combinedOptions.globPattern, globOptions, (err, files) => {
      if (err) return reject(err);

      resolve(files);
    });
  });
}


export function getFileExists(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) return reject(err);

      resolve(stats.isFile());
    });
  });
}

export function getFileContents(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, contents) => {
      if (err) return reject(err);

      resolve(contents);
    });
  });
}

export function writeJSON(data: any, filePath: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);

      resolve();
    });
  })
}

export function getModuleName(resource: string, rootPath: string): string {
  if (!rootPath) {
    throw new Error('rootPath not specified');
  }
  let fullPath = resource;
  if (fullPath.indexOf('!') !== -1) {
    const pieces = resource.split('!');
    fullPath = pieces[pieces.length - 1];
  }
  const projectPath = fullPath.replace(rootPath, '');
  return `.${projectPath}`;
}

export function getModuleShortName(moduleName: string): string {
  const pathPieces = moduleName.split('/');
  const filename = pathPieces[pathPieces.length - 1];
  const directory = pathPieces[pathPieces.length - 2];

  const filePieces = filename.split('.');
  const filenameNoExt = filePieces[0];

  if (['index', 'app'].includes(filenameNoExt)) {
    return `${directory}/${filename}`;
  } else {
    return filename;
  }
}
