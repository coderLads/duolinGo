const {
    app,
    BrowserWindow
} = require('electron')

let mainWindow

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 690,
        height: 800,
        title: "duolinGo",
    })

    // remove meus
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}
app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})