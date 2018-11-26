'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _AccountActions = require('../actions/AccountActions');

var _AccountActions2 = _interopRequireDefault(_AccountActions);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _addons2.default.createClass({
  displayName: 'exports',

  mixins: [_reactRouter2.default.Navigation, _addons2.default.addons.LinkedStateMixin],

  getInitialState: function getInitialState() {
    return {
      username: '',
      password: '',
      errors: {}
    };
  },

  componentDidMount: function componentDidMount() {
    _addons2.default.findDOMNode(this.refs.usernameInput).focus();
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errors });
  },

  validate: function validate() {
    var errors = {};

    if (_validator2.default.isEmail(this.state.username)) {
      errors.username = 'Must be a valid username (not an email)';
    } else if (!_validator2.default.isLowercase(this.state.username) || !_validator2.default.isAlphanumeric(this.state.username) || !_validator2.default.isLength(this.state.username, 4, 30)) {
      errors.username = 'Must be 4-30 lower case letters or numbers';
    }

    if (!_validator2.default.isLength(this.state.password, 5)) {
      errors.password = 'Must be at least 5 characters long';
    }

    return errors;
  },

  handleBlur: function handleBlur() {
    var _this = this;

    this.setState({ errors: _underscore2.default.omit(this.validate(), function (val, key) {
        return !_this.state[key].length;
      }) });
  },

  handleLogin: function handleLogin() {
    var errors = this.validate();
    this.setState({ errors: errors });

    if (_underscore2.default.isEmpty(errors)) {
      _AccountActions2.default.login(this.state.username, this.state.password);
      _MetricsUtil2.default.track('Clicked Log In');
    }
  },

  handleClickSignup: function handleClickSignup() {
    if (!this.props.loading) {
      this.replaceWith('signup');
      _MetricsUtil2.default.track('Switched to Sign Up');
    }
  },

  handleClickForgotPassword: function handleClickForgotPassword() {
    _electron.shell.openExternal('https://hub.docker.com/reset-password/');
  },

  render: function render() {
    var loading = this.props.loading ? _addons2.default.createElement(
      'div',
      { className: 'spinner la-ball-clip-rotate la-dark' },
      _addons2.default.createElement('div', null)
    ) : null;
    return _addons2.default.createElement(
      'form',
      { className: 'form-connect' },
      _addons2.default.createElement('input', { ref: 'usernameInput', maxLength: '30', name: 'username', placeholder: 'Username', type: 'text', disabled: this.props.loading, valueLink: this.linkState('username'), onBlur: this.handleBlur }),
      _addons2.default.createElement(
        'p',
        { className: 'error-message' },
        this.state.errors.username
      ),
      _addons2.default.createElement('input', { ref: 'passwordInput', name: 'password', placeholder: 'Password', type: 'password', disabled: this.props.loading, valueLink: this.linkState('password'), onBlur: this.handleBlur }),
      _addons2.default.createElement(
        'p',
        { className: 'error-message' },
        this.state.errors.password
      ),
      _addons2.default.createElement(
        'a',
        { className: 'link', onClick: this.handleClickForgotPassword },
        'Forgot your password?'
      ),
      _addons2.default.createElement(
        'p',
        { className: 'error-message' },
        this.state.errors.detail
      ),
      _addons2.default.createElement(
        'div',
        { className: 'submit' },
        loading,
        _addons2.default.createElement(
          'button',
          { className: 'btn btn-action', disabled: this.props.loading, onClick: this.handleLogin, type: 'submit' },
          'Log In'
        )
      ),
      _addons2.default.createElement('br', null),
      _addons2.default.createElement(
        'div',
        { className: 'extra' },
        'Don\'t have an account yet? ',
        _addons2.default.createElement(
          'a',
          { disabled: this.state.loading, onClick: this.handleClickSignup },
          'Sign Up'
        )
      )
    );
  }
});
