const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, func) {
      console.log("on", channel);
      return new Promise((resolve) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      })
    },
    invoke(...args) {
      return ipcRenderer.invoke(...args);
    }
  },
});