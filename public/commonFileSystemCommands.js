let fileSystem = {
    '/': {
      'home': {
        'projects': {},
        'documents': {},
        'README.md': 'hola comoestas.',
        '.hidden_file': 'This is a hidden file.'
      }
    }
  };
  
  let currentDirectory = '/';
  
function updatePrompt() {
    promptElement.textContent = `:) ${currentDirectory}$`;
}
  
function getFullPath(path) {
    if (path.startsWith('/')) return path;
    return `${currentDirectory}${currentDirectory === '/' ? '' : '/'}${path}`;
}
  
function getParentDirectory(path) {
    return path.split('/').slice(0, -1).join('/') || '/';
}
  
function getDirectoryFromPath(path) {
    let current = fileSystem;
    const parts = path.split('/').filter(Boolean);
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    return current;
}
  
function ls(args) {
    let path = currentDirectory;
    if (args[0] && args[0] !== '-a') {
      path = getFullPath(args[0]);
    }
  
    let dir = getDirectoryFromPath(path);
    
    if (!dir) {
      return `Directory not found: ${path}`;
    }
  
    const showHidden = args.includes('-a');
    
    let files = Object.keys(dir);
    if (!showHidden) {
      files = files.filter(item => !item.startsWith('.'));
    }
    
    const lsContainer = document.createElement('div');
    lsContainer.className = 'ls-container';
    lsContainer.style.display = 'grid';
    lsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    lsContainer.style.gap = '15px';
    lsContainer.style.padding = '20px';
    lsContainer.style.background = '#f8f9fa';
    lsContainer.style.borderRadius = '10px';
    lsContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
    files.forEach(file => {
      const fileElement = document.createElement('div');
      fileElement.className = 'file-item';
      fileElement.style.padding = '12px';
      fileElement.style.background = '#ffffff';
      fileElement.style.borderRadius = '8px';
      fileElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      fileElement.style.cursor = 'pointer';
      fileElement.style.transition = 'all 0.3s ease';
      fileElement.style.display = 'flex';
      fileElement.style.alignItems = 'center';
  
      const icon = document.createElement('i');
      icon.className = typeof dir[file] === 'object' ? 'fas fa-folder' : 'fas fa-file';
      icon.style.marginRight = '10px';
      icon.style.fontSize = '18px';
      icon.style.color = typeof dir[file] === 'object' ? '#4A90E2' : '#6C757D';
  
      const fileName = document.createElement('span');
      fileName.textContent = file;
      fileName.style.color = file.startsWith('.') ? '#ADB5BD' : '#212529';
      fileName.style.fontFamily = 'Inter, sans-serif';
      fileName.style.fontSize = '14px';
      fileName.style.fontWeight = '500';
      fileName.style.whiteSpace = 'nowrap';
      fileName.style.overflow = 'hidden';
      fileName.style.textOverflow = 'ellipsis';
  
      fileElement.appendChild(icon);
      fileElement.appendChild(fileName);
  
      fileElement.addEventListener('mouseover', () => {
        fileElement.style.transform = 'translateY(-2px)';
        fileElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      });
  
      fileElement.addEventListener('mouseout', () => {
        fileElement.style.transform = 'translateY(0)';
        fileElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      });
  
      fileElement.addEventListener('click', () => {
        if (typeof dir[file] === 'object') {
          cd([file]);
          ls([]);
        } else {
          cat([file]);
        }
      });
  
      lsContainer.appendChild(fileElement);
    });
  
    if (showHidden) {
      const hiddenMessage = document.createElement('div');
      hiddenMessage.style.gridColumn = '1 / -1';
      hiddenMessage.style.marginTop = '20px';
      hiddenMessage.style.padding = '15px';
      hiddenMessage.style.background = '#E9ECEF';
      hiddenMessage.style.borderRadius = '8px';
      hiddenMessage.style.fontFamily = 'Inter, sans-serif';
      hiddenMessage.style.fontSize = '14px';
      hiddenMessage.style.color = '#495057';
      hiddenMessage.style.textAlign = 'center';
      hiddenMessage.style.position = 'relative';
      hiddenMessage.style.overflow = 'hidden';
  
      const messageContent = document.createElement('div');
      messageContent.innerHTML = `
        <p style="font-weight: 600; margin-bottom: 5px;">Hidden Files Revealed</p>
        <p style="margin: 0;">You've uncovered the concealed contents of this directory.
          
          Howevs, 
          
          I hate to make you disappointed but there is nothing here. I like where your mind is at though.
          ;)
          </p>
      `;
  
      const underline = document.createElement('div');
      underline.style.position = 'absolute';
      underline.style.bottom = '0';
      underline.style.left = '0';
      underline.style.width = '0';
      underline.style.height = '2px';
      underline.style.background = 'linear-gradient(90deg, #4A90E2, #50E3C2)';
      underline.style.transition = 'width 1s ease';
  
      hiddenMessage.appendChild(messageContent);
      hiddenMessage.appendChild(underline);
  
      // Animate the underline
      setTimeout(() => {
        underline.style.width = '100%';
      }, 100);
  
      lsContainer.appendChild(hiddenMessage);
    }
  
    return lsContainer.outerHTML;
}


