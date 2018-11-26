'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _which = require('which');

var _which2 = _interopRequireDefault(_which);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DockerMachine = {
  command: function command() {
    if (_Util2.default.isWindows()) {
      if (process.env.DOCKER_TOOLBOX_INSTALL_PATH) {
        return _path2.default.join(process.env.DOCKER_TOOLBOX_INSTALL_PATH, 'docker-machine.exe');
      }
    }

    try {
      return _which2.default.sync('docker-machine');
    } catch (ex) {
      return null;
    }
  },
  name: function name() {
    return 'default';
  },
  installed: function installed() {
    try {
      _fs2.default.accessSync(this.command(), _fs2.default.X_OK);
      return true;
    } catch (ex) {
      return false;
    }
  },
  version: function version() {
    return _Util2.default.execFile([this.command(), '-v']).then(function (stdout) {
      try {
        var matchlist = stdout.match(/(\d+\.\d+\.\d+).*/);
        if (!matchlist || matchlist.length < 2) {
          return _bluebird2.default.reject('docker-machine -v output format not recognized.');
        }
        return _bluebird2.default.resolve(matchlist[1]);
      } catch (err) {
        return _bluebird2.default.resolve(null);
      }
    }).catch(function () {
      return _bluebird2.default.resolve(null);
    });
  },
  isoversion: function isoversion() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    try {
      var data = _fs2.default.readFileSync(_path2.default.join(_Util2.default.home(), '.docker', 'machine', 'machines', machineName, 'boot2docker.iso'), 'utf8');
      var match = data.match(/Boot2Docker-v(\d+\.\d+\.\d+)/);
      if (match) {
        return match[1];
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  },
  exists: function exists() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return this.status(machineName).then(function () {
      return true;
    }).catch(function () {
      return false;
    });
  },
  create: function create() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), '-D', 'create', '-d', 'virtualbox', '--virtualbox-memory', '2048', machineName]);
  },
  start: function start() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), '-D', 'start', machineName]);
  },
  stop: function stop() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'stop', machineName]);
  },
  upgrade: function upgrade() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'upgrade', machineName]);
  },
  rm: function rm() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'rm', '-f', machineName]);
  },
  ip: function ip() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'ip', machineName]).then(function (stdout) {
      return _bluebird2.default.resolve(stdout.trim().replace('\n', ''));
    });
  },
  url: function url() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'url', machineName]).then(function (stdout) {
      return _bluebird2.default.resolve(stdout.trim().replace('\n', ''));
    });
  },
  regenerateCerts: function regenerateCerts() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'tls-regenerate-certs', '-f', machineName]);
  },
  status: function status() {
    var _this = this;

    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return new _bluebird2.default(function (resolve, reject) {
      _child_process2.default.execFile(_this.command(), ['status', machineName], function (error, stdout, stderr) {
        if (error) {
          reject(new Error('Encountered an error: ' + error));
        } else {
          resolve(stdout.trim() + stderr.trim());
        }
      });
    });
  },
  disk: function disk() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'ssh', machineName, 'df']).then(function (stdout) {
      try {
        var lines = stdout.split('\n');
        var dataline = _underscore2.default.find(lines, function (line) {
          return line.indexOf('/dev/sda1') !== -1;
        });
        var tokens = dataline.split(' ');
        tokens = tokens.filter(function (token) {
          return token !== '';
        });
        var usedGb = parseInt(tokens[2], 10) / 1000000;
        var totalGb = parseInt(tokens[3], 10) / 1000000;
        var percent = parseInt(tokens[4].replace('%', ''), 10);
        return {
          used_gb: usedGb.toFixed(2),
          total_gb: totalGb.toFixed(2),
          percent: percent
        };
      } catch (err) {
        return _bluebird2.default.reject(err);
      }
    });
  },
  memory: function memory() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();

    return _Util2.default.execFile([this.command(), 'ssh', machineName, 'free -m']).then(function (stdout) {
      try {
        var lines = stdout.split('\n');
        var dataline = _underscore2.default.find(lines, function (line) {
          return line.indexOf('-/+ buffers') !== -1;
        });
        var tokens = dataline.split(' ');
        tokens = tokens.filter(function (token) {
          return token !== '';
        });
        var usedGb = parseInt(tokens[2], 10) / 1000;
        var freeGb = parseInt(tokens[3], 10) / 1000;
        var totalGb = usedGb + freeGb;
        var percent = Math.round(usedGb / totalGb * 100);
        return {
          used_gb: usedGb.toFixed(2),
          total_gb: totalGb.toFixed(2),
          free_gb: freeGb.toFixed(2),
          percent: percent
        };
      } catch (err) {
        return _bluebird2.default.reject(err);
      }
    });
  },
  dockerTerminal: function dockerTerminal(cmd) {
    var machineName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.name();

    cmd = cmd || process.env.SHELL || '';
    if (_Util2.default.isWindows()) {
      if (_Util2.default.isNative()) {
        _Util2.default.exec('start powershell.exe ' + cmd);
      } else {
        this.url(machineName).then(function (machineUrl) {
          _Util2.default.exec('start powershell.exe ' + cmd, { env: {
              'DOCKER_HOST': machineUrl,
              'DOCKER_CERT_PATH': process.env.DOCKER_CERT_PATH || _path2.default.join(_Util2.default.home(), '.docker', 'machine', 'machines', machineName),
              'DOCKER_TLS_VERIFY': 1
            }
          });
        });
      }
    } else {
      var terminal = _Util2.default.isLinux() ? _Util2.default.linuxTerminal() : [_path2.default.join(process.env.RESOURCES_PATH, 'terminal')];
      if (_Util2.default.isNative()) {
        terminal.push(cmd);
        _Util2.default.execFile(terminal).then(function () {});
      } else {
        this.url(machineName).then(function (machineUrl) {
          terminal.push('DOCKER_HOST=' + machineUrl + ' DOCKER_CERT_PATH=' + (process.env.DOCKER_CERT_PATH || _path2.default.join(_Util2.default.home(), '.docker/machine/machines/' + machineName)) + ' DOCKER_TLS_VERIFY=1');
          terminal.push(cmd);
          _Util2.default.execFile(terminal).then(function () {});
        });
      }
    }
  },
  virtualBoxLogs: function virtualBoxLogs() {
    var machineName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name();


    var logsPath = null;
    if (process.env.MACHINE_STORAGE_PATH) {
      logsPath = _path2.default.join(process.env.MACHINE_STORAGE_PATH, 'machines', machineName, machineName, 'Logs', 'VBox.log');
    } else {
      logsPath = _path2.default.join(_Util2.default.home(), '.docker', 'machine', 'machines', machineName, machineName, 'Logs', 'VBox.log');
    }

    var logData = null;
    try {
      logData = _fs2.default.readFileSync(logsPath, 'utf8');
    } catch (e) {
      console.error(e);
    }
    return logData;
  }
};

module.exports = DockerMachine;
