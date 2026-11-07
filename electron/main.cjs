const { app, BrowserWindow, utilityProcess, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow = null;
let serverProcess = null;

// Enforce single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Start the Express Excel backend server automatically.
 */
function startBackendServer() {
  const serverPath = path.join(__dirname, '..', 'server', 'dist', 'index.js');
  console.log('[Electron] Starting background Excel server from:', serverPath);

  try {
    // In Electron, utilityProcess runs Node scripts inside Electron's own runtime without needing external Node.js!
    if (utilityProcess && typeof utilityProcess.fork === 'function') {
      serverProcess = utilityProcess.fork(serverPath, [], {
        env: {
          ...process.env,
          PORT: '3001',
          NODE_ENV: isDev ? 'development' : 'production',
        },
      });

      serverProcess.on('exit', (code) => {
        console.log(`[Electron] Background server exited with code ${code}`);
      });
    } else {
      // Fallback to child_process.spawn
      serverProcess = spawn(process.execPath, [serverPath], {
        env: {
          ...process.env,
          PORT: '3001',
          ELECTRON_RUN_AS_NODE: '1',
        },
        stdio: 'ignore',
      });
    }
  } catch (err) {
    console.error('[Electron] Failed to start backend server:', err);
  }
}

/**
 * Wait until the backend server is accepting HTTP connections on port 3001.
 */
function waitForBackend(callback, maxAttempts = 30) {
  let attempts = 0;
  const check = () => {
    attempts++;
    const req = http.get('http://localhost:3001/api/sync/health', (res) => {
      if (res.statusCode === 200) {
        console.log('[Electron] Backend server is online and ready ✓');
        callback(true);
      } else if (attempts < maxAttempts) {
        setTimeout(check, 300);
      } else {
        callback(false);
      }
    });

    req.on('error', () => {
      if (attempts < maxAttempts) {
        setTimeout(check, 300);
      } else {
        callback(false);
      }
    });

    req.end();
  };

  check();
}

/**
 * Create the main desktop window.
 */
function createWindow() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '..', 'build', 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Andrology & Fertility Clinic - Clinical Reporting System',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      plugins: true,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle print dialog directly without broken Chrome preview
ipcMain.handle('print-report', async (event, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false, error: 'No window found' };

  return new Promise((resolve) => {
    win.webContents.print(
      {
        silent: false,
        printBackground: true,
        pageSize: 'Letter',
        color: true,
        margins: {
          marginType: 'none',
        },
        ...options,
      },
      (success, failureReason) => {
        resolve({ success, error: failureReason });
      }
    );
  });
});

// App lifecycle
app.whenReady().then(() => {
  // 1. Start the backend server automatically
  startBackendServer();

  // 2. Once backend is ready, open the window
  waitForBackend(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean shutdown: terminate backend server when desktop app quits
app.on('before-quit', () => {
  if (serverProcess) {
    console.log('[Electron] Shutting down background server...');
    try {
      if (typeof serverProcess.kill === 'function') {
        serverProcess.kill();
      }
    } catch (e) {
      // Ignore
    }
    serverProcess = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

