const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut
} = require('electron');

const {Client} = require('discord-rpc');
const rpc      = new Client({transport: 'ipc'});

clientId = '494272947788316672';

let mainWindow,
    WindowSettings = {
        backgroundColor: '#FFF',
        useContentSize: false,
       // autoHideMenuBar: false,
        resizable: true,
        center: true,
        frame: true,
        alwaysOnTop: false,
        title: 'duolinGo',
        icon: __dirname + '/build/logo.ico',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    },
    login = (tries = 0) => {
        rpc.login({ clientId }).catch(console.error);
    },
    getInfos = `(function() {
        
        if (true) {
            return {
                songName: 'uyeee',
            }
        }

    })()`;

async function checkSoundCloud() {

    // rpc.setActivity({
    //     details: 'ye',
    //     state: 'some weeb stuff'
    // });
    
    if (!rpc || !mainWindow) return;
    

    let infos = await mainWindow.webContents.executeJavaScript(getInfos);
    

    if (infos) { // if !infos don't change presence then.
        let {songName, author, length, timePassed} = infos;

        rpc.setActivity({
            details: songName,
        });
    }
}

app.on('ready', () => {
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.maximize();
    mainWindow.loadURL("http://www.duolingo.com/");
    mainWindow.webContents.openDevTools();
    
    login();
});

rpc.on('ready', () => {
    checkSoundCloud();
    setInterval(() => {
        checkSoundCloud();
    }, 5E3);
});

// handle quit
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
