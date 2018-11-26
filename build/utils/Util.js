'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var dialog = remote.dialog;
var app = remote.app;

module.exports = {
  native: null,
  execFile: function execFile(args, options) {
    return new _bluebird2.default(function (resolve, reject) {
      _child_process2.default.execFile(args[0], args.slice(1), options, function (error, stdout) {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  },
  exec: function exec(args, options) {
    return new _bluebird2.default(function (resolve, reject) {
      _child_process2.default.exec(args, options, function (error, stdout) {
        if (error) {
          reject(new Error('Encountered an error: ' + error));
        } else {
          resolve(stdout);
        }
      });
    });
  },
  isWindows: function isWindows() {
    return process.platform === 'win32';
  },
  isLinux: function isLinux() {
    return process.platform === 'linux';
  },
  isNative: function isNative() {
    switch (localStorage.getItem('settings.useVM')) {
      case 'true':
        this.native = false;
        break;
      case 'false':
        this.native = true;
        break;
      default:
        this.native = null;
    }
    if (this.native === null) {
      if (this.isWindows()) {
        this.native = _http2.default.get({
          url: 'http:////./pipe/docker_engine/version'
        }, function (response) {
          if (response.statusCode !== 200) {
            return false;
          } else {
            return true;
          }
        });
      } else {
        try {
          // Check if file exists
          var stats = _fs2.default.statSync('/var/run/docker.sock');
          if (stats.isSocket()) {
            this.native = true;
          }
        } catch (e) {
          if (this.isLinux()) {
            this.native = true;
          } else {
            this.native = false;
          }
        }
      }
    }
    return this.native;
  },
  binsPath: function binsPath() {
    return this.isWindows() ? _path2.default.join(this.home(), 'Kitematic-bins') : _path2.default.join('/usr/local/bin');
  },
  binsEnding: function binsEnding() {
    return this.isWindows() ? '.exe' : '';
  },
  dockerBinPath: function dockerBinPath() {
    return _path2.default.join(this.binsPath(), 'docker' + this.binsEnding());
  },
  dockerMachineBinPath: function dockerMachineBinPath() {
    return _path2.default.join(this.binsPath(), 'docker-machine' + this.binsEnding());
  },
  dockerComposeBinPath: function dockerComposeBinPath() {
    return _path2.default.join(this.binsPath(), 'docker-compose' + this.binsEnding());
  },
  escapePath: function escapePath(str) {
    return str.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  },
  home: function home() {
    return app.getPath('home');
  },
  documents: function documents() {
    // TODO: fix me for windows 7
    return 'Documents';
  },
  CommandOrCtrl: function CommandOrCtrl() {
    return this.isWindows() || this.isLinux() ? 'Ctrl' : 'Command';
  },
  removeSensitiveData: function removeSensitiveData(str) {
    if (!str || str.length === 0 || typeof str !== 'string') {
      return str;
    }
    return str.replace(/-----BEGIN CERTIFICATE-----.*-----END CERTIFICATE-----/mg, '<redacted>').replace(/-----BEGIN RSA PRIVATE KEY-----.*-----END RSA PRIVATE KEY-----/mg, '<redacted>').replace(/\/Users\/[^\/]*\//mg, '/Users/<redacted>/').replace(/\\Users\\[^\/]*\\/mg, '\\Users\\<redacted>\\');
  },
  packagejson: function packagejson() {
    return JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '..', 'package.json'), 'utf8'));
  },
  settingsjson: function settingsjson() {
    var settingsjson = {};
    try {
      settingsjson = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '..', 'settings.json'), 'utf8'));
    } catch (err) {
      // log errors
    }
    return settingsjson;
  },
  isOfficialRepo: function isOfficialRepo(name) {
    if (!name || !name.length) {
      return false;
    }

    // An official repo is alphanumeric characters separated by dashes or
    // underscores.
    // Examples: myrepo, my-docker-repo, my_docker_repo
    // Non-examples: mynamespace/myrepo, my%!repo
    var repoRegexp = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
    return repoRegexp.test(name);
  },
  compareVersions: function compareVersions(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }

    if (zeroExtend) {
      while (v1parts.length < v2parts.length) {
        v1parts.push('0');
      }
      while (v2parts.length < v1parts.length) {
        v2parts.push('0');
      }
    }

    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length === i) {
        return 1;
      }
      if (v1parts[i] === v2parts[i]) {
        continue;
      } else if (v1parts[i] > v2parts[i]) {
        return 1;
      } else {
        return -1;
      }
    }

    if (v1parts.length !== v2parts.length) {
      return -1;
    }

    return 0;
  },
  randomId: function randomId() {
    return _crypto2.default.randomBytes(32).toString('hex');
  },
  windowsToLinuxPath: function windowsToLinuxPath(windowsAbsPath) {
    var fullPath = windowsAbsPath.replace(':', '').split(_path2.default.sep).join('/');
    if (fullPath.charAt(0) !== '/') {
      fullPath = '/' + fullPath.charAt(0).toLowerCase() + fullPath.substring(1);
    }
    return fullPath;
  },
  linuxToWindowsPath: function linuxToWindowsPath(linuxAbsPath) {
    return linuxAbsPath.replace('/c', 'C:').split('/').join('\\');
  },
  linuxTerminal: function linuxTerminal() {
    if (_fs2.default.existsSync('/usr/bin/x-terminal-emulator')) {
      return ['/usr/bin/x-terminal-emulator', '-e'];
    } else {
      dialog.showMessageBox({
        type: 'warning',
        buttons: ['OK'],
        message: 'The symbolic link /usr/bin/x-terminal-emulator does not exist. Please read the Wiki at https://github.com/docker/kitematic/wiki/Early-Linux-Support for more information.'
      });
      return false;
    }
  },
  webPorts: ['80', '8000', '8080', '8888', '3000', '5000', '2368', '9200', '8983']
};
