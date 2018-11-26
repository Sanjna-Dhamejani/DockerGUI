"use strict";

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerSettings = _addons2.default.createClass({
  displayName: "ContainerSettings",

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },
  componentWillReceiveProps: function componentWillReceiveProps() {
    this.init();
  },
  componentDidMount: function componentDidMount() {
    this.init();
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
    (0, _jquery2.default)(".settings-panel").height(window.innerHeight - 210);
  },
  init: function init() {
    var currentRoute = _underscore2.default.last(this.context.router.getCurrentRoutes()).name;
    if (currentRoute === "containerSettings") {
      this.context.router.transitionTo("containerSettingsGeneral", {
        name: this.context.router.getCurrentParams().name
      });
    }
  },
  render: function render() {
    var container = this.props.container;
    if (!container) {
      return _addons2.default.createElement("div", null);
    }
    return _addons2.default.createElement("div", { className: "details-panel" });
  }
});

module.exports = ContainerSettings;
