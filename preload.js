const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  browseVideoFile: () => {
    console.log('browseVideoFile called');
    return ipcRenderer.invoke('browse-video-file');
  },
  browseOutputFolder: () => {
    console.log('browseOutputFolder called');
    return ipcRenderer.invoke('browse-output-folder');
  },
  encodeVideo: (params) => {
    console.log('encodeVideo called', params);
    return ipcRenderer.invoke('encode-video', params);
  },
  onTerminalMessage: (callback) => {
    ipcRenderer.on('terminal-message', callback);
  }
});
