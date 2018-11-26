'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _RadialReact = require('./Radial.react.js');

var _RadialReact2 = _interopRequireDefault(_RadialReact);

var _reactRetinaImage = require('react-retina-image');

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _Header = require('./Header.react');

var _Header2 = _interopRequireDefault(_Header);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _SetupStore = require('../stores/SetupStore');

var _SetupStore2 = _interopRequireDefault(_SetupStore);

var _SetupActions = require('../actions/SetupActions');

var _SetupActions2 = _interopRequireDefault(_SetupActions);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Setup = _addons2.default.createClass({
  displayName: 'Setup',

  mixins: [_reactRouter2.default.Navigation],

  getInitialState: function getInitialState() {
    return _SetupStore2.default.getState();
  },

  componentDidMount: function componentDidMount() {
    _SetupStore2.default.listen(this.update);
  },

  componentWillUnmount: function componentWillUnmount() {
    _SetupStore2.default.unlisten(this.update);
  },

  update: function update() {
    this.setState(_SetupStore2.default.getState());
  },

  handleErrorRetry: function handleErrorRetry() {
    _SetupActions2.default.retry(false);
  },

  handleUseVbox: function handleUseVbox() {
    _SetupActions2.default.useVbox();
  },

  handleErrorRemoveRetry: function handleErrorRemoveRetry() {
    console.log('Deleting VM and trying again.');
    _SetupActions2.default.retry(true);
  },

  handleResetSettings: function handleResetSettings() {
    _MetricsUtil2.default.track('Settings reset', {
      from: 'setup'
    });
    localStorage.removeItem('settings.useVM');
    _SetupActions2.default.retry(false);
  },

  handleToolBox: function handleToolBox() {
    _MetricsUtil2.default.track('Getting toolbox', {
      from: 'setup'
    });
    _electron.shell.openExternal('https://www.docker.com/docker-toolbox');
  },

  handleLinuxDockerInstall: function handleLinuxDockerInstall() {
    _MetricsUtil2.default.track('Opening Linux Docker installation instructions', {
      from: 'setup'
    });
    _electron.shell.openExternal('http://docs.docker.com/linux/started/');
  },

  renderContents: function renderContents() {
    return _addons2.default.createElement(
      'div',
      { className: 'contents' },
      _addons2.default.createElement(_reactRetinaImage2.default, { src: 'boot2docker.png', checkIfRetinaImgExists: false }),
      _addons2.default.createElement(
        'div',
        { className: 'detail' },
        _addons2.default.createElement(_RadialReact2.default, { progress: Math.round(this.state.progress), thick: true, gray: true })
      )
    );
  },

  renderProgress: function renderProgress() {
    var title = 'Starting Docker VM';
    var descr = 'To run Docker containers on your computer, Kitematic is starting a Linux virtual machine. This may take a minute...';
    if (_Util2.default.isNative()) {
      title = 'Checking Docker';
      descr = 'To run Docker containers on your computer, Kitematic is checking the Docker connection.';
    }
    return _addons2.default.createElement(
      'div',
      { className: 'setup' },
      _addons2.default.createElement(_Header2.default, { hideLogin: true }),
      _addons2.default.createElement(
        'div',
        { className: 'setup-content' },
        _addons2.default.createElement(
          'div',
          { className: 'image' },
          this.renderContents()
        ),
        _addons2.default.createElement(
          'div',
          { className: 'desc' },
          _addons2.default.createElement(
            'div',
            { className: 'content' },
            _addons2.default.createElement(
              'h1',
              null,
              title
            ),
            _addons2.default.createElement(
              'p',
              null,
              descr
            )
          )
        )
      )
    );
  },

  renderError: function renderError() {
    var deleteVmAndRetry = void 0;

    if (_Util2.default.isLinux()) {
      if (!this.state.started) {
        deleteVmAndRetry = _addons2.default.createElement(
          'button',
          { className: 'btn btn-action', onClick: this.handleLinuxDockerInstall },
          'Install Docker'
        );
      }
    } else if (_Util2.default.isNative()) {
      deleteVmAndRetry = _addons2.default.createElement(
        'button',
        { className: 'btn btn-action', onClick: this.handleUseVbox },
        'Use VirtualBox'
      );
    } else if (this.state.started) {
      deleteVmAndRetry = _addons2.default.createElement(
        'button',
        { className: 'btn btn-action', onClick: this.handleErrorRemoveRetry },
        'Delete VM & Retry Setup'
      );
    } else {
      deleteVmAndRetry = _addons2.default.createElement(
        'button',
        { className: 'btn btn-action', onClick: this.handleToolBox },
        'Get Toolbox'
      );
    }
    var usualError = _addons2.default.createElement(
      'div',
      { className: 'content' },
      _addons2.default.createElement(
        'h4',
        null,
        'Setup Error'
      ),
      _addons2.default.createElement(
        'h1',
        null,
        'We\'re Sorry!'
      ),
      _addons2.default.createElement(
        'p',
        null,
        'There seems to have been an unexpected error with Kitematic:'
      ),
      _addons2.default.createElement(
        'p',
        { className: 'error' },
        this.state.error.message || this.state.error
      ),
      _addons2.default.createElement(
        'p',
        { className: 'setup-actions' },
        _addons2.default.createElement(
          'button',
          { className: 'btn btn-action', onClick: this.handleErrorRetry },
          'Retry Setup'
        ),
        { deleteVmAndRetry: deleteVmAndRetry }
      )
    );
    if (_Util2.default.isNative()) {
      if (_Util2.default.isLinux()) {
        usualError = _addons2.default.createElement(
          'div',
          { className: 'content' },
          _addons2.default.createElement(
            'h1',
            null,
            'Setup Initialization'
          ),
          _addons2.default.createElement(
            'p',
            null,
            'We couldn\'t find a native setup - Click the Retry button to check again.'
          ),
          _addons2.default.createElement(
            'p',
            { className: 'setup-actions' },
            _addons2.default.createElement(
              'button',
              { className: 'btn btn-action', onClick: this.handleErrorRetry },
              'Retry Setup'
            )
          )
        );
      } else {
        usualError = _addons2.default.createElement(
          'div',
          { className: 'content' },
          _addons2.default.createElement(
            'h1',
            null,
            'Setup Initialization'
          ),
          _addons2.default.createElement(
            'p',
            null,
            'We couldn\'t find a native setup - Click the VirtualBox button to use VirtualBox instead or Retry to check again.'
          ),
          _addons2.default.createElement(
            'p',
            { className: 'setup-actions' },
            _addons2.default.createElement(
              'button',
              { className: 'btn btn-action', onClick: this.handleErrorRetry },
              'Retry Setup'
            ),
            { deleteVmAndRetry: deleteVmAndRetry }
          )
        );
      }
    }
    return _addons2.default.createElement(
      'div',
      { className: 'setup' },
      _addons2.default.createElement(_Header2.default, { hideLogin: true }),
      _addons2.default.createElement(
        'div',
        { className: 'setup-content' },
        _addons2.default.createElement(
          'div',
          { className: 'image' },
          _addons2.default.createElement(
            'div',
            { className: 'contents' },
            _addons2.default.createElement(_reactRetinaImage2.default, { src: 'install-error.png', checkIfRetinaImgExists: false }),
            _addons2.default.createElement(
              'div',
              { className: 'detail' },
              _addons2.default.createElement(
                'a',
                { className: 'btn btn-danger small', onClick: this.handleResetSettings },
                'reset'
              )
            )
          )
        ),
        _addons2.default.createElement(
          'div',
          { className: 'desc' },
          usualError
        )
      )
    );
  },

  render: function render() {
    if (this.state.error) {
      return this.renderError();
    } else {
      return this.renderProgress();
    }
  }
});

module.exports = Setup;
