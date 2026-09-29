const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cp = require('child_process');

let win;
const activeProcesses = new Map();
function createWindow() {
  win = new BrowserWindow({ width: 1440, height: 900, minWidth: 900, minHeight: 600, backgroundColor: '#111827', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } });
  win.loadFile(path.join(__dirname, 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('folder:open', async () => { const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] }); return r.canceled ? null : r.filePaths[0]; });
ipcMain.handle('file:read', (_, file) => fs.readFileSync(file, 'utf8'));
ipcMain.handle('file:write', (_, file, contents) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents, 'utf8'); return true; });
ipcMain.handle('fs:list', (_, dir) => fs.readdirSync(dir, { withFileTypes: true }).map(e => ({ name: e.name, path: path.join(dir, e.name), directory: e.isDirectory() })).sort((a,b) => (b.directory-a.directory) || a.name.localeCompare(b.name)));
ipcMain.handle('fs:mkdir', (_, dir, name) => { const p=path.join(dir,name); fs.mkdirSync(p); return p; });
ipcMain.handle('fs:rename', (_, oldPath, name) => { const p=path.join(path.dirname(oldPath),name); fs.renameSync(oldPath,p); return p; });
ipcMain.handle('fs:delete', (_, p) => { fs.rmSync(p,{recursive:true,force:true}); return true; });
ipcMain.handle('system:platform', () => process.platform);
ipcMain.handle('compiler:detect', (_, dir) => { const commands = process.platform === 'win32' ? ['node','python','gcc','g++','dotnet','javac','go'] : ['node','python3','gcc','g++','dotnet','javac','go']; return commands.map(command => { try { cp.execFileSync(process.platform==='win32'?'where':'which',[command],{stdio:'ignore'}); return command; } catch { return null; } }).filter(Boolean); });

ipcMain.handle('process:start', (_, id, command, cwd) => {
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
  const args = process.platform === 'win32' ? ['/d','/s','/c',command] : ['-lc',command];
  const child = cp.spawn(shell,args,{cwd,env:{...process.env,FORCE_COLOR:'1'}}); activeProcesses.set(id,child);
  child.stdout.on('data', d => win?.webContents.send('process:output',id,d.toString(), 'stdout'));
  child.stderr.on('data', d => win?.webContents.send('process:output',id,d.toString(), 'stderr'));
  child.on('close', code => { activeProcesses.delete(id); win?.webContents.send('process:exit',id,code); }); return true;
});
ipcMain.handle('process:input', (_,id,data) => { const p=activeProcesses.get(id); if(p) p.stdin.write(data); });
ipcMain.handle('process:stop', (_,id) => { const p=activeProcesses.get(id); if(p) p.kill(); });
