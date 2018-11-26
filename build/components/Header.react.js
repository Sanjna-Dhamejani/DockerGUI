"use strict";

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRetinaImage = require("react-retina-image");

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _Util = require("../utils/Util");

var _Util2 = _interopRequireDefault(_Util);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _electron = require("electron");

var _electron2 = _interopRequireDefault(_electron);

var _AccountStore = require("../stores/AccountStore");

var _AccountStore2 = _interopRequireDefault(_AccountStore);

var _AccountActions = require("../actions/AccountActions");

var _AccountActions2 = _interopRequireDefault(_AccountActions);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;


var Header = _addons2.default.createClass({
  displayName: "Header",

  mixins: [_reactRouter2.default.Navigation],
  getInitialState: function getInitialState() {
    return {
      fullscreen: false,
      updateAvailable: false,
      username: _AccountStore2.default.getState().username,
      verified: _AccountStore2.default.getState().verified
    };
  },
  componentDidMount: function componentDidMount() {
    document.addEventListener("keyup", this.handleDocumentKeyUp, false);

    _AccountStore2.default.listen(this.update);
  },
  componentWillUnmount: function componentWillUnmount() {
    document.removeEventListener("keyup", this.handleDocumentKeyUp, false);
    _AccountStore2.default.unlisten(this.update);
  },
  update: function update() {
    var accountState = _AccountStore2.default.getState();
    this.setState({
      username: accountState.username,
      verified: accountState.verified
    });
  },
  handleDocumentKeyUp: function handleDocumentKeyUp(e) {
    if (e.keyCode === 27 && remote.getCurrentWindow().isFullScreen()) {
      remote.getCurrentWindow().setFullScreen(false);
      this.forceUpdate();
    }
  },
  handleClose: function handleClose() {
    if (_Util2.default.isWindows() || _Util2.default.isLinux()) {
      remote.getCurrentWindow().close();
    } else {
      remote.getCurrentWindow().hide();
    }
  },
  handleMinimize: function handleMinimize() {
    remote.getCurrentWindow().minimize();
  },
  handleFullscreen: function handleFullscreen() {
    if (_Util2.default.isWindows()) {
      if (remote.getCurrentWindow().isMaximized()) {
        remote.getCurrentWindow().unmaximize();
      } else {
        remote.getCurrentWindow().maximize();
      }
      this.setState({
        fullscreen: remote.getCurrentWindow().isMaximized()
      });
    } else {
      remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen());
      this.setState({
        fullscreen: remote.getCurrentWindow().isFullScreen()
      });
    }
  },
  handleFullscreenHover: function handleFullscreenHover() {
    this.update();
  },
  handleUserClick: function handleUserClick(e) {
    var menu = new Menu();

    if (!this.state.verified) {
      menu.append(new MenuItem({
        label: "I've Verified My Email Address",
        click: this.handleVerifyClick
      }));
    }

    menu.append(new MenuItem({ label: "Sign Out", click: this.handleLogoutClick }));
    menu.popup(remote.getCurrentWindow(), e.currentTarget.offsetLeft, e.currentTarget.offsetTop + e.currentTarget.clientHeight + 10);
  },
  handleLoginClick: function handleLoginClick() {
    this.transitionTo("login");
    _MetricsUtil2.default.track("Opened Log In Screen");
  },
  handleLogoutClick: function handleLogoutClick() {
    _MetricsUtil2.default.track("Logged Out");
    _AccountActions2.default.logout();
  },
  handleVerifyClick: function handleVerifyClick() {
    _MetricsUtil2.default.track("Verified Account", {
      from: "header"
    });
    _AccountActions2.default.verify();
  },
  renderLogo: function renderLogo() {
    return _addons2.default.createElement(
      "div",
      { className: "logo" },
      _addons2.default.createElement(_reactRetinaImage2.default, {
        src: "iconMain.png",
        style: { width: "60px", height: "50px" }
      })
    );
  },
  renderWindowButtons: function renderWindowButtons() {
    var buttons = void 0;
    if (_Util2.default.isWindows()) {
      buttons = _addons2.default.createElement(
        "div",
        { className: "windows-buttons" },
        _addons2.default.createElement(
          "div",
          {
            className: "windows-button button-minimize enabled",
            onClick: this.handleMinimize
          },
          _addons2.default.createElement("div", { className: "icon" })
        ),
        _addons2.default.createElement(
          "div",
          {
            className: "windows-button " + (this.state.fullscreen ? "button-fullscreenclose" : "button-fullscreen") + " enabled",
            onClick: this.handleFullscreen
          },
          _addons2.default.createElement("div", { className: "icon" })
        ),
        _addons2.default.createElement("div", {
          className: "windows-button button-close enabled",
          onClick: this.handleClose
        })
      );
    } else {
      buttons = _addons2.default.createElement(
        "div",
        { className: "buttons" },
        _addons2.default.createElement("div", {
          className: "button button-close enabled",
          onClick: this.handleClose
        }),
        _addons2.default.createElement("div", {
          className: "button button-minimize enabled",
          onClick: this.handleMinimize
        }),
        _addons2.default.createElement("div", {
          className: "button button-fullscreen enabled",
          onClick: this.handleFullscreen
        })
      );
    }
    return buttons;
  },
  renderDashboardHeader: function renderDashboardHeader() {
    var headerClasses = (0, _classnames2.default)({
      bordered: !this.props.hideLogin,
      header: true,
      "no-drag": true
    });
    var username = void 0;
    if (this.props.hideLogin) {
      username = null;
    } else if (this.state.username) {
      username = _addons2.default.createElement(
        "div",
        { className: "login-wrapper" },
        _addons2.default.createElement(
          "div",
          { className: "login no-drag", onClick: this.handleUserClick },
          _addons2.default.createElement("span", { className: "icon icon-user" }),
          _addons2.default.createElement(
            "span",
            { className: "text" },
            this.state.username,
            this.state.verified ? null : "(Unverified)"
          ),
          _addons2.default.createElement(_reactRetinaImage2.default, { src: "userdropdown.png" })
        )
      );
    } else {
      username = _addons2.default.createElement(
        "div",
        { className: "login-wrapper" },
        _addons2.default.createElement(
          "div",
          { className: "login no-drag", onClick: this.handleLoginClick },
          _addons2.default.createElement("span", { className: "icon icon-user" }),
          " LOGIN"
        )
      );
    }
    return _addons2.default.createElement(
      "div",
      { className: headerClasses },
      _addons2.default.createElement(
        "div",
        { className: "left-header" },
        _Util2.default.isWindows() ? this.renderLogo() : this.renderWindowButtons(),
        username
      ),
      _addons2.default.createElement(
        "div",
        { className: "right-header" },
        _Util2.default.isWindows() ? this.renderWindowButtons() : this.renderLogo()
      )
    );
  },
  renderBasicHeader: function renderBasicHeader() {
    var headerClasses = (0, _classnames2.default)({
      bordered: !this.props.hideLogin,
      header: true,
      "no-drag": true
    });
    return _addons2.default.createElement(
      "div",
      { className: headerClasses },
      _addons2.default.createElement(
        "div",
        { className: "left-header" },
        _Util2.default.isWindows() ? null : this.renderWindowButtons()
      ),
      _addons2.default.createElement(
        "div",
        { className: "right-header" },
        _Util2.default.isWindows() ? this.renderWindowButtons() : null
      )
    );
  },
  render: function render() {
    if (this.props.hideLogin) {
      return this.renderBasicHeader();
    } else {
      return this.renderDashboardHeader();
    }
  }
});

module.exports = Header;
