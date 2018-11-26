"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _reactRetinaImage = require("react-retina-image");

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _Header = require("./Header.react");

var _Header2 = _interopRequireDefault(_Header);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _AccountStore = require("../stores/AccountStore");

var _AccountStore2 = _interopRequireDefault(_AccountStore);

var _AccountActions = require("../actions/AccountActions");

var _AccountActions2 = _interopRequireDefault(_AccountActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _addons2.default.createClass({
  displayName: "exports",

  mixins: [_reactRouter2.default.Navigation],

  getInitialState: function getInitialState() {
    return _AccountStore2.default.getState();
  },

  componentDidMount: function componentDidMount() {
    document.addEventListener("keyup", this.handleDocumentKeyUp, false);
    _AccountStore2.default.listen(this.update);
  },

  componentWillUnmount: function componentWillUnmount() {
    document.removeEventListener("keyup", this.handleDocumentKeyUp, false);
    _AccountStore2.default.unlisten(this.update);
  },

  componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
    if (!this.state.username && nextState.username) {
      if (nextState.prompted) {
        this.goBack();
      } else {
        this.transitionTo("search");
      }
    }
  },

  handleSkip: function handleSkip() {
    _AccountActions2.default.skip();
    this.transitionTo("search");
    _MetricsUtil2.default.track("Skipped Login");
  },

  handleClose: function handleClose() {
    this.goBack();
    _MetricsUtil2.default.track("Closed Login");
  },

  update: function update() {
    this.setState(_AccountStore2.default.getState());
  },

  render: function render() {
    var close = this.state.prompted ? _addons2.default.createElement(
      "a",
      {
        className: "btn btn-action btn-close",
        disabled: this.state.loading,
        onClick: this.handleClose
      },
      "Close"
    ) : _addons2.default.createElement(
      "a",
      {
        className: "btn btn-action btn-skip",
        disabled: this.state.loading,
        onClick: this.handleSkip
      },
      "Skip For Now"
    );

    return _addons2.default.createElement(
      "div",
      { className: "setup" },
      _addons2.default.createElement(_Header2.default, { hideLogin: true }),
      _addons2.default.createElement(
        "div",
        { className: "setup-content" },
        close,
        _addons2.default.createElement(
          "div",
          { className: "form-section" },
          _addons2.default.createElement(_reactRetinaImage2.default, {
            src: "connect-to-hub.png",
            checkIfRetinaImgExists: false
          }),
          _addons2.default.createElement(_reactRouter2.default.RouteHandler, (0, _extends3.default)({
            errors: this.state.errors,
            loading: this.state.loading
          }, this.props))
        ),
        _addons2.default.createElement(
          "div",
          { className: "desc" },
          _addons2.default.createElement(
            "div",
            { className: "content" },
            _addons2.default.createElement(
              "h1",
              null,
              "Connect to Docker Hub"
            ),
            _addons2.default.createElement(
              "p",
              null,
              "Pull and run private Docker Hub images by connecting your Docker Hub account to Docker GUI."
            )
          )
        )
      )
    );
  }
});
