'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;

var Preferences = _addons2.default.createClass({
  displayName: 'Preferences',

  mixins: [_reactRouter2.default.Navigation],
  getInitialState: function getInitialState() {
    return {
      closeVMOnQuit: localStorage.getItem('settings.closeVMOnQuit') === 'true',
      useVM: localStorage.getItem('settings.useVM') === 'true',
      metricsEnabled: _MetricsUtil2.default.enabled(),
      terminalShell: localStorage.getItem('settings.terminalShell') || "sh",
      startLinkedContainers: localStorage.getItem('settings.startLinkedContainers') === 'true'
    };
  },
  handleGoBackClick: function handleGoBackClick() {
    this.goBack();
    _MetricsUtil2.default.track('Went Back From Preferences');
  },
  handleChangeCloseVMOnQuit: function handleChangeCloseVMOnQuit(e) {
    var checked = e.target.checked;
    this.setState({
      closeVMOnQuit: checked
    });
    localStorage.setItem('settings.closeVMOnQuit', checked);
    _MetricsUtil2.default.track('Toggled Close VM On Quit', {
      close: checked
    });
  },
  handleChangeUseVM: function handleChangeUseVM(e) {
    var checked = e.target.checked;
    this.setState({
      useVM: checked
    });
    localStorage.setItem('settings.useVM', checked);
    _Util2.default.isNative();
    _MetricsUtil2.default.track('Toggled VM or Native settting', {
      vm: checked
    });
  },
  handleChangeMetricsEnabled: function handleChangeMetricsEnabled(e) {
    var checked = e.target.checked;
    this.setState({
      metricsEnabled: checked
    });
    _MetricsUtil2.default.setEnabled(checked);
    _MetricsUtil2.default.track('Toggled util/MetricsUtil', {
      enabled: checked
    });
  },
  handleChangeTerminalShell: function handleChangeTerminalShell(e) {
    var value = e.target.value;
    this.setState({
      terminalShell: value
    });
    localStorage.setItem('settings.terminalShell', value);
  },
  handleChangeStartLinkedContainers: function handleChangeStartLinkedContainers(e) {
    var checked = e.target.checked;
    this.setState({
      startLinkedContainers: checked
    });
    localStorage.setItem('settings.startLinkedContainers', checked ? 'true' : 'false');
  },
  render: function render() {
    var vmSettings, vmShutdown, nativeSetting;

    if (process.platform !== 'linux') {
      // We are on a Mac or Windows
      if (_Util2.default.isNative() || localStorage.getItem('settings.useVM') === 'true') {
        nativeSetting = _addons2.default.createElement(
          'div',
          { className: 'option' },
          _addons2.default.createElement(
            'div',
            { className: 'option-name' },
            _addons2.default.createElement(
              'label',
              { htmlFor: 'useVM' },
              'Use VirtualBox instead of Native on next restart'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'option-value' },
            _addons2.default.createElement('input', { id: 'useVM', type: 'checkbox', checked: this.state.useVM, onChange: this.handleChangeUseVM })
          )
        );
      }
      if (!_Util2.default.isNative()) {
        vmShutdown = _addons2.default.createElement(
          'div',
          { className: 'option' },
          _addons2.default.createElement(
            'div',
            { className: 'option-name' },
            _addons2.default.createElement(
              'label',
              { htmlFor: 'closeVMOnQuit' },
              'Shutdown Linux VM on closing Kitematic'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'option-value' },
            _addons2.default.createElement('input', { id: 'closeVMOnQuit', type: 'checkbox', checked: this.state.closeVMOnQuit, onChange: this.handleChangeCloseVMOnQuit })
          )
        );
      }

      vmSettings = _addons2.default.createElement(
        'div',
        null,
        _addons2.default.createElement(
          'div',
          { className: 'title' },
          'VM Settings'
        ),
        vmShutdown,
        nativeSetting
      );
    }

    return _addons2.default.createElement(
      'div',
      { className: 'preferences' },
      _addons2.default.createElement(
        'div',
        { className: 'preferences-content' },
        _addons2.default.createElement(
          'a',
          { onClick: this.handleGoBackClick },
          'Go Back'
        ),
        vmSettings,
        _addons2.default.createElement(
          'div',
          { className: 'title' },
          'App Settings'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'option' },
          _addons2.default.createElement(
            'div',
            { className: 'option-name' },
            _addons2.default.createElement(
              'label',
              { htmlFor: 'metricsEnabled' },
              'Report anonymous usage analytics'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'option-value' },
            _addons2.default.createElement('input', { id: 'metricsEnabled', type: 'checkbox', checked: this.state.metricsEnabled, onChange: this.handleChangeMetricsEnabled })
          )
        ),
        _addons2.default.createElement(
          'div',
          { className: 'option' },
          _addons2.default.createElement(
            'div',
            { className: 'option-name' },
            _addons2.default.createElement(
              'label',
              { htmlFor: 'terminalShell' },
              'Exec command shell'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'option-value' },
            _addons2.default.createElement(
              'select',
              { id: 'terminalShell', value: this.state.terminalShell, onChange: this.handleChangeTerminalShell },
              _addons2.default.createElement(
                'option',
                { value: 'sh' },
                'sh'
              ),
              _addons2.default.createElement(
                'option',
                { value: 'bash' },
                'bash'
              )
            )
          )
        ),
        _addons2.default.createElement(
          'div',
          { className: 'option' },
          _addons2.default.createElement(
            'div',
            { className: 'option-name' },
            _addons2.default.createElement(
              'label',
              { htmlFor: 'startLinkedContainers' },
              'Start linked containers'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'option-value' },
            _addons2.default.createElement('input', { id: 'startLinkedContainers', type: 'checkbox', checked: this.state.startLinkedContainers, onChange: this.handleChangeStartLinkedContainers })
          )
        )
      )
    );
  }
});

module.exports = Preferences;
