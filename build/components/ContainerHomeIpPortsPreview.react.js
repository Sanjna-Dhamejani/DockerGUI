"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerHomeIpPortsPreview = _addons2.default.createClass({
  displayName: "ContainerHomeIpPortsPreview",

  handleClickPortSettings: function handleClickPortSettings() {
    this.props.handleClickPortSettings();
  },

  render: function render() {
    var ports = _underscore2.default.map(_underscore2.default.pairs(this.props.ports), function (pair) {
      var key = pair[0];
      var val = pair[1];
      return _addons2.default.createElement(
        "tr",
        { key: key },
        _addons2.default.createElement(
          "td",
          null,
          key + "/" + val.portType
        ),
        _addons2.default.createElement(
          "td",
          null,
          val.url
        )
      );
    });

    return _addons2.default.createElement(
      "div",
      { className: "web-preview wrapper" },
      _addons2.default.createElement(
        "div",
        { className: "widget" },
        _addons2.default.createElement(
          "div",
          { className: "top-bar" },
          _addons2.default.createElement(
            "div",
            { className: "text" },
            "IP & PORTS"
          )
        ),
        _addons2.default.createElement(
          "p",
          null,
          "You can access this container using the following IP address and port:"
        ),
        _addons2.default.createElement(
          "table",
          { className: "table" },
          _addons2.default.createElement(
            "thead",
            null,
            _addons2.default.createElement(
              "tr",
              null,
              _addons2.default.createElement(
                "th",
                null,
                "DOCKER PORT"
              ),
              _addons2.default.createElement(
                "th",
                null,
                "ACCESS URL"
              )
            )
          ),
          _addons2.default.createElement(
            "tbody",
            null,
            ports
          )
        )
      )
    );
  }
});

module.exports = ContainerHomeIpPortsPreview;
