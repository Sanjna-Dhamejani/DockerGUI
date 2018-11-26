'use strict';

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _mixpanel = require('mixpanel');

var _mixpanel2 = _interopRequireDefault(_mixpanel);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _osxRelease = require('osx-release');

var _osxRelease2 = _interopRequireDefault(_osxRelease);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings;

try {
  settings = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '..', 'settings.json'), 'utf8'));
} catch (err) {
  settings = {};
}

var token = process.env.NODE_ENV === 'development' ? settings['mixpanel-dev'] : settings.mixpanel;
if (!token) {
  token = 'none';
}

var mixpanel = _mixpanel2.default.init(token);

if (localStorage.getItem('metrics.enabled') === null) {
  localStorage.setItem('metrics.enabled', true);
}

var Metrics = {
  enabled: function enabled() {
    return localStorage.getItem('metrics.enabled') === 'true';
  },
  setEnabled: function setEnabled(enabled) {
    localStorage.setItem('metrics.enabled', !!enabled);
  },
  track: function track(name, data) {
    data = data || {};
    if (!name) {
      return;
    }

    if (localStorage.getItem('metrics.enabled') !== 'true') {
      return;
    }

    var id = localStorage.getItem('metrics.id');
    if (!id) {
      id = _nodeUuid2.default.v4();
      localStorage.setItem('metrics.id', id);
    }

    var osName = _os2.default.platform();
    var osVersion = _Util2.default.isWindows() ? _os2.default.release() : (0, _osxRelease2.default)(_os2.default.release()).version;

    mixpanel.track(name, (0, _objectAssign2.default)({
      distinct_id: id,
      version: _Util2.default.packagejson().version,
      'Operating System': osName,
      'Operating System Version': osVersion,
      'Operating System Architecture': _os2.default.arch()
    }, data));
  }

};
module.exports = Metrics;
