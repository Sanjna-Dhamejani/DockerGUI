"use strict";

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerHomeWebPreview = require("./ContainerHomeWebPreview.react");

var _ContainerHomeWebPreview2 = _interopRequireDefault(_ContainerHomeWebPreview);

var _ContainerHomeIpPortsPreview = require("./ContainerHomeIpPortsPreview.react");

var _ContainerHomeIpPortsPreview2 = _interopRequireDefault(_ContainerHomeIpPortsPreview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerHomePreview = _addons2.default.createClass({
  displayName: "ContainerHomePreview",

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  reload: function reload() {
    var _this = this;

    var webview = document.getElementById("webview");
    if (webview) {
      var url = webview.src;
      (0, _request2.default)(url, function (err) {
        if (err && err.code === "ECONNREFUSED") {
          setTimeout(_this.reload, 2000);
        } else {
          try {
            webview.reload();
          } catch (err) {}
        }
      });
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    clearInterval(this.timer);
  },

  handleClickPortSettings: function handleClickPortSettings() {
    _MetricsUtil2.default.track("Viewed Port Settings", {
      from: "preview"
    });
    this.context.router.transitionTo("containerSettingsPorts", {
      name: this.context.router.getCurrentParams().name
    });
  },

  render: function render() {
    var preview;

    preview = _addons2.default.createElement(_ContainerHomeWebPreview2.default, {
      ports: this.props.ports,
      defaultPort: this.props.defaultPort,
      handleClickPortSettings: this.handleClickPortSettings
    });

    preview = _addons2.default.createElement(_ContainerHomeIpPortsPreview2.default, {
      ports: this.props.ports,
      handleClickPortSettings: this.handleClickPortSettings
    });

    return preview;
  }
});

module.exports = ContainerHomePreview;
