'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _reactRetinaImage = require('react-retina-image');

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packages;

try {
  packages = _Util2.default.packagejson();
} catch (err) {
  packages = {};
}

var Preferences = _addons2.default.createClass({
  displayName: 'Preferences',

  mixins: [_reactRouter2.default.Navigation],
  getInitialState: function getInitialState() {
    return {
      metricsEnabled: _MetricsUtil2.default.enabled()
    };
  },
  handleGoBackClick: function handleGoBackClick() {
    this.goBack();
    _MetricsUtil2.default.track('Went Back From About');
  },
  render: function render() {
    return _addons2.default.createElement(
      'div',
      { className: 'preferences' },
      _addons2.default.createElement(
        'div',
        { className: 'about-content' },
        _addons2.default.createElement(
          'a',
          { onClick: this.handleGoBackClick },
          'Go Back'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'items' },
          _addons2.default.createElement(
            'div',
            { className: 'item' },
            _addons2.default.createElement(_reactRetinaImage2.default, { src: 'cartoon-kitematic.png' }),
            _addons2.default.createElement(
              'h4',
              null,
              'Docker ',
              packages.name
            ),
            _addons2.default.createElement(
              'p',
              null,
              packages.version
            )
          )
        ),
        _addons2.default.createElement(
          'h3',
          null,
          'Kitematic is built with:'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'items' },
          _addons2.default.createElement(
            'div',
            { className: 'item' },
            _addons2.default.createElement(_reactRetinaImage2.default, { src: 'cartoon-docker.png' }),
            _addons2.default.createElement(
              'h4',
              null,
              'Docker Engine'
            )
          ),
          _addons2.default.createElement(
            'div',
            { className: 'item' },
            _addons2.default.createElement(_reactRetinaImage2.default, { src: 'cartoon-docker-machine.png' }),
            _addons2.default.createElement(
              'h4',
              null,
              'Docker Machine'
            ),
            _addons2.default.createElement(
              'p',
              null,
              packages["docker-machine-version"]
            )
          )
        ),
        _addons2.default.createElement(
          'h3',
          null,
          'Third-Party Software'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'items' },
          _addons2.default.createElement(
            'div',
            { className: 'item' },
            _addons2.default.createElement(
              'h4',
              null,
              'VirtualBox'
            ),
            _addons2.default.createElement(
              'p',
              null,
              packages["virtualbox-version"]
            )
          )
        ),
        _addons2.default.createElement(
          'div',
          { className: 'items' },
          _addons2.default.createElement(
            'div',
            { className: 'item' },
            _addons2.default.createElement(
              'h4',
              null,
              'Electron'
            ),
            _addons2.default.createElement(
              'p',
              null,
              packages["electron-version"]
            )
          )
        )
      )
    );
  }
});

module.exports = Preferences;
