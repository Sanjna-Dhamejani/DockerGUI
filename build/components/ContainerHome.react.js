"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _ContainerProgress = require("./ContainerProgress.react");

var _ContainerProgress2 = _interopRequireDefault(_ContainerProgress);

var _ContainerHomePreview = require("./ContainerHomePreview.react");

var _ContainerHomePreview2 = _interopRequireDefault(_ContainerHomePreview);

var _ContainerHomeLogs = require("./ContainerHomeLogs.react");

var _ContainerHomeLogs2 = _interopRequireDefault(_ContainerHomeLogs);

var _ContainerHomeFolders = require("./ContainerHomeFolders.react");

var _ContainerHomeFolders2 = _interopRequireDefault(_ContainerHomeFolders);

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerHome = _addons2.default.createClass({
  displayName: "ContainerHome",

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  componentDidMount: function componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  },

  componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },

  componentDidUpdate: function componentDidUpdate() {
    this.handleResize();
  },

  handleResize: function handleResize() {
    (0, _jquery2.default)(".full .wrapper").height(window.innerHeight - 132);
    (0, _jquery2.default)(".left .wrapper").height(window.innerHeight - 132);
    (0, _jquery2.default)(".right .wrapper").height(window.innerHeight / 2 - 55);
  },

  showWeb: function showWeb() {
    return _underscore2.default.keys(this.props.ports).length > 0;
  },

  showFolders: function showFolders() {
    return this.props.container.Mounts && this.props.container.Mounts.length > 0 && this.props.container.State.Running;
  },

  render: function render() {
    if (!this.props.container) {
      return "";
    }

    var body = void 0;
    if (this.props.container.Error) {
      var error = this.props.container.Error.message;
      if (!error) {
        error = this.props.container.Error;
      } else {
        if (error.indexOf("ETIMEDOUT") !== -1) {
          error = 'Timeout error - Try and restart your VM by running: \n"docker-machine restart default" in a terminal';
        }
        if (error.indexOf("ECONNREFUSED") !== -1) {
          error = 'Is your VM up and running? Check that "docker ps" works in a terminal.';
        }
      }
      body = _addons2.default.createElement(
        "div",
        { className: "details-progress error" },
        _addons2.default.createElement(
          "h2",
          null,
          "We are sorry. There seems to be an error:"
        ),
        error.split("\n").map(function (i) {
          return _addons2.default.createElement(
            "p",
            { className: "error-message" },
            i
          );
        })
      );
    } else if (this.props.container && this.props.container.State.Downloading) {
      if (this.props.container.Progress) {
        var values = [];
        var sum = 0.0;

        for (var i = 0; i < this.props.container.Progress.amount; i++) {
          values.push(Math.round(this.props.container.Progress.progress[i].value));
          sum += this.props.container.Progress.progress[i].value;
        }

        sum = sum / this.props.container.Progress.amount;
        if (isNaN(sum)) {
          sum = 0;
        }

        var total = (Math.round(sum * 100) / 100).toFixed(2);

        body = _addons2.default.createElement(
          "div",
          { className: "details-progress" },
          _addons2.default.createElement(
            "h2",
            null,
            total >= 100 ? "Creating Container" : "Downloading Image"
          ),
          _addons2.default.createElement(
            "h2",
            null,
            total,
            "%"
          )
        );
      } else if (this.props.container.State.Waiting) {
        body = _addons2.default.createElement(
          "div",
          { className: "details-progress" },
          _addons2.default.createElement(
            "h2",
            null,
            "Waiting For Another Download"
          ),
          _addons2.default.createElement(
            "div",
            { className: "spinner la-ball-clip-rotate la-lg la-dark" },
            _addons2.default.createElement("div", null)
          )
        );
      } else {
        body = _addons2.default.createElement(
          "div",
          { className: "details-progress" },
          _addons2.default.createElement(
            "h2",
            null,
            "Connecting to Docker Hub"
          ),
          _addons2.default.createElement(
            "div",
            { className: "spinner la-ball-clip-rotate la-lg la-dark" },
            _addons2.default.createElement("div", null)
          )
        );
      }
    } else {
      var logWidget = _addons2.default.createElement(_ContainerHomeLogs2.default, { container: this.props.container });
      var webWidget;
      if (this.showWeb()) {
        webWidget = _addons2.default.createElement(_ContainerHomePreview2.default, {
          ports: this.props.ports,
          defaultPort: this.props.defaultPort
        });
      }
      var folderWidget;
      if (this.showFolders()) {
        folderWidget = _addons2.default.createElement(_ContainerHomeFolders2.default, { container: this.props.container });
      }
      if (logWidget && !webWidget && !folderWidget) {
        body = _addons2.default.createElement(
          "div",
          { className: "details-panel home" },
          _addons2.default.createElement(
            "div",
            { className: "content" },
            _addons2.default.createElement(
              "div",
              { className: "full" },
              logWidget
            )
          )
        );
      } else {
        body = _addons2.default.createElement(
          "div",
          { className: "details-panel home" },
          _addons2.default.createElement(
            "div",
            { className: "content" },
            _addons2.default.createElement(
              "div",
              { className: "left" },
              logWidget
            ),
            _addons2.default.createElement(
              "div",
              { className: "right" },
              webWidget,
              folderWidget
            )
          )
        );
      }
    }
    return body;
  }
});

module.exports = ContainerHome;
