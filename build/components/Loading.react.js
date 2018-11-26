'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _Header = require('./Header.react');

var _Header2 = _interopRequireDefault(_Header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _addons2.default.createClass({
  displayName: 'exports',

  render: function render() {
    return _addons2.default.createElement(
      'div',
      { className: 'loading' },
      _addons2.default.createElement(_Header2.default, { hideLogin: true }),
      _addons2.default.createElement(
        'div',
        { className: 'loading-content' },
        _addons2.default.createElement(
          'div',
          { className: 'spinner la-ball-clip-rotate la-lg la-dark' },
          _addons2.default.createElement('div', null)
        )
      )
    );
  }
});
