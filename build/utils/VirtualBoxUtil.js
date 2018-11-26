'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VirtualBox = {
  command: function command() {
    if (_Util2.default.isWindows()) {
      if (process.env.VBOX_MSI_INSTALL_PATH) {
        return _path2.default.join(process.env.VBOX_MSI_INSTALL_PATH, 'VBoxManage.exe');
      } else {
        return _path2.default.join(process.env.VBOX_INSTALL_PATH, 'VBoxManage.exe');
      }
    } else {
      return '/Applications/VirtualBox.app/Contents/MacOS/VBoxManage';
    }
  },
  installed: function installed() {
    if (_Util2.default.isWindows() && !process.env.VBOX_INSTALL_PATH && !process.env.VBOX_MSI_INSTALL_PATH) {
      return false;
    }
    return _fs2.default.existsSync(this.command());
  },
  active: function active() {
    return _fs2.default.existsSync('/dev/vboxnetctl');
  },
  version: function version() {
    return _Util2.default.execFile([this.command(), '-v']).then(function (stdout) {
      var matchlist = stdout.match(/(\d+\.\d+\.\d+).*/);
      if (!matchlist || matchlist.length < 2) {
        _bluebird2.default.reject('VBoxManage -v output format not recognized.');
      }
      return _bluebird2.default.resolve(matchlist[1]);
    }).catch(function () {
      return _bluebird2.default.resolve(null);
    });
  },
  mountSharedDir: function mountSharedDir(vmName, pathName, hostPath) {
    return _Util2.default.execFile([this.command(), 'sharedfolder', 'add', vmName, '--name', pathName, '--hostpath', hostPath, '--automount']);
  },
  vmExists: function vmExists(name) {
    return _Util2.default.execFile([this.command(), 'list', 'vms']).then(function (out) {
      return out.indexOf('"' + name + '"') !== -1;
    }).catch(function () {
      return false;
    });
  }
};

module.exports = VirtualBox;
