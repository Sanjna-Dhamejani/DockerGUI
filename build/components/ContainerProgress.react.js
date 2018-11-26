'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*

  Usage: <ContainerProgress pBar1={20} pBar2={70} pBar3={100} pBar4={20} />

*/
var ContainerProgress = _react2.default.createClass({
  displayName: 'ContainerProgress',

  render: function render() {
    var pBar1Style = {
      height: this.props.pBar1 + '%'
    };
    var pBar2Style = {
      height: this.props.pBar2 + '%'
    };
    var pBar3Style = {
      height: this.props.pBar3 + '%'
    };
    var pBar4Style = {
      height: this.props.pBar4 + '%'
    };
    return _react2.default.createElement(
      'div',
      { className: 'container-progress' },
      _react2.default.createElement(
        'div',
        { className: 'bar-1 bar-bg' },
        _react2.default.createElement('div', { className: 'bar-fg', style: pBar4Style })
      ),
      _react2.default.createElement(
        'div',
        { className: 'bar-2 bar-bg' },
        _react2.default.createElement('div', { className: 'bar-fg', style: pBar3Style })
      ),
      _react2.default.createElement(
        'div',
        { className: 'bar-3 bar-bg' },
        _react2.default.createElement('div', { className: 'bar-fg', style: pBar2Style })
      ),
      _react2.default.createElement(
        'div',
        { className: 'bar-4 bar-bg' },
        _react2.default.createElement('div', { className: 'bar-fg', style: pBar1Style })
      )
    );
  }
});

module.exports = ContainerProgress;
