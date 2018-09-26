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


var isoConv = require('iso-language-converter');

clientId = '494272947788316672';

let mainWindow,
    WindowSettings = {
        backgroundColor: '#FFF',
        // width: 690,
        // height: 800,
        resizable: true,
        title: 'duolinGo',
        icon: __dirname + '/build/logo.ico',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    };


var tempCourseName = undefined;
var startTimestamp = undefined;

async function fetchActivity() {

    if (!rpc || !mainWindow) return;

    let infos = await mainWindow.webContents.executeJavaScript(
        `(function() {

            let [type, id] = window.location.pathname.split('/').slice(1, 3);

            let language = window.location.pathname.split('/').slice(2, 4);
            let course = window.location.pathname.split('/').slice(3, 5);

            if (type == 'skill') {
                return {
                    link: window.location.pathname,
                    language: window.location.pathname.split('/').slice(2, 3),
                    course: window.location.pathname.split('/').slice(3, 4),
                }
            }
        })()`
    );


    if (infos) { // if !infos don't change presence then.
        let {
            language,
            course,
            link
        } = infos;

        if (tempCourseName != course.toString()) {
            tempCourseName = course.toString();
            startTimestamp = new Date();
        }

        console.log(link, language, course);

        rpc.setActivity({
            details: isoConv(language.toString(), {from: 1, to: 'label'}),
            state: course.toString(),
            startTimestamp: startTimestamp,
            smallImageKey: language.toString(),
            largeImageKey: 'logo',
            largeImageText: 'Studying ' + isoConv(language.toString(), {from: 1, to: 'label'}),
        });
    }
}

// app ready
app.on('ready', () => {
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.setMenu(null);
    mainWindow.loadURL("http://www.duolingo.com/");
    //mainWindow.webContents.openDevTools();


    // setup event handler for when the site finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('::-webkit-scrollbar { width: 0px; height: 0px; background: transparent;}');
    });

    // login to discord
    rpc.login({
        clientId
    }).catch(console.error);

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