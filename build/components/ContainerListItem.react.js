"use strict";

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _electron = require("electron");

var _electron2 = _interopRequireDefault(_electron);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _reactBootstrap = require("react-bootstrap");

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var dialog = remote.dialog;


var ContainerListItem = _addons2.default.createClass({
  displayName: "ContainerListItem",

  toggleFavoriteContainer: function toggleFavoriteContainer(e) {
    e.preventDefault();
    e.stopPropagation();
    _ContainerActions2.default.toggleFavorite(this.props.container.Name);
  },
  handleDeleteContainer: function handleDeleteContainer(e) {
    e.preventDefault();
    e.stopPropagation();
    dialog.showMessageBox({
      message: "Are you sure you want to stop & remove this container?",
      buttons: ["Remove", "Cancel"]
    }, function (index) {
      if (index === 0) {
        _MetricsUtil2.default.track("Deleted Container", {
          from: "list",
          type: "existing"
        });
        _ContainerActions2.default.destroy(this.props.container.Name);
      }
    }.bind(this));
  },
  render: function render() {
    var self = this;
    var container = this.props.container;
    var imageNameTokens = container.Config.Image.split("/");
    var repo;
    if (imageNameTokens.length > 1) {
      repo = imageNameTokens[1];
    } else {
      repo = imageNameTokens[0];
    }
    var imageName = _addons2.default.createElement(
      _reactBootstrap.OverlayTrigger,
      {
        placement: "bottom",
        overlay: _addons2.default.createElement(
          _reactBootstrap.Tooltip,
          null,
          container.Config.Image
        )
      },
      _addons2.default.createElement(
        "span",
        null,
        repo
      )
    );

    // Synchronize all animations
    var style = {
      WebkitAnimationDelay: 0 + "ms"
    };

    var state;
    if (container.State.Downloading) {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        {
          placement: "bottom",
          overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Downloading"
          )
        },
        _addons2.default.createElement(
          "div",
          { className: "state state-downloading" },
          _addons2.default.createElement("div", { style: style, className: "downloading-arrow" })
        )
      );
    } else if (container.State.Running && !container.State.Paused) {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: "bottom", overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Running"
          ) },
        _addons2.default.createElement(
          "div",
          { className: "state state-running" },
          _addons2.default.createElement("div", { style: style, className: "runningwave" })
        )
      );
    } else if (container.State.Restarting) {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        {
          placement: "bottom",
          overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Restarting"
          )
        },
        _addons2.default.createElement("div", { className: "state state-restarting", style: style })
      );
    } else if (container.State.Paused) {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: "bottom", overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Paused"
          ) },
        _addons2.default.createElement("div", { className: "state state-paused" })
      );
    } else if (container.State.ExitCode) {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: "bottom", overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Stopped"
          ) },
        _addons2.default.createElement("div", { className: "state state-stopped" })
      );
    } else {
      state = _addons2.default.createElement(
        _reactBootstrap.OverlayTrigger,
        { placement: "bottom", overlay: _addons2.default.createElement(
            _reactBootstrap.Tooltip,
            null,
            "Stopped"
          ) },
        _addons2.default.createElement("div", { className: "state state-stopped" })
      );
    }

    return _addons2.default.createElement(
      _reactRouter2.default.Link,
      { to: "container", params: { name: container.Name } },
      _addons2.default.createElement(
        "li",
        {
          onMouseEnter: self.handleItemMouseEnter,
          onMouseLeave: self.handleItemMouseLeave,
          onClick: self.handleClick,
          id: this.props.key
        },
        state,
        _addons2.default.createElement(
          "div",
          { className: "info" },
          _addons2.default.createElement(
            "div",
            { className: "name" },
            container.Name
          ),
          _addons2.default.createElement(
            "div",
            { className: "image" },
            imageName
          )
        ),
        _addons2.default.createElement(
          "div",
          { className: "action" },
          _addons2.default.createElement(
            "span",
            {
              className: container.Favorite ? "btn circular favorite" : "btn circular",
              onClick: this.toggleFavoriteContainer
            },
            _addons2.default.createElement("span", { className: "icon icon-favorite" })
          ),
          _addons2.default.createElement(
            "span",
            { className: "btn circular", onClick: this.handleDeleteContainer },
            _addons2.default.createElement("span", { className: "icon icon-delete" })
          )
        )
      )
    );
  }
});

module.exports = ContainerListItem;
