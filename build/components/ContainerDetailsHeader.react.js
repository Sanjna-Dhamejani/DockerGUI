"use strict";

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerDetailsHeader = _addons2.default.createClass({
  displayName: "ContainerDetailsHeader",

  render: function render() {
    var state;
    if (!this.props.container) {
      return false;
    }

    if (this.props.container.State.Updating) {
      state = _addons2.default.createElement(
        "span",
        { className: "status downloading" },
        "UPDATING"
      );
    } else if (this.props.container.State.Stopping) {
      state = _addons2.default.createElement(
        "span",
        { className: "status running" },
        "STOPPING"
      );
    } else if (this.props.container.State.Paused) {
      state = _addons2.default.createElement(
        "span",
        { className: "status paused" },
        "PAUSED"
      );
    } else if (this.props.container.State.Restarting) {
      state = _addons2.default.createElement(
        "span",
        { className: "status restarting" },
        "RESTARTING"
      );
    } else if (this.props.container.State.Running && !this.props.container.State.ExitCode) {
      state = _addons2.default.createElement(
        "span",
        { className: "status running" },
        "RUNNING"
      );
    } else if (this.props.container.State.Starting) {
      state = _addons2.default.createElement(
        "span",
        { className: "status running" },
        "STARTING"
      );
    } else if (this.props.container.State.Downloading) {
      state = _addons2.default.createElement(
        "span",
        { className: "status downloading" },
        "DOWNLOADING"
      );
    } else {
      state = _addons2.default.createElement(
        "span",
        { className: "status stopped" },
        "STOPPED"
      );
    }
    return _addons2.default.createElement(
      "div",
      { className: "header-section" },
      _addons2.default.createElement(
        "div",
        { className: "text" },
        this.props.container.Name,
        state
      )
    );
  }
});

module.exports = ContainerDetailsHeader;
