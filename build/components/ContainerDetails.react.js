'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _ContainerDetailsHeader = require('./ContainerDetailsHeader.react');

var _ContainerDetailsHeader2 = _interopRequireDefault(_ContainerDetailsHeader);

var _ContainerDetailsSubheader = require('./ContainerDetailsSubheader.react');

var _ContainerDetailsSubheader2 = _interopRequireDefault(_ContainerDetailsSubheader);

var _ContainerUtil = require('../utils/ContainerUtil');

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerDetails = _addons2.default.createClass({
  displayName: 'ContainerDetails',

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  render: function render() {
    if (!this.props.container) {
      return false;
    }

    var ports = _ContainerUtil2.default.ports(this.props.container);
    var defaultPort = _underscore2.default.find(_underscore2.default.keys(ports), function (port) {
      return _Util2.default.webPorts.indexOf(port) !== -1;
    });

    return _addons2.default.createElement(
      'div',
      { className: 'details' },
      _addons2.default.createElement(_ContainerDetailsHeader2.default, (0, _extends3.default)({}, this.props, { defaultPort: defaultPort, ports: ports })),
      _addons2.default.createElement(_ContainerDetailsSubheader2.default, (0, _extends3.default)({}, this.props, { defaultPort: defaultPort, ports: ports })),
      _addons2.default.createElement(_reactRouter2.default.RouteHandler, (0, _extends3.default)({}, this.props, { defaultPort: defaultPort, ports: ports }))
    );
  }
});

module.exports = ContainerDetails;
