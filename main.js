const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const dialog = require('electron').remote;

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

//Listen for the app to be ready

app.on('ready', function () {
    //create new window
    mainWindow = new BrowserWindow(
        {
            webPreferences: { nodeIntegration: true },
            frame : false
        }
    );
    
    //load html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //Quit app when closed
    mainWindow.on('closed', function () {
        app.quit()
        });

    mainWindow.on('resize', function(){                                                                     // save this for later
        //mainWindow.webContents.send('window:resize', mainWindow.getSize()[0], mainWindow.getSize()[1]);
    })
    
});

// add window 
// function createAddWindow() {
//     //create new window
//     addWindow = new BrowserWindow({
//         width: 300,
//         height: 200,
//         title: 'Add Shopping List Item',
//         webPreferences: { nodeIntegration: true }
//     });
//     //load html file into the window
//     addWindow.loadURL(url.format({
//         pathname: path.join(__dirname, 'addWindow.html'),
//         protocol: 'file',
//         slashes: true
//     }));
//     //garbage collection/optimization
//     addWindow.on('closed', function () {
//         addWindow = null;
//     })
// }

ipcMain.on('maximize', function(){
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
})

ipcMain.on('minimize', function(){
    mainWindow.minimize();
})

ipcMain.on('close', function(){
    mainWindow.close();
})


//Create menu template

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open File',
                click(){
                    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, function (files) {
                        if (files !== undefined) {
                            console.log(files);
                        }
                    });
                }
            },
            {
                label: 'Add Item',
                click() {
                    createAddWindow()
                }
            },
            {
                label: 'clear items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',

                accelerator: process.platform == 'win32' ? 'Command+Q' : 'Ctrl+Q',   // accelerator is used for key events

                click() {             // add click event
                    app.quit();
                }
            }
        ]
    }
];

//if mac then add an empty object to menu
if (process.platform === 'darwin')
    mainMenuTemplate.unshift({}); // insert an element at the begining of the array

if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle',

                accelerator: "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: 'Relaod',

                accelerator: "Ctrl+R",
                click(item, focusedWindow) {
                    focusedWindow.reload();
                }       // adds a reload button and shortcut automatically
            }
        ]
    });
}
