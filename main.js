const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const RPC = require('discord-rpc');

const clientId = '1251914969948229714'; 
RPC.register(clientId);

const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  rpc.setActivity({
    state: 'Encode Videos',
    startTimestamp: new Date(),
    largeImageKey: 'app_icon', 
    largeImageText: 'Vidsencoder 2.0.0'
  });

  console.log('Rich Presence is active');
});

rpc.login({ clientId }).catch(console.error);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 585,
    height: 480,
    icon: path.join(__dirname, 'assets', 'app.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    },
  });

  mainWindow.loadFile('index.html');
}

function createSuccessWindow() {
  const successWindow = new BrowserWindow({
    width: 300,
    height: 200,
    modal: true,
    parent: BrowserWindow.getFocusedWindow(),
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  successWindow.loadFile('success.html');
  successWindow.setAlwaysOnTop(true); 
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  rpc.destroy(); 
});

ipcMain.handle('browse-video-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Video File', extensions: ['mp4', 'mkv', 'mov'] }],
  });
  return result.filePaths[0];
});

ipcMain.handle('browse-output-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths[0];
});

ipcMain.handle('encode-video', async (event, { inputPath, outputPath, videoName, encoder, format, resolution }) => {
  const outputFile = path.join(outputPath, `${videoName}.${format}`);
  const resolutionCommand = resolution !== 'Keep' ? `-vf "scale=${resolution}:flags=lanczos"` : '';
  const encoderCommand = {
    'x264': '-c:v libx264 -b:v 35M -g 120 -keyint_min 120 -sc_threshold 0 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -profile:v high -bf 2 -b_strategy 2',
    'x265': '-c:v libx265 -b:v 30M -g 120 -keyint_min 120 -sc_threshold 0 -pix_fmt yuv420p10le -color_primaries bt709 -color_trc bt709 -colorspace bt709 -rc:v cbr',
    'ProRes': '-c:v prores_ks -profile:v 4 -vendor apl0 -bits_per_mb 8000 -pix_fmt yuva444p10le',
    'FFV1': '-c:v ffv1 -coder 2 -context 1 -level 3 -slices 12 -g 1',
    'AV1': '-c:v libsvtav1 -b:v 30M -g 120 -keyint_min 120 -sc_threshold 0 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -rc:v cbr',
  }[encoder];

  const ffmpegCommand = `"${ffmpeg}" -hide_banner -y -i "${inputPath}" ${resolutionCommand} ${encoderCommand} "${outputFile}"`;

  return new Promise((resolve, reject) => {
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        event.sender.send('terminal-message', `Error : ${error.message}`);
        reject(error.message);
        return;
      }
      event.sender.send('terminal-message', `Success : ${stdout || stderr}`);
      createSuccessWindow(); 
      resolve(stdout || stderr);
    });
  });
});
