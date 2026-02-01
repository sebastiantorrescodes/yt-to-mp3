import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import YTDlpWrapModule from 'yt-dlp-wrap'
// Handle both ESM and CJS module exports
const YTDlpWrap = (YTDlpWrapModule as { default?: typeof YTDlpWrapModule }).default || YTDlpWrapModule
import { existsSync, unlinkSync } from 'fs'

// Get the path to yt-dlp binary
function getYtDlpPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'resources', 'bin', 'yt-dlp.exe')
  }
  return join(process.resourcesPath, 'bin', 'yt-dlp.exe')
}

// Get the path to ffmpeg binary
function getFfmpegPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'resources', 'bin', 'ffmpeg.exe')
  }
  return join(process.resourcesPath, 'bin', 'ffmpeg.exe')
}

let ytDlp: InstanceType<typeof YTDlpWrap> | null = null

function initYtDlp(): void {
  const ytDlpPath = getYtDlpPath()
  if (existsSync(ytDlpPath)) {
    ytDlp = new YTDlpWrap(ytDlpPath)
  } else {
    console.error('yt-dlp.exe not found at:', ytDlpPath)
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize yt-dlp
  initYtDlp()

  // IPC: Get video info
  ipcMain.handle('get-video-info', async (_event, url: string) => {
    if (!ytDlp) {
      throw new Error('yt-dlp not initialized. Make sure yt-dlp.exe is in resources/bin/')
    }
    try {
      const info = await ytDlp.getVideoInfo(url)
      return {
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
        uploader: info.uploader
      }
    } catch (error) {
      throw new Error(`Failed to get video info: ${error}`)
    }
  })

  // IPC: Download media (MP3 or MP4)
  ipcMain.handle('download-media', async (event, url: string, format: 'mp3' | 'mp4') => {
    if (!ytDlp) {
      throw new Error('yt-dlp not initialized')
    }

    const ffmpegPath = getFfmpegPath()
    if (!existsSync(ffmpegPath)) {
      throw new Error('ffmpeg.exe not found. Make sure ffmpeg.exe is in resources/bin/')
    }

    const isAudio = format === 'mp3'
    const ext = isAudio ? 'mp3' : 'mp4'

    // Show save dialog
    const result = await dialog.showSaveDialog({
      title: `Save ${ext.toUpperCase()}`,
      defaultPath: `video.${ext}`,
      filters: [{ name: isAudio ? 'MP3 Audio' : 'MP4 Video', extensions: [ext] }]
    })

    if (result.canceled || !result.filePath) {
      return { canceled: true }
    }

    const outputPath = result.filePath
    const tempPath = outputPath.replace(`.${ext}`, `.temp.${ext}`)

    try {
      // Send progress updates to renderer
      const sendProgress = (progress: number): void => {
        event.sender.send('download-progress', progress)
      }

      sendProgress(0)

      const args = isAudio
        ? [url, '-x', '--audio-format', 'mp3', '--audio-quality', '0', '--ffmpeg-location', ffmpegPath, '-o', tempPath, '--no-playlist']
        : [url, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '--merge-output-format', 'mp4', '--ffmpeg-location', ffmpegPath, '-o', tempPath, '--no-playlist']

      await new Promise<void>((resolve, reject) => {
        const process = ytDlp!.exec(args)

        let lastProgress = 0

        process.on('progress', (progress) => {
          if (progress.percent && progress.percent > lastProgress) {
            lastProgress = progress.percent
            sendProgress(Math.round(progress.percent))
          }
        })

        process.on('close', () => {
          resolve()
        })

        process.on('error', (error) => {
          reject(error)
        })
      })

      // Rename temp file to final
      if (existsSync(tempPath)) {
        const { renameSync } = await import('fs')
        renameSync(tempPath, outputPath)
      }

      sendProgress(100)
      return { success: true, filePath: outputPath }
    } catch (error) {
      // Clean up temp file on error
      if (existsSync(tempPath)) {
        unlinkSync(tempPath)
      }
      throw new Error(`Download failed: ${error}`)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
