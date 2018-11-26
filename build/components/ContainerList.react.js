'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _ContainerListItem = require('./ContainerListItem.react');

var _ContainerListItem2 = _interopRequireDefault(_ContainerListItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerList = _addons2.default.createClass({
  displayName: 'ContainerList',

  componentWillMount: function componentWillMount() {
    this.start = Date.now();
  },
  render: function render() {
    var _this = this;

    var containers = this.props.containers.map(function (container) {
      return _addons2.default.createElement(_ContainerListItem2.default, { key: container.Id, container: container, start: _this.start });
    });
    return _addons2.default.createElement(
      'ul',
      null,
      containers
    );
  }
});

module.exports = ContainerList;
