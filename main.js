const { ipcMain, app, dialog, BrowserWindow } = require('electron')
const electronPrompt = require('electron-prompt')
var fs = require('fs')

const path = require('path')
const env = process.env.NODE_ENV || 'development'

// If development environment

if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "favicon.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadFile('index.html')
    win.setMenuBarVisibility(false)
}


app.whenReady().then(createWindow)
  
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their 
    // menu bar to stay active until the user quits 
    // explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
  
app.on('activate', () => {
    // On macOS it's common to re-create a window in the 
    // app when the dock icon is clicked and there are no 
    // other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('rename', (event, arg) => {
    electronPrompt({
        title: 'New name',
        label: 'Rename node: '+arg.data,
        type: 'input'
    }).then(name => {
        if(name){
            event.sender.send('renamed', {data: name })
        }
    })
})

ipcMain.on('save', (event, arg) => {
    var options = {
        title: "Save file",
        defaultPath : "my_filename",
        buttonLabel : "Save",

        filters :[
            {name: 'fsm', extensions: ['fsm']},
            {name: 'All Files', extensions: ['*']}
        ]
    };

    dialog.showSaveDialog(null, options).then(({ filePath, canceled }) => {
        if(!canceled){
            fs.writeFileSync(filePath, arg.data, 'utf-8');
        }
    });
});

ipcMain.on('load', (event, arg) => {
    var options = {
        title: "Load file",
        defaultPath : "my_filename",
        buttonLabel : "Load",
        multiSelections: false,

        filters :[
            {name: 'fsm', extensions: ['fsm']},
            {name: 'All Files', extensions: ['*']}
        ]
    };

    dialog.showOpenDialog(null, options).then(({filePaths, canceled}) => {
        if(!canceled){
            var res = fs.readFileSync(filePaths[0]).toString();
            event.sender.send('load-response', {data: res, canceled});
        } else {
            event.sender.send('load-response', {data: "", canceled});
        }
    });
});