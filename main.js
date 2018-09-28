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


const isoConv = require('iso-language-converter');

let clientId = '494272947788316672';

let mainWindow;

let WindowSettings = {
    backgroundColor: '#FFF',
    width: 1000,
    height: 800,
    resizable: true,
    title: 'duolinGo',
    icon: __dirname + '/build/logo.ico',
    webPreferences: {
        nodeIntegration: false,
        plugins: true,
    }
}


let tempCourseName = undefined;
let startTimestamp = undefined;

async function fetchActivity() {

    if (!rpc || !mainWindow) return;

    let infos = await mainWindow.webContents.executeJavaScript(
        `(function() {

            var splitUrl = window.location.pathname.split('/').slice(1);

            // TODO we can put in the check for fake languages here

            var language = splitUrl[1];
            var course = splitUrl[2] + "/" + splitUrl[3];

            if (splitUrl[0] == 'skill') {
                return {
                    language: language,
                    course: course,
                }
            } else {
                return {
                    language: 'nothing',
                }
            }
        })()`
    );


    if (infos) { // if !infos don't change presence then.
        let {
            language,
            course,
        } = infos;

        if (language == "nothing") {
            rpc.clearActivity();
            tempCourseName = undefined;
            return;
        }

        if (tempCourseName != course.toString()) {
            tempCourseName = course.toString();
            startTimestamp = new Date();
        }

        rpc.setActivity({
            details: isoConv(language.toString(), {
                from: 1,
                to: 'label'
            }),
            state: course.toString(),
            startTimestamp: startTimestamp,
            smallImageKey: language.toString(),
            largeImageKey: 'logo',
            largeImageText: 'Studying ' + isoConv(language.toString(), {
                from: 1,
                to: 'label'
            }),
        });
    }
}

// app ready
app.on('ready', () => {

    // setup main window
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.setMenu(null);
    mainWindow.loadURL("http://www.duolingo.com/");
    mainWindow.webContents.openDevTools();

    // login to discord
    rpc.login({
        clientId
    }).catch(console.error);

    // prevent window title update
    mainWindow.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });

    // setup event handler for when the site finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('::-webkit-scrollbar { width: 0px; height: 0px; background: transparent;}');
        fetchActivity();
    });

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
        app.quit();
        rpc.clearActivity();
    }
})