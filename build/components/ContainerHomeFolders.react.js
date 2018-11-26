"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRetinaImage = require("react-retina-image");

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _path2 = require("path");

var _path3 = _interopRequireDefault(_path2);

var _electron = require("electron");

var _electron2 = _interopRequireDefault(_electron);

var _Util = require("../utils/Util");

var _Util2 = _interopRequireDefault(_Util);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var dialog = remote.dialog;


var ContainerHomeFolder = _addons2.default.createClass({
  displayName: "ContainerHomeFolder",

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },
  handleClickFolder: function handleClickFolder(source, destination) {
    var _this = this;

    _MetricsUtil2.default.track("Opened Volume Directory", {
      from: "home"
    });

    if (source.indexOf(_Util2.default.windowsToLinuxPath(_Util2.default.home())) === -1) {
      dialog.showMessageBox({
        message: "Enable all volumes to edit files? This may not work with all database containers.",
        buttons: ["Enable Volumes", "Cancel"]
      }, function (index) {
        if (index === 0) {
          var mounts = _underscore2.default.clone(_this.props.container.Mounts);
          var newSource = _path3.default.join(_Util2.default.home(), _Util2.default.documents(), "Kitematic", _this.props.container.Name, destination);

          mounts.forEach(function (m) {
            if (m.Destination === destination) {
              m.Source = _Util2.default.windowsToLinuxPath(newSource);
              m.Driver = null;
            }
          });

          (0, _mkdirp2.default)(newSource, function (err) {
            console.log(err);
            if (!err) {
              _electron.shell.showItemInFolder(newSource);
            }
          });

          var binds = mounts.map(function (m) {
            return m.Source + ":" + m.Destination;
          });

          var hostConfig = _underscore2.default.extend(_this.props.container.HostConfig, {
            Binds: binds
          });

          _ContainerActions2.default.update(_this.props.container.Name, {
            Mounts: mounts,
            HostConfig: hostConfig
          });
        }
      });
    } else {
      var _path = _Util2.default.isWindows() ? _Util2.default.linuxToWindowsPath(source) : source;
      _electron.shell.showItemInFolder(_path);
    }
  },
  handleClickChangeFolders: function handleClickChangeFolders() {
    _MetricsUtil2.default.track("Viewed Volume Settings", {
      from: "preview"
    });
    this.context.router.transitionTo("containerSettingsVolumes", {
      name: this.context.router.getCurrentParams().name
    });
  },
  render: function render() {
    var _this2 = this;

    if (!this.props.container) {
      return false;
    }

    var folders = _underscore2.default.map(this.props.container.Mounts, function (m, i) {
      var destination = m.Destination;
      var source = m.Source;
      return _addons2.default.createElement(
        "div",
        {
          key: i,
          className: "folder",
          onClick: _this2.handleClickFolder.bind(_this2, source, destination)
        },
        _addons2.default.createElement(_reactRetinaImage2.default, { src: "folder.png" }),
        _addons2.default.createElement(
          "div",
          { className: "text" },
          destination
        )
      );
    });

    return _addons2.default.createElement("div", { className: "folders wrapper" });
  }
});

module.exports = ContainerHomeFolder;
