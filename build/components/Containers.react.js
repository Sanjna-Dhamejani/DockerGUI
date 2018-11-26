"use strict";

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _ContainerStore = require("../stores/ContainerStore");

var _ContainerStore2 = _interopRequireDefault(_ContainerStore);

var _ContainerList = require("./ContainerList.react");

var _ContainerList2 = _interopRequireDefault(_ContainerList);

var _Header = require("./Header.react");

var _Header2 = _interopRequireDefault(_Header);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _electron = require("electron");

var _DockerMachineUtil = require("../utils/DockerMachineUtil");

var _DockerMachineUtil2 = _interopRequireDefault(_DockerMachineUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Containers = _react2.default.createClass({
  displayName: "Containers",

  contextTypes: {
    router: _react2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    return {
      sidebarOffset: 0,
      containers: _ContainerStore2.default.getState().containers,
      sorted: this.sorted(_ContainerStore2.default.getState().containers)
    };
  },

  componentDidMount: function componentDidMount() {
    _ContainerStore2.default.listen(this.update);
  },

  componentWillUnmount: function componentWillUnmount() {
    _ContainerStore2.default.unlisten(this.update);
  },

  sorted: function sorted(containers) {
    return _underscore2.default.values(containers).sort(function (a, b) {
      if (a.Favorite && !b.Favorite) {
        return -1;
      } else if (!a.Favorite && b.Favorite) {
        return 1;
      } else {
        if (a.State.Downloading && !b.State.Downloading) {
          return -1;
        } else if (!a.State.Downloading && b.State.Downloading) {
          return 1;
        } else {
          if (a.State.Running && !b.State.Running) {
            return -1;
          } else if (!a.State.Running && b.State.Running) {
            return 1;
          } else {
            return a.Name.localeCompare(b.Name);
          }
        }
      }
    });
  },

  update: function update() {
    var containers = _ContainerStore2.default.getState().containers;
    var sorted = this.sorted(_ContainerStore2.default.getState().containers);

    var name = this.context.router.getCurrentParams().name;
    if (_ContainerStore2.default.getState().pending) {
      this.context.router.transitionTo("pull");
    } else if (name && !containers[name]) {
      if (sorted.length) {
        this.context.router.transitionTo("containerHome", {
          name: sorted[0].Name
        });
      } else {
        this.context.router.transitionTo("search");
      }
    }

    this.setState({
      containers: containers,
      sorted: sorted,
      pending: _ContainerStore2.default.getState().pending
    });
  },

  handleScroll: function handleScroll(e) {
    if (e.target.scrollTop > 0 && !this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: e.target.scrollTop
      });
    } else if (e.target.scrollTop === 0 && this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: 0
      });
    }
  },

  handleNewContainer: function handleNewContainer() {
    (0, _jquery2.default)(this.getDOMNode()).find(".new-container-item").parent().fadeIn();
    this.context.router.transitionTo("search");
    _MetricsUtil2.default.track("Pressed New Container");
  },

  handleClickPreferences: function handleClickPreferences() {
    _MetricsUtil2.default.track("Opened Preferences", {
      from: "app"
    });
    this.context.router.transitionTo("preferences");
  },

  handleClickDockerTerminal: function handleClickDockerTerminal() {
    _MetricsUtil2.default.track("Opened Docker Terminal", {
      from: "app"
    });
    _DockerMachineUtil2.default.dockerTerminal();
  },

  render: function render() {
    var sidebarHeaderClass = "sidebar-header";
    if (this.state.sidebarOffset) {
      sidebarHeaderClass += " sep";
    }

    var container = this.context.router.getCurrentParams().name ? this.state.containers[this.context.router.getCurrentParams().name] : {};
    return _react2.default.createElement(
      "div",
      { className: "containers" },
      _react2.default.createElement(_Header2.default, null),
      _react2.default.createElement(
        "div",
        { className: "containers-body" },
        _react2.default.createElement(
          "div",
          { className: "sidebar" },
          _react2.default.createElement(
            "section",
            { className: sidebarHeaderClass },
            _react2.default.createElement(
              "h4",
              null,
              "Containers"
            ),
            _react2.default.createElement(
              "div",
              { className: "create" },
              _react2.default.createElement(
                _reactRouter2.default.Link,
                { to: "search" },
                _react2.default.createElement(
                  "span",
                  { className: "btn btn-new btn-action has-icon btn-hollow" },
                  _react2.default.createElement("span", { className: "icon icon-add" }),
                  "New"
                )
              )
            )
          ),
          _react2.default.createElement(
            "section",
            {
              className: "sidebar-containers",
              onScroll: this.handleScroll
            },
            _react2.default.createElement(_ContainerList2.default, {
              containers: this.state.sorted,
              newContainer: this.state.newContainer
            })
          ),
          _react2.default.createElement(
            "section",
            { className: "sidebar-buttons" },
            _react2.default.createElement(
              "span",
              {
                className: "btn-sidebar btn-terminal",
                onClick: this.handleClickDockerTerminal
              },
              _react2.default.createElement("span", { className: "icon icon-docker-cli" }),
              _react2.default.createElement(
                "span",
                { className: "text" },
                "DOCKER CLI"
              )
            ),
            _react2.default.createElement(
              "span",
              {
                className: "btn-sidebar btn-preferences",
                onClick: this.handleClickPreferences
              },
              _react2.default.createElement("span", { className: "icon icon-preferences" })
            )
          )
        ),
        _react2.default.createElement(_reactRouter2.default.RouteHandler, {
          pending: this.state.pending,
          containers: this.state.containers,
          container: container
        })
      )
    );
  }
});

module.exports = Containers;
