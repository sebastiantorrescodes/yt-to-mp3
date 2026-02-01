import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  downloadMedia: (url: string, format: 'mp3' | 'mp4') => ipcRenderer.invoke('download-media', url, format),
  onDownloadProgress: (callback: (progress: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: number): void => {
      callback(progress)
    }
    ipcRenderer.on('download-progress', handler)
    return () => ipcRenderer.removeListener('download-progress', handler)
  }
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
