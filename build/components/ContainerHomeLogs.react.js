"use strict";

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _ansiToHtml = require("ansi-to-html");

var _ansiToHtml2 = _interopRequireDefault(_ansiToHtml);

var _fs = require("fs");

var fs = _interopRequireWildcard(_fs);

var _electron = require("electron");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dialog = _electron.remote.dialog;

var escape = function escape(html) {
  var text = document.createTextNode(html);
  var div = document.createElement("div");
  div.appendChild(text);
  return div.innerHTML;
};

var FontSelect = _addons2.default.createClass({
  displayName: "FontSelect",

  getFontSizes: function getFontSizes(start, end) {
    var options = [];
    for (var i = start; i <= end; i++) {
      options.push(_addons2.default.createElement(
        "option",
        { key: i, value: i },
        i + " px"
      ));
    }
    return options;
  },

  render: function render() {
    return _addons2.default.createElement(
      "select",
      {
        className: "logs-font-size__select",
        value: this.props.fontSize,
        onChange: this.props.onChange
      },
      _addons2.default.createElement(
        "option",
        { disabled: "true" },
        "Font size"
      ),
      this.getFontSizes(10, 30)
    );
  }
});

var convert = new _ansiToHtml2.default();
var prevBottom = 0;

module.exports = _addons2.default.createClass({
  displayName: "exports",

  getInitialState: function getInitialState() {
    return {
      fontSize: 10,
      follow: true
    };
  },
  onFontChange: function onFontChange(event) {
    var $target = event.target;
    this.setState(function (prevState) {
      return {
        fontSize: $target.value,
        follow: prevState.follow
      };
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    var node = (0, _jquery2.default)(".logs").get()[0];
    if (this.state.follow) {
      node.scrollTop = node.scrollHeight;
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.props.container && nextProps.container && this.props.container.Name !== nextProps.container.Name) {
      _ContainerActions2.default.active(nextProps.container.Name);
    }
  },

  componentDidMount: function componentDidMount() {
    _ContainerActions2.default.active(this.props.container.Name);
  },

  componentWillUnmount: function componentWillUnmount() {
    _ContainerActions2.default.active(null);
  },

  toggleFollow: function toggleFollow() {
    this.setState(function (prevState) {
      return {
        fontSize: prevState.fontsize,
        follow: !prevState.follow
      };
    });
  },

  render: function render() {
    var _this = this;

    var _logs = "";
    var logs = this.props.container.Logs ? this.props.container.Logs.map(function (l, index) {
      var key = _this.props.container.Name + "-" + index;
      _logs = _logs.concat(l.substr(l.indexOf(" ") + 1).replace(/\[\d+m/g, "").concat("\n"));
      return _addons2.default.createElement("div", {
        key: key,
        dangerouslySetInnerHTML: {
          __html: convert.toHtml(escape(l.substr(l.indexOf(" ") + 1)).replace(/ /g, "&nbsp;<wbr>"))
        }
      });
    }) : ["0 No logs for this container."];

    var copyLogs = function copyLogs(event) {
      _electron.clipboard.writeText(_logs);

      var btn = event.target;
      btn.innerHTML = "Copied !";
      btn.style.color = "#FFF";
      setTimeout(function () {
        btn.style.color = "inherit";
        btn.innerHTML = "Copy";
      }, 1000);
    };

    var saveLogs = function saveLogs(event) {
      //create default filename with timestamp
      var path = _this.props.container.Name + " " + new Date().toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/:/g, "-") + ".txt";
      dialog.showSaveDialog({
        defaultPath: path
      }, function (fileName) {
        if (!fileName) return;
        fs.writeFile(fileName, _logs, function (err) {
          if (!err) {
            _electron.shell.showItemInFolder(fileName);
          } else {
            dialog.showErrorBox("Oops! an error occured", err.message);
          }
        });
      });
    };

    return _addons2.default.createElement(
      "div",
      { className: "mini-logs wrapper" },
      _addons2.default.createElement(
        "div",
        { className: "widget" },
        _addons2.default.createElement(
          "div",
          { className: "top-bar" },
          _addons2.default.createElement(
            "div",
            { className: "text" },
            "Container Logs"
          )
        ),
        _addons2.default.createElement(
          "div",
          {
            className: "logs",
            style: { fontSize: this.state.fontSize + "px" }
          },
          logs
        )
      )
    );
  }
});
