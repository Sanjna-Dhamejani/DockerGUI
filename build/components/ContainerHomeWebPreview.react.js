"use strict";

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerHomeWebPreview = _addons2.default.createClass({
  displayName: "ContainerHomeWebPreview",

  handleClickPreview: function handleClickPreview() {
    _MetricsUtil2.default.track("Opened In Browser", {
      from: "preview"
    });
    _electron.shell.openExternal("http://" + this.props.ports[this.props.defaultPort].url);
  },

  handleClickPortSettings: function handleClickPortSettings() {
    this.props.handleClickPortSettings();
  },

  render: function render() {
    var frame = _addons2.default.createElement("webview", {
      className: "frame",
      id: "webview",
      src: "http://" + this.props.ports[this.props.defaultPort].url,
      autosize: "on"
    });
    return _addons2.default.createElement("div", { className: "web-preview wrapper" });
  }
});

module.exports = ContainerHomeWebPreview;