function cd(args) {
    if (!args[0] || args[0] === '~') {
      currentDirectory = '/home';
    } else if (args[0] === '..') {
      currentDirectory = getParentDirectory(currentDirectory);
    } else {
      const newPath = getFullPath(args[0]);
      const dir = getDirectoryFromPath(newPath);
      if (dir) {
        currentDirectory = newPath;
      } else {
        return 'Directory not found';
      }
    }
    updatePrompt();
    return `Changed to ${currentDirectory}`;
}


function pwd() {
    return currentDirectory;
}


function mkdir(args) {
    if (!args[0]) return 'Usage: mkdir <directory>';
    const newPath = getFullPath(args[0]);
    const parentPath = getParentDirectory(newPath);
    const dirName = newPath.split('/').pop();
    const parentDir = getDirectoryFromPath(parentPath);
    if (!parentDir) return 'Parent directory not found';
    if (parentDir[dirName]) return 'Directory already exists';
    parentDir[dirName] = {};
    return `Created directory ${newPath}`;
}


function rmdir(args) {
    if (!args[0]) return 'Usage: rmdir <directory>';
    const path = getFullPath(args[0]);
    const parentPath = getParentDirectory(path);
    const dirName = path.split('/').pop();
    const parentDir = getDirectoryFromPath(parentPath);
    if (!parentDir || !parentDir[dirName]) return 'Directory not found';
    if (Object.keys(parentDir[dirName]).length > 0) return 'Directory not empty';
    delete parentDir[dirName];
    return `Removed directory ${path}`;
}


function touch(args) {
    if (!args[0]) return 'Usage: touch <file>';
    const path = getFullPath(args[0]);
    const parentPath = getParentDirectory(path);
    const fileName = path.split('/').pop();
    const parentDir = getDirectoryFromPath(parentPath);
    if (!parentDir) return 'Parent directory not found';
    if (parentDir[fileName]) return 'File already exists';
    parentDir[fileName] = '';
    return `Created file ${path}`;
}


function rm(args) {
    if (!args[0]) return 'Usage: rm <file>';
    const path = getFullPath(args[0]);
    const parentPath = getParentDirectory(path);
    const fileName = path.split('/').pop();
    const parentDir = getDirectoryFromPath(parentPath);
    if (!parentDir || !parentDir[fileName]) return 'File not found';
    if (typeof parentDir[fileName] !== 'string') return 'Cannot remove: Is a directory';
    delete parentDir[fileName];
    return `Removed file ${path}`;
}


function cat(args) {
    if (!args[0]) return 'Usage: cat <file>';
    const path = getFullPath(args[0]);
    const parentPath = getParentDirectory(path);
    const fileName = path.split('/').pop();
    const parentDir = getDirectoryFromPath(parentPath);
    if (!parentDir || !parentDir[fileName]) return 'File not found';
    if (typeof parentDir[fileName] !== 'string') return 'Cannot display: Is a directory';
    return parentDir[fileName] || '(empty file)';
}
