"use strict";

var _electron = require("electron");

var _electron2 = _interopRequireDefault(_electron);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _child_process = require("child_process");

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = _electron2.default.app;
var BrowserWindow = _electron2.default.BrowserWindow;

var Promise = require("bluebird");

process.env.NODE_PATH = _path2.default.join(__dirname, "node_modules");
process.env.RESOURCES_PATH = _path2.default.join(__dirname, "/../resources");
if (process.platform !== "win32") {
  process.env.PATH = "/usr/local/bin:" + process.env.PATH;
}
var exiting = false;
var size = {},
    settingsjson = {};
try {
  size = JSON.parse(_fs2.default.readFileSync(_path2.default.join(app.getPath("userData"), "size")));
} catch (err) {}

try {
  settingsjson = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, "settings.json"), "utf8"));
} catch (err) {}

app.on("ready", function () {
  var mainWindow = new BrowserWindow({
    width: size.width || 1080,
    height: size.height || 680,
    "min-width": _os2.default.platform() === "win32" ? 400 : 700,
    "min-height": _os2.default.platform() === "win32" ? 260 : 500,
    "standard-window": false,
    resizable: true,
    frame: false,
    backgroundColor: "#fff",
    show: false
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.openDevTools({ detach: true });
  }

  mainWindow.loadURL(_path2.default.normalize("file://" + _path2.default.join(__dirname, "index.html")));

  app.on("activate", function () {
    if (mainWindow) {
      mainWindow.show();
    }
    return false;
  });

  if (_os2.default.platform() === "win32" || _os2.default.platform() === "linux") {
    mainWindow.on("close", function (e) {
      mainWindow.webContents.send("application:quitting");
      if (!exiting) {
        Promise.delay(1000).then(function () {
          mainWindow.close();
        });
        exiting = true;
        e.preventDefault();
      }
    });

    app.on("window-all-closed", function () {
      app.quit();
    });
  } else if (_os2.default.platform() === "darwin") {
    app.on("before-quit", function () {
      mainWindow.webContents.send("application:quitting");
    });
  }

  mainWindow.webContents.on("new-window", function (e) {
    e.preventDefault();
  });

  mainWindow.webContents.on("will-navigate", function (e, url) {
    if (url.indexOf("build/index.html#") < 0) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on("did-finish-load", function () {
    mainWindow.setTitle("DockerGUI");
    mainWindow.show();
    mainWindow.focus();
  });
});
