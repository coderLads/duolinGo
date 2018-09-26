const {
    app,
    BrowserWindow,
} = require('electron');

const {
    Client
} = require('discord-rpc');

const rpc = new Client({
    transport: 'ipc'
});

clientId = '494272947788316672';

let mainWindow,
    WindowSettings = {
        backgroundColor: '#FFF',
        width: 690,
        height: 800,
        resizable: true,
        title: 'duolinGo',
        icon: __dirname + '/build/logo.ico',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    },
    login = (tries = 0) => {
        rpc.login({
            clientId
        }).catch(console.error);
    };

async function fetchActivity() {

    if (!rpc || !mainWindow) return;

    let infos = await mainWindow.webContents.executeJavaScript(
        `(function() {
            if (true) {
                return {
                    activity: 'uyeee',
                }
            }
        })()`
    );


    if (infos) { // if !infos don't change presence then.
        let {
            activity,
            author,
            length,
            timePassed
        } = infos;

        rpc.setActivity({
            details: activity,
        });
    }
}

// app ready
app.on('ready', () => {
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.setMenu(null);
    mainWindow.loadURL("http://www.duolingo.com/");
    mainWindow.webContents.openDevTools();

    // setup event handler for when the site finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('::-webkit-scrollbar { width: 0px; height: 0px; background: transparent;}');
    });

    login();


});

// rpc ready
rpc.on('ready', () => {
    fetchActivity();
    setInterval(() => {
        fetchActivity();
    }, 5E3);
});

// handle quit
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})