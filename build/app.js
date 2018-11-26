'use strict';

require('babel-polyfill');

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MetricsUtil = require('./utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _menutemplate = require('./menutemplate');

var _menutemplate2 = _interopRequireDefault(_menutemplate);

var _WebUtil = require('./utils/WebUtil');

var _WebUtil2 = _interopRequireDefault(_WebUtil);

var _HubUtil = require('./utils/HubUtil');

var _HubUtil2 = _interopRequireDefault(_HubUtil);

var _SetupUtil = require('./utils/SetupUtil');

var _SetupUtil2 = _interopRequireDefault(_SetupUtil);

var _DockerUtil = require('./utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _RepositoryActions = require('./actions/RepositoryActions');

var _RepositoryActions2 = _interopRequireDefault(_RepositoryActions);

var _DockerMachineUtil = require('./utils/DockerMachineUtil');

var _DockerMachineUtil2 = _interopRequireDefault(_DockerMachineUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require.main.paths.splice(0, 0, process.env.NODE_PATH);

var remote = _electron2.default.remote;
var Menu = remote.Menu;
// ipcRenderer is used as we're in the process
var ipcRenderer = _electron2.default.ipcRenderer;

_HubUtil2.default.init();

if (_HubUtil2.default.loggedin()) {
  _RepositoryActions2.default.repos();
}

_RepositoryActions2.default.recommended();

_WebUtil2.default.addWindowSizeSaving();
_WebUtil2.default.addLiveReload();
_WebUtil2.default.addBugReporting();
_WebUtil2.default.disableGlobalBackspace();

Menu.setApplicationMenu(Menu.buildFromTemplate((0, _menutemplate2.default)()));

_MetricsUtil2.default.track('Started App');
_MetricsUtil2.default.track('app heartbeat');
setInterval(function () {
  _MetricsUtil2.default.track('app heartbeat');
}, 14400000);

var router = _reactRouter2.default.create({
  routes: _routes2.default
});
router.run(function (Handler) {
  return _react2.default.render(_react2.default.createElement(Handler, null), document.body);
});
_router2.default.set(router);

_SetupUtil2.default.setup().then(function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate((0, _menutemplate2.default)()));
  _DockerUtil2.default.init();
  if (!_HubUtil2.default.prompted() && !_HubUtil2.default.loggedin()) {
    router.transitionTo('login');
  } else {
    router.transitionTo('search');
  }
}).catch(function (err) {
  _MetricsUtil2.default.track('Setup Failed', {
    step: 'catch',
    message: err.message
  });
  throw err;
});

ipcRenderer.on('application:quitting', function () {
  _DockerUtil2.default.detachEvent();
  if (localStorage.getItem('settings.closeVMOnQuit') === 'true') {
    _DockerMachineUtil2.default.stop();
  }
});

window.onbeforeunload = function () {
  _DockerUtil2.default.detachEvent();
};
