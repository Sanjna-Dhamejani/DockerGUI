'use strict';

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _Util = require('./utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _MetricsUtil = require('./utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _DockerMachineUtil = require('./utils/DockerMachineUtil');

var _DockerMachineUtil2 = _interopRequireDefault(_DockerMachineUtil);

var _DockerUtil = require('./utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;


var app = remote.app;
var window = remote.getCurrentWindow();

// main.js
var MenuTemplate = function MenuTemplate() {
  return [{
    label: 'Kitematic',
    submenu: [{
      label: 'About Kitematic',
      enabled: !!_DockerUtil2.default.host,
      click: function click() {
        _MetricsUtil2.default.track('Opened About', {
          from: 'menu'
        });
        _router2.default.get().transitionTo('about');
        if (window.isMinimized()) {
          window.restore();
        }
      }
    }, {
      type: 'separator'
    }, {
      label: 'Preferences',
      accelerator: _Util2.default.CommandOrCtrl() + '+,',
      enabled: !!_DockerUtil2.default.host,
      click: function click() {
        _MetricsUtil2.default.track('Opened Preferences', {
          from: 'menu'
        });
        _router2.default.get().transitionTo('preferences');
        if (window.isMinimized()) {
          window.restore();
        }
      }
    }, {
      type: 'separator'
    }, {
      type: 'separator'
    }, {
      label: 'Hide Kitematic',
      accelerator: _Util2.default.CommandOrCtrl() + '+H',
      selector: 'hide:'
    }, {
      label: 'Hide Others',
      accelerator: _Util2.default.CommandOrCtrl() + '+Alt+H',
      selector: 'hideOtherApplications:'
    }, {
      label: 'Show All',
      selector: 'unhideAllApplications:'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: _Util2.default.CommandOrCtrl() + '+Q',
      click: function click() {
        app.quit();
      }
    }]
  }, {
    label: 'File',
    submenu: [{
      type: 'separator'
    }, {
      label: 'Open Docker Command Line Terminal',
      accelerator: _Util2.default.CommandOrCtrl() + '+Shift+T',
      enabled: !!_DockerUtil2.default.host,
      click: function click() {
        _MetricsUtil2.default.track('Opened Docker Terminal', {
          from: 'menu'
        });
        _DockerMachineUtil2.default.dockerTerminal();
      }
    }]
  }, {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: _Util2.default.CommandOrCtrl() + '+Z',
      selector: 'undo:'
    }, {
      label: 'Redo',
      accelerator: 'Shift+' + _Util2.default.CommandOrCtrl() + '+Z',
      selector: 'redo:'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: _Util2.default.CommandOrCtrl() + '+X',
      selector: 'cut:'
    }, {
      label: 'Copy',
      accelerator: _Util2.default.CommandOrCtrl() + '+C',
      selector: 'copy:'
    }, {
      label: 'Paste',
      accelerator: _Util2.default.CommandOrCtrl() + '+V',
      selector: 'paste:'
    }, {
      label: 'Select All',
      accelerator: _Util2.default.CommandOrCtrl() + '+A',
      selector: 'selectAll:'
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Refresh Container List',
      accelerator: _Util2.default.CommandOrCtrl() + '+R',
      enabled: !!_DockerUtil2.default.host,
      click: function click() {
        _MetricsUtil2.default.track('Refreshed Container List', {
          from: 'menu'
        });
        _DockerUtil2.default.fetchAllContainers();
      }
    }, {
      label: 'Toggle Chromium Developer Tools',
      accelerator: 'Alt+' + _Util2.default.CommandOrCtrl() + '+I',
      click: function click() {
        remote.getCurrentWindow().toggleDevTools();
      }
    }]
  }, {
    label: 'Window',
    submenu: [{
      label: 'Minimize',
      accelerator: _Util2.default.CommandOrCtrl() + '+M',
      selector: 'performMiniaturize:'
    }, {
      label: 'Close',
      accelerator: _Util2.default.CommandOrCtrl() + '+W',
      click: function click() {
        remote.getCurrentWindow().hide();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Bring All to Front',
      selector: 'arrangeInFront:'
    }, {
      type: 'separator'
    }, {
      label: 'Kitematic',
      accelerator: 'Cmd+0',
      click: function click() {
        remote.getCurrentWindow().show();
      }
    }]
  }, {
    label: 'Help',
    submenu: [{
      label: 'Report Issue or Suggest Feedback',
      click: function click() {
        _MetricsUtil2.default.track('Opened Issue Reporter', {
          from: 'menu'
        });
        _electron.shell.openExternal('https://github.com/kitematic/kitematic/issues/new');
      }
    }]
  }];
};

module.exports = MenuTemplate;
