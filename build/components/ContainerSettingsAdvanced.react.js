'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerUtil = require('../utils/ContainerUtil');

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _ContainerActions = require('../actions/ContainerActions');

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerSettingsAdvanced = _addons2.default.createClass({
  displayName: 'ContainerSettingsAdvanced',

  mixins: [_addons2.default.addons.LinkedStateMixin],

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    var _ref = _ContainerUtil2.default.mode(this.props.container) || [true, true, false, { MaximumRetryCount: 0, Name: 'no' }],
        _ref2 = (0, _slicedToArray3.default)(_ref, 4),
        tty = _ref2[0],
        openStdin = _ref2[1],
        privileged = _ref2[2],
        restartPolicy = _ref2[3];

    return {
      tty: tty,
      openStdin: openStdin,
      privileged: privileged,
      restartPolicy: restartPolicy.Name === 'always'
    };
  },

  handleSaveAdvancedOptions: function handleSaveAdvancedOptions() {
    _MetricsUtil2.default.track('Saved Advanced Options');
    var tty = this.state.tty;
    var openStdin = this.state.openStdin;
    var privileged = this.state.privileged;
    var restartPolicy = this.state.restartPolicy ? { MaximumRetryCount: 0, Name: 'always' } : { MaximumRetryCount: 0, Name: 'no' };
    var hostConfig = _underscore2.default.extend(this.props.container.HostConfig, { Privileged: privileged, RestartPolicy: restartPolicy });
    _ContainerActions2.default.update(this.props.container.Name, { Tty: tty, OpenStdin: openStdin, HostConfig: hostConfig });
  },

  handleChangeTty: function handleChangeTty() {
    this.setState({
      tty: !this.state.tty
    });
  },

  handleChangeOpenStdin: function handleChangeOpenStdin() {
    this.setState({
      openStdin: !this.state.openStdin
    });
  },

  handleChangePrivileged: function handleChangePrivileged() {
    this.setState({
      privileged: !this.state.privileged
    });
  },

  handleChangeRestartPolicy: function handleChangeRestartPolicy() {
    this.setState({
      restartPolicy: !this.state.restartPolicy
    });
  },

  render: function render() {
    if (!this.props.container) {
      return false;
    }

    return _addons2.default.createElement(
      'div',
      { className: 'settings-panel' },
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Advanced Options'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'checkboxes' },
          _addons2.default.createElement(
            'p',
            null,
            _addons2.default.createElement(
              'label',
              null,
              _addons2.default.createElement('input', { type: 'checkbox', checked: this.state.tty, onChange: this.handleChangeTty }),
              'Allocate a TTY for this container'
            )
          ),
          _addons2.default.createElement(
            'p',
            null,
            _addons2.default.createElement(
              'label',
              null,
              _addons2.default.createElement('input', { type: 'checkbox', checked: this.state.openStdin, onChange: this.handleChangeOpenStdin }),
              'Keep STDIN open even if not attached'
            )
          ),
          _addons2.default.createElement(
            'p',
            null,
            _addons2.default.createElement(
              'label',
              null,
              _addons2.default.createElement('input', { type: 'checkbox', checked: this.state.privileged, onChange: this.handleChangePrivileged }),
              'Privileged mode'
            )
          ),
          _addons2.default.createElement(
            'p',
            null,
            _addons2.default.createElement(
              'label',
              null,
              _addons2.default.createElement('input', { type: 'checkbox', checked: this.state.restartPolicy, onChange: this.handleChangeRestartPolicy }),
              'Enable \'always\' restart policy'
            )
          )
        ),
        _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', disabled: this.props.container.State.Updating, onClick: this.handleSaveAdvancedOptions },
          'Save'
        )
      )
    );
  }
});

module.exports = ContainerSettingsAdvanced;
