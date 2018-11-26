'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerActions = require('../actions/ContainerActions');

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var dialog = remote.dialog;


var ContainerSettingsVolumes = _addons2.default.createClass({
  displayName: 'ContainerSettingsVolumes',

  handleChooseVolumeClick: function handleChooseVolumeClick(dockerVol) {
    var _this = this;

    dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, function (filenames) {
      if (!filenames) {
        return;
      }

      var directory = filenames[0];

      if (!directory || !_Util2.default.isNative() && directory.indexOf(_Util2.default.home()) === -1) {
        dialog.showMessageBox({
          type: 'warning',
          buttons: ['OK'],
          message: 'Invalid directory - Please make sure the directory exists and you can read/write to it.'
        });
        return;
      }

      _MetricsUtil2.default.track('Choose Directory for Volume');

      var mounts = _underscore2.default.clone(_this.props.container.Mounts);
      _underscore2.default.each(mounts, function (m) {
        if (m.Destination === dockerVol) {
          m.Source = _Util2.default.windowsToLinuxPath(directory);
          m.Driver = null;
        }
      });

      var binds = mounts.map(function (m) {
        return m.Source + ':' + m.Destination;
      });

      var hostConfig = _underscore2.default.extend(_this.props.container.HostConfig, { Binds: binds });

      _ContainerActions2.default.update(_this.props.container.Name, { Mounts: mounts, HostConfig: hostConfig });
    });
  },
  handleRemoveVolumeClick: function handleRemoveVolumeClick(dockerVol) {
    _MetricsUtil2.default.track('Removed Volume Directory', {
      from: 'settings'
    });

    var mounts = _underscore2.default.clone(this.props.container.Mounts);
    _underscore2.default.each(mounts, function (m) {
      if (m.Destination === dockerVol) {
        m.Source = null;
        m.Driver = 'local';
      }
    });

    var binds = mounts.map(function (m) {
      return m.Source + ':' + m.Destination;
    });

    var hostConfig = _underscore2.default.extend(this.props.container.HostConfig, { Binds: binds });

    _ContainerActions2.default.update(this.props.container.Name, { Mounts: mounts, HostConfig: hostConfig });
  },
  handleOpenVolumeClick: function handleOpenVolumeClick(path) {
    _MetricsUtil2.default.track('Opened Volume Directory', {
      from: 'settings'
    });
    if (_Util2.default.isWindows()) {
      _electron.shell.showItemInFolder(_Util2.default.linuxToWindowsPath(path));
    } else {
      _electron.shell.showItemInFolder(path);
    }
  },
  render: function render() {
    var _this2 = this;

    if (!this.props.container) {
      return false;
    }

    var homeDir = _Util2.default.isWindows() ? _Util2.default.windowsToLinuxPath(_Util2.default.home()) : _Util2.default.home();
    var mounts = _underscore2.default.map(this.props.container.Mounts, function (m, i) {
      var source = m.Source,
          destination = m.Destination;
      if (!m.Source || !_Util2.default.isNative() && m.Source.indexOf(homeDir) === -1 || m.Source.indexOf('/var/lib/docker/volumes') !== -1) {
        source = _addons2.default.createElement(
          'span',
          { className: 'value-right' },
          'No Folder'
        );
      } else {
        var local = _Util2.default.isWindows() ? _Util2.default.linuxToWindowsPath(source) : source;
        source = _addons2.default.createElement(
          'a',
          { className: 'value-right', onClick: _this2.handleOpenVolumeClick.bind(_this2, source) },
          local.replace(process.env.HOME, '~')
        );
      }
      return _addons2.default.createElement(
        'tr',
        null,
        _addons2.default.createElement(
          'td',
          null,
          destination
        ),
        _addons2.default.createElement(
          'td',
          null,
          source
        ),
        _addons2.default.createElement(
          'td',
          null,
          _addons2.default.createElement(
            'a',
            { className: 'btn btn-action small', disabled: _this2.props.container.State.Updating, onClick: _this2.handleChooseVolumeClick.bind(_this2, destination) },
            'Change'
          ),
          _addons2.default.createElement(
            'a',
            { className: 'btn btn-action small', disabled: _this2.props.container.State.Updating, onClick: _this2.handleRemoveVolumeClick.bind(_this2, destination) },
            'Remove'
          )
        )
      );
    });
    return _addons2.default.createElement(
      'div',
      { className: 'settings-panel' },
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Configure Volumes'
        ),
        _addons2.default.createElement(
          'table',
          { className: 'table volumes' },
          _addons2.default.createElement(
            'thead',
            null,
            _addons2.default.createElement(
              'tr',
              null,
              _addons2.default.createElement(
                'th',
                null,
                'DOCKER FOLDER'
              ),
              _addons2.default.createElement(
                'th',
                null,
                'LOCAL FOLDER'
              ),
              _addons2.default.createElement('th', null)
            )
          ),
          _addons2.default.createElement(
            'tbody',
            null,
            mounts
          )
        )
      )
    );
  }
});

module.exports = ContainerSettingsVolumes;
