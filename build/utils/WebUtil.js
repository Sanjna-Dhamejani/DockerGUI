'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bugsnagJs = require('bugsnag-js');

var _bugsnagJs2 = _interopRequireDefault(_bugsnagJs);

var _MetricsUtil = require('./MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var app = remote.app;


var WebUtil = {
  addWindowSizeSaving: function addWindowSizeSaving() {
    window.addEventListener('resize', function () {
      _fs2.default.writeFileSync(_path2.default.join(app.getPath('userData'), 'size'), (0, _stringify2.default)({
        width: window.outerWidth,
        height: window.outerHeight
      }));
    });
  },
  addLiveReload: function addLiveReload() {
    if (process.env.NODE_ENV === 'development') {
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://localhost:35729/livereload.js';
      head.appendChild(script);
    }
  },
  addBugReporting: function addBugReporting() {
    var settingsjson = _Util2.default.settingsjson();

    if (settingsjson.bugsnag) {
      _bugsnagJs2.default.apiKey = settingsjson.bugsnag;
      _bugsnagJs2.default.autoNotify = true;
      _bugsnagJs2.default.releaseStage = process.env.NODE_ENV === 'development' ? 'development' : 'production';
      _bugsnagJs2.default.notifyReleaseStages = ['production'];
      _bugsnagJs2.default.appVersion = app.getVersion();

      _bugsnagJs2.default.beforeNotify = function (payload) {
        if (!_MetricsUtil2.default.enabled()) {
          return false;
        }

        payload.stacktrace = _Util2.default.removeSensitiveData(payload.stacktrace);
        payload.context = _Util2.default.removeSensitiveData(payload.context);
        payload.file = _Util2.default.removeSensitiveData(payload.file);
        payload.message = _Util2.default.removeSensitiveData(payload.message);
        payload.url = _Util2.default.removeSensitiveData(payload.url);
        payload.name = _Util2.default.removeSensitiveData(payload.name);
        payload.file = _Util2.default.removeSensitiveData(payload.file);

        for (var key in payload.metaData) {
          payload.metaData[key] = _Util2.default.removeSensitiveData(payload.metaData[key]);
        }
      };
    }
  },
  disableGlobalBackspace: function disableGlobalBackspace() {
    document.onkeydown = function (e) {
      e = e || window.event;
      var doPrevent;
      if (e.keyCode === 8) {
        var d = e.srcElement || e.target;
        if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA') {
          doPrevent = d.readOnly || d.disabled;
        } else {
          doPrevent = true;
        }
      } else {
        doPrevent = false;
      }
      if (doPrevent) {
        e.preventDefault();
      }
    };
  }
};

module.exports = WebUtil;
