'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _bugsnagJs = require('bugsnag-js');

var _bugsnagJs2 = _interopRequireDefault(_bugsnagJs);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _VirtualBoxUtil = require('./VirtualBoxUtil');

var _VirtualBoxUtil2 = _interopRequireDefault(_VirtualBoxUtil);

var _SetupServerActions = require('../actions/SetupServerActions');

var _SetupServerActions2 = _interopRequireDefault(_SetupServerActions);

var _MetricsUtil = require('./MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _DockerMachineUtil = require('./DockerMachineUtil');

var _DockerMachineUtil2 = _interopRequireDefault(_DockerMachineUtil);

var _DockerUtil = require('./DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

var _router = require('../router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Docker Machine exits with 3 to differentiate pre-create check failures (e.g.
// virtualization isn't enabled) from normal errors during create (exit code
// 1).
var precreateCheckExitCode = 3;

var _retryPromise = null;
var _timers = [];

exports.default = {
  simulateProgress: function simulateProgress(estimateSeconds) {
    this.clearTimers();
    var times = _underscore2.default.range(0, estimateSeconds * 1000, 200);
    _underscore2.default.each(times, function (time) {
      var timer = setTimeout(function () {
        _SetupServerActions2.default.progress({ progress: 100 * time / (estimateSeconds * 1000) });
      }, time);
      _timers.push(timer);
    });
  },
  clearTimers: function clearTimers() {
    _timers.forEach(function (t) {
      return clearTimeout(t);
    });
    _timers = [];
  },
  useVbox: function useVbox() {
    var _this = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _MetricsUtil2.default.track('Retried Setup with VBox');
              _router2.default.get().transitionTo('loading');
              _Util2.default.native = false;
              localStorage.setItem('settings.useVM', true);
              _SetupServerActions2.default.error({ error: { message: null } });
              _retryPromise.resolve();

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))();
  },
  retry: function retry(removeVM) {
    _MetricsUtil2.default.track('Retried Setup', {
      removeVM: removeVM
    });

    _router2.default.get().transitionTo('loading');
    _SetupServerActions2.default.error({ error: { message: null } });
    if (removeVM) {
      _DockerMachineUtil2.default.rm().finally(function () {
        _retryPromise.resolve();
      });
    } else {
      _retryPromise.resolve();
    }
  },
  pause: function pause() {
    _retryPromise = _bluebird2.default.defer();
    return _retryPromise.promise;
  },
  setup: function setup() {
    var _this2 = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!true) {
                _context2.next = 22;
                break;
              }

              _context2.prev = 1;

              if (!_Util2.default.isNative()) {
                _context2.next = 7;
                break;
              }

              _context2.next = 5;
              return _this2.nativeSetup();

            case 5:
              _context2.next = 9;
              break;

            case 7:
              _context2.next = 9;
              return _this2.nonNativeSetup();

            case 9:
              return _context2.abrupt('return');

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2['catch'](1);

              _MetricsUtil2.default.track('Native Setup Failed');
              _SetupServerActions2.default.error({ error: _context2.t0 });

              _bugsnagJs2.default.notify('Native Setup Failed', _context2.t0.message, {
                'Docker Error': _context2.t0.message
              }, 'info');
              _this2.clearTimers();
              _context2.next = 20;
              return _this2.pause();

            case 20:
              _context2.next = 0;
              break;

            case 22:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2, [[1, 12]]);
    }))();
  },
  nativeSetup: function nativeSetup() {
    var _this3 = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!true) {
                _context3.next = 15;
                break;
              }

              _context3.prev = 1;

              _router2.default.get().transitionTo('setup');
              _DockerUtil2.default.setup('localhost');
              _SetupServerActions2.default.started({ started: true });
              _this3.simulateProgress(5);
              _MetricsUtil2.default.track('Native Setup Finished');
              return _context3.abrupt('return', _DockerUtil2.default.version());

            case 10:
              _context3.prev = 10;
              _context3.t0 = _context3['catch'](1);
              throw new Error(_context3.t0);

            case 13:
              _context3.next = 0;
              break;

            case 15:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3, [[1, 10]]);
    }))();
  },
  nonNativeSetup: function nonNativeSetup() {
    var _this4 = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      var virtualBoxVersion, machineVersion, virtualBoxInstalled, machineInstalled, exists, state, tries, ip, message, lastLine, virtualBoxLogs;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              virtualBoxVersion = null;
              machineVersion = null;

            case 2:
              if (!true) {
                _context4.next = 102;
                break;
              }

              _context4.prev = 3;

              _SetupServerActions2.default.started({ started: false });

              // Make sure virtualBox and docker-machine are installed
              virtualBoxInstalled = _VirtualBoxUtil2.default.installed();
              machineInstalled = _DockerMachineUtil2.default.installed();

              if (!(!virtualBoxInstalled || !machineInstalled)) {
                _context4.next = 14;
                break;
              }

              _router2.default.get().transitionTo('setup');
              if (!virtualBoxInstalled) {
                _SetupServerActions2.default.error({ error: 'VirtualBox is not installed. Please install it via the Docker Toolbox.' });
              } else {
                _SetupServerActions2.default.error({ error: 'Docker Machine is not installed. Please install it via the Docker Toolbox.' });
              }
              _this4.clearTimers();
              _context4.next = 13;
              return _this4.pause();

            case 13:
              return _context4.abrupt('continue', 2);

            case 14:
              _context4.next = 16;
              return _VirtualBoxUtil2.default.version();

            case 16:
              virtualBoxVersion = _context4.sent;
              _context4.next = 19;
              return _DockerMachineUtil2.default.version();

            case 19:
              machineVersion = _context4.sent;


              _SetupServerActions2.default.started({ started: true });
              _MetricsUtil2.default.track('Started Setup', {
                virtualBoxVersion: virtualBoxVersion,
                machineVersion: machineVersion
              });
              exists = void 0;

              if (!process.env.MACHINE_STORAGE_PATH) {
                _context4.next = 32;
                break;
              }

              _context4.next = 26;
              return _VirtualBoxUtil2.default.vmExists(_DockerMachineUtil2.default.name());

            case 26:
              _context4.t0 = _context4.sent;

              if (!_context4.t0) {
                _context4.next = 29;
                break;
              }

              _context4.t0 = _fs2.default.existsSync(_path2.default.join(process.env.MACHINE_STORAGE_PATH, 'machines', _DockerMachineUtil2.default.name()));

            case 29:
              exists = _context4.t0;
              _context4.next = 38;
              break;

            case 32:
              _context4.next = 34;
              return _VirtualBoxUtil2.default.vmExists(_DockerMachineUtil2.default.name());

            case 34:
              _context4.t1 = _context4.sent;

              if (!_context4.t1) {
                _context4.next = 37;
                break;
              }

              _context4.t1 = _fs2.default.existsSync(_path2.default.join(_Util2.default.home(), '.docker', 'machine', 'machines', _DockerMachineUtil2.default.name()));

            case 37:
              exists = _context4.t1;

            case 38:
              if (exists) {
                _context4.next = 53;
                break;
              }

              _router2.default.get().transitionTo('setup');
              _SetupServerActions2.default.started({ started: true });
              _this4.simulateProgress(60);
              _context4.prev = 42;
              _context4.next = 45;
              return _DockerMachineUtil2.default.rm();

            case 45:
              _context4.next = 49;
              break;

            case 47:
              _context4.prev = 47;
              _context4.t2 = _context4['catch'](42);

            case 49:
              _context4.next = 51;
              return _DockerMachineUtil2.default.create();

            case 51:
              _context4.next = 62;
              break;

            case 53:
              _context4.next = 55;
              return _DockerMachineUtil2.default.status();

            case 55:
              state = _context4.sent;

              if (!(state !== 'Running')) {
                _context4.next = 62;
                break;
              }

              _router2.default.get().transitionTo('setup');
              _SetupServerActions2.default.started({ started: true });
              if (state === 'Saved') {
                _this4.simulateProgress(10);
              } else if (state === 'Stopped') {
                _this4.simulateProgress(25);
              } else {
                _this4.simulateProgress(40);
              }

              _context4.next = 62;
              return _DockerMachineUtil2.default.start();

            case 62:

              // Try to receive an ip address from machine, for at least to 80 seconds.
              tries = 80, ip = null;

            case 63:
              if (!(!ip && tries > 0)) {
                _context4.next = 78;
                break;
              }

              _context4.prev = 64;

              tries -= 1;
              console.log('Trying to fetch machine IP, tries left: ' + tries);
              _context4.next = 69;
              return _DockerMachineUtil2.default.ip();

            case 69:
              ip = _context4.sent;
              _context4.next = 72;
              return _bluebird2.default.delay(1000);

            case 72:
              _context4.next = 76;
              break;

            case 74:
              _context4.prev = 74;
              _context4.t3 = _context4['catch'](64);

            case 76:
              _context4.next = 63;
              break;

            case 78:
              if (!ip) {
                _context4.next = 84;
                break;
              }

              _DockerUtil2.default.setup(ip, _DockerMachineUtil2.default.name());
              _context4.next = 82;
              return _DockerUtil2.default.version();

            case 82:
              _context4.next = 85;
              break;

            case 84:
              throw new Error('Could not determine IP from docker-machine.');

            case 85:
              return _context4.abrupt('break', 102);

            case 88:
              _context4.prev = 88;
              _context4.t4 = _context4['catch'](3);

              _router2.default.get().transitionTo('setup');

              if (_context4.t4.code === precreateCheckExitCode) {
                _MetricsUtil2.default.track('Setup Halted', {
                  virtualBoxVersion: virtualBoxVersion,
                  machineVersion: machineVersion
                });
              } else {
                _MetricsUtil2.default.track('Setup Failed', {
                  virtualBoxVersion: virtualBoxVersion,
                  machineVersion: machineVersion
                });
              }

              message = _context4.t4.message.split('\n');
              lastLine = message.length > 1 ? message[message.length - 2] : 'Docker Machine encountered an error.';
              virtualBoxLogs = _DockerMachineUtil2.default.virtualBoxLogs();

              _bugsnagJs2.default.notify('Setup Failed', lastLine, {
                'Docker Machine Logs': _context4.t4.message,
                'VirtualBox Logs': virtualBoxLogs,
                'VirtualBox Version': virtualBoxVersion,
                'Machine Version': machineVersion,
                groupingHash: machineVersion
              }, 'info');

              _SetupServerActions2.default.error({ error: new Error(message) });

              _this4.clearTimers();
              _context4.next = 100;
              return _this4.pause();

            case 100:
              _context4.next = 2;
              break;

            case 102:
              _MetricsUtil2.default.track('Setup Finished', {
                virtualBoxVersion: virtualBoxVersion,
                machineVersion: machineVersion
              });

            case 103:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this4, [[3, 88], [42, 47], [64, 74]]);
    }))();
  }
};
