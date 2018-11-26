"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _electron = require("electron");

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerUtil = require("../utils/ContainerUtil");

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _DockerMachineUtil = require("../utils/DockerMachineUtil");

var _DockerMachineUtil2 = _interopRequireDefault(_DockerMachineUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerDetailsSubheader = _react2.default.createClass({
  displayName: "ContainerDetailsSubheader",

  contextTypes: {
    router: _react2.default.PropTypes.func
  },
  disableRun: function disableRun() {
    if (!this.props.container) {
      return true;
    }
    return !this.props.container.State.Running || !this.props.defaultPort || this.props.container.State.Updating;
  },
  disableRestart: function disableRestart() {
    if (!this.props.container) {
      return true;
    }
    return this.props.container.State.Stopping || this.props.container.State.Downloading || this.props.container.State.Restarting || this.props.container.State.Updating;
  },
  disableStop: function disableStop() {
    if (!this.props.container) {
      return true;
    }
    return this.props.container.State.Stopping || this.props.container.State.Downloading || this.props.container.State.ExitCode || !this.props.container.State.Running || this.props.container.State.Updating;
  },
  disableStart: function disableStart() {
    if (!this.props.container) {
      return true;
    }
    return this.props.container.State.Downloading || this.props.container.State.Running || this.props.container.State.Updating;
  },
  disableTerminal: function disableTerminal() {
    if (!this.props.container) {
      return true;
    }
    return this.props.container.State.Stopping || !this.props.container.State.Running || this.props.container.State.Updating;
  },
  disableTab: function disableTab() {
    if (!this.props.container) {
      return false;
    }
    return this.props.container.State.Downloading;
  },
  showHome: function showHome() {
    if (!this.disableTab()) {
      _MetricsUtil2.default.track("Viewed Home", {
        from: "header"
      });
      this.context.router.transitionTo("containerHome", {
        name: this.context.router.getCurrentParams().name
      });
    }
  },
  showSettings: function showSettings() {
    if (!this.disableTab()) {
      _MetricsUtil2.default.track("Viewed Settings");
      this.context.router.transitionTo("containerSettings", {
        name: this.context.router.getCurrentParams().name
      });
    }
  },
  handleRun: function handleRun() {
    if (this.props.defaultPort && !this.disableRun()) {
      _MetricsUtil2.default.track("Opened In Browser", {
        from: "header"
      });
      _electron.shell.openExternal(this.props.ports[this.props.defaultPort].url);
    }
  },
  handleRestart: function handleRestart() {
    if (!this.disableRestart()) {
      _MetricsUtil2.default.track("Restarted Container");
      _ContainerActions2.default.restart(this.props.container.Name);
    }
  },
  handleStop: function handleStop() {
    if (!this.disableStop()) {
      _MetricsUtil2.default.track("Stopped Container");
      _ContainerActions2.default.stop(this.props.container.Name);
    }
  },
  handleStart: function handleStart() {
    if (!this.disableStart()) {
      _MetricsUtil2.default.track("Started Container");
      _ContainerActions2.default.start(this.props.container.Name);
    }
  },
  handleDocs: function handleDocs() {
    var repoUri = "https://hub.docker.com/r/";
    var imageName = this.props.container.Config.Image.split(":")[0];
    if (imageName.indexOf("/") === -1) {
      repoUri = repoUri + "library/" + imageName;
    } else {
      repoUri = repoUri + imageName;
    }
    _electron.shell.openExternal(repoUri);
  },
  handleTerminal: function handleTerminal() {
    if (!this.disableTerminal()) {
      _MetricsUtil2.default.track("Terminaled Into Container");
      var container = this.props.container;
      var shell = _ContainerUtil2.default.env(container).reduce(function (envs, env) {
        envs[env[0]] = env[1];
        return envs;
      }, {}).SHELL;

      if (!shell) {
        shell = localStorage.getItem("settings.terminalShell") || "sh";
      }
      _DockerMachineUtil2.default.dockerTerminal("docker exec -it " + this.props.container.Name + " " + shell);
    }
  },
  render: function render() {
    var restartActionClass = (0, _classnames2.default)({
      action: true,
      disabled: this.disableRestart()
    });
    var stopActionClass = (0, _classnames2.default)({
      action: true,
      disabled: this.disableStop()
    });
    var startActionClass = (0, _classnames2.default)({
      action: true,
      disabled: this.disableStart()
    });
    var terminalActionClass = (0, _classnames2.default)({
      action: true,
      disabled: this.disableTerminal()
    });
    var docsActionClass = (0, _classnames2.default)({
      action: true,
      disabled: false
    });

    var currentRoutes = _underscore2.default.map(this.context.router.getCurrentRoutes(), function (r) {
      return r.name;
    });
    var currentRoute = _underscore2.default.last(currentRoutes);

    var tabHomeClasses = (0, _classnames2.default)({
      "details-tab": true,
      active: currentRoute === "containerHome",
      disabled: this.disableTab()
    });
    var tabSettingsClasses = (0, _classnames2.default)({
      "details-tab": true,
      active: currentRoutes && currentRoutes.indexOf("containerSettings") >= 0,
      disabled: this.disableTab()
    });
    var startStopToggle;
    if (this.disableStop()) {
      startStopToggle = _react2.default.createElement(
        "div",
        { className: startActionClass },
        _react2.default.createElement(
          "div",
          { className: "action-icon start", onClick: this.handleStart },
          _react2.default.createElement("span", { className: "icon icon-start" })
        ),
        _react2.default.createElement(
          "div",
          { className: "btn-label" },
          "START"
        )
      );
    } else {
      startStopToggle = _react2.default.createElement(
        "div",
        { className: stopActionClass },
        _react2.default.createElement(
          "div",
          { className: "action-icon stop", onClick: this.handleStop },
          _react2.default.createElement("span", { className: "icon icon-stop" })
        ),
        _react2.default.createElement(
          "div",
          { className: "btn-label" },
          "STOP"
        )
      );
    }

    return _react2.default.createElement(
      "div",
      { className: "details-subheader" },
      _react2.default.createElement(
        "div",
        { className: "details-header-actions" },
        startStopToggle,
        _react2.default.createElement(
          "div",
          { className: restartActionClass },
          _react2.default.createElement(
            "div",
            { className: "action-icon", onClick: this.handleRestart },
            _react2.default.createElement("span", { className: "icon icon-restart" })
          ),
          _react2.default.createElement(
            "div",
            { className: "btn-label" },
            "RESTART"
          )
        ),
        _react2.default.createElement(
          "div",
          { className: terminalActionClass },
          _react2.default.createElement(
            "div",
            { className: "action-icon", onClick: this.handleTerminal },
            _react2.default.createElement("span", { className: "icon icon-docker-exec" })
          ),
          _react2.default.createElement(
            "div",
            { className: "btn-label" },
            "EXEC"
          )
        ),
        _react2.default.createElement(
          "div",
          { className: docsActionClass },
          _react2.default.createElement(
            "div",
            { className: "action-icon", onClick: this.handleDocs },
            _react2.default.createElement("span", { className: "icon icon-open-external" })
          ),
          _react2.default.createElement(
            "div",
            { className: "btn-label" },
            "DOCS"
          )
        )
      ),
      _react2.default.createElement(
        "div",
        { className: "details-subheader-tabs" },
        _react2.default.createElement(
          "span",
          { className: tabHomeClasses, onClick: this.showHome },
          "Home"
        )
      )
    );
  }
});

module.exports = ContainerDetailsSubheader;
