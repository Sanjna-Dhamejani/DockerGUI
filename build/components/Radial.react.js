'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Radial = _react2.default.createClass({
  displayName: 'Radial',

  render: function render() {
    var percentage;
    if (this.props.progress !== null && this.props.progress !== undefined && !this.props.spin && !this.props.error) {
      percentage = _react2.default.createElement('div', { className: 'percentage' });
    } else {
      percentage = _react2.default.createElement('div', null);
    }
    var classes = (0, _classnames2.default)({
      'radial-progress': true,
      'radial-spinner': this.props.spin,
      'radial-negative': this.props.error,
      'radial-thick': this.props.thick || false,
      'radial-gray': this.props.gray || false,
      'radial-transparent': this.props.transparent || false
    });
    return _react2.default.createElement(
      'div',
      { className: classes, 'data-progress': this.props.progress },
      _react2.default.createElement(
        'div',
        { className: 'circle' },
        _react2.default.createElement(
          'div',
          { className: 'mask full' },
          _react2.default.createElement('div', { className: 'fill' })
        ),
        _react2.default.createElement(
          'div',
          { className: 'mask half' },
          _react2.default.createElement('div', { className: 'fill' }),
          _react2.default.createElement('div', { className: 'fill fix' })
        ),
        _react2.default.createElement('div', { className: 'shadow' })
      ),
      _react2.default.createElement(
        'div',
        { className: 'inset' },
        percentage
      )
    );
  }
});

module.exports = Radial;
