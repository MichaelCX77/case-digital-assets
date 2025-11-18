import * as fs from 'fs';
import * as path from 'path';

// Accepted file extensions
const acceptedExtensions = ['.ts', '.env', '.yml', '.json'];
// Folders to exclude
const excludedFolders = ['dist', 'node_modules'];

/**
 * Checks if the file/folder name is in the excluded list.
 */
function isExcluded(name: string): boolean {
  return excludedFolders.includes(name);
}

/**
 * Checks if the file has one of the allowed extensions.
 */
function isAllowedFile(file: string): boolean {
  return acceptedExtensions.some(ext => file.endsWith(ext));
}

/**
 * Recursively builds and prints the visual tree of allowed files/folders.
 * @param dir Directory path to walk.
 * @param prefix Prefix for printing indentation/tree characters.
 */
function printTree(dir: string, prefix = ''): void {
  // Read directory contents, sort folders first, then files
  let items = fs.readdirSync(dir, { withFileTypes: true })
    .filter(item => !isExcluded(item.name));

  const folders = items.filter(item => item.isDirectory());
  const files = items.filter(item => item.isFile() && isAllowedFile(item.name));

  // Combine folders and files in order
  items = [...folders, ...files];

  items.forEach((item, index) => {
    const connector = (index === items.length - 1) ? '└── ' : '├── ';
    const newPrefix = prefix + (index === items.length - 1 ? '    ' : '│   ');

    if (item.isDirectory()) {
      console.log(prefix + connector + item.name + '/');
      printTree(path.join(dir, item.name), newPrefix);
    } else {
      console.log(prefix + connector + item.name);
    }
  });
}

// Entry point
const rootPath = process.argv[2] || '.';
console.log(rootPath + '/');
printTree(rootPath);