declare global {
    interface Window {
        electron: {
            ipcRenderer: any
        }
    }
}
export { };