'use strict';

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _Setup = require('./components/Setup.react');

var _Setup2 = _interopRequireDefault(_Setup);

var _Account = require('./components/Account.react');

var _Account2 = _interopRequireDefault(_Account);

var _AccountSignup = require('./components/AccountSignup.react');

var _AccountSignup2 = _interopRequireDefault(_AccountSignup);

var _AccountLogin = require('./components/AccountLogin.react');

var _AccountLogin2 = _interopRequireDefault(_AccountLogin);

var _Containers = require('./components/Containers.react');

var _Containers2 = _interopRequireDefault(_Containers);

var _ContainerDetails = require('./components/ContainerDetails.react');

var _ContainerDetails2 = _interopRequireDefault(_ContainerDetails);

var _ContainerHome = require('./components/ContainerHome.react');

var _ContainerHome2 = _interopRequireDefault(_ContainerHome);

var _ContainerSettings = require('./components/ContainerSettings.react');

var _ContainerSettings2 = _interopRequireDefault(_ContainerSettings);

var _ContainerSettingsGeneral = require('./components/ContainerSettingsGeneral.react');

var _ContainerSettingsGeneral2 = _interopRequireDefault(_ContainerSettingsGeneral);

var _ContainerSettingsPorts = require('./components/ContainerSettingsPorts.react');

var _ContainerSettingsPorts2 = _interopRequireDefault(_ContainerSettingsPorts);

var _ContainerSettingsVolumes = require('./components/ContainerSettingsVolumes.react');

var _ContainerSettingsVolumes2 = _interopRequireDefault(_ContainerSettingsVolumes);

var _ContainerSettingsNetwork = require('./components/ContainerSettingsNetwork.react');

var _ContainerSettingsNetwork2 = _interopRequireDefault(_ContainerSettingsNetwork);

var _ContainerSettingsAdvanced = require('./components/ContainerSettingsAdvanced.react');

var _ContainerSettingsAdvanced2 = _interopRequireDefault(_ContainerSettingsAdvanced);

var _Preferences = require('./components/Preferences.react');

var _Preferences2 = _interopRequireDefault(_Preferences);

var _About = require('./components/About.react');

var _About2 = _interopRequireDefault(_About);

var _Loading = require('./components/Loading.react');

var _Loading2 = _interopRequireDefault(_Loading);

var _NewContainerSearch = require('./components/NewContainerSearch.react');

var _NewContainerSearch2 = _interopRequireDefault(_NewContainerSearch);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Route = _reactRouter2.default.Route;
var DefaultRoute = _reactRouter2.default.DefaultRoute;
var RouteHandler = _reactRouter2.default.RouteHandler;

var App = _addons2.default.createClass({
  displayName: 'App',

  render: function render() {
    return _addons2.default.createElement(RouteHandler, null);
  }
});

var routes = _addons2.default.createElement(
  Route,
  { name: 'app', path: '/', handler: App },
  _addons2.default.createElement(
    Route,
    { name: 'account', path: 'account', handler: _Account2.default },
    _addons2.default.createElement(Route, { name: 'signup', path: 'signup', handler: _AccountSignup2.default }),
    _addons2.default.createElement(Route, { name: 'login', path: 'login', handler: _AccountLogin2.default })
  ),
  _addons2.default.createElement(
    Route,
    { name: 'containers', path: 'containers', handler: _Containers2.default },
    _addons2.default.createElement(
      Route,
      { name: 'container', path: 'details/:name', handler: _ContainerDetails2.default },
      _addons2.default.createElement(DefaultRoute, { name: 'containerHome', handler: _ContainerHome2.default }),
      _addons2.default.createElement(
        Route,
        { name: 'containerSettings', path: 'settings', handler: _ContainerSettings2.default },
        _addons2.default.createElement(Route, { name: 'containerSettingsGeneral', path: 'general', handler: _ContainerSettingsGeneral2.default }),
        _addons2.default.createElement(Route, { name: 'containerSettingsPorts', path: 'ports', handler: _ContainerSettingsPorts2.default }),
        _addons2.default.createElement(Route, { name: 'containerSettingsVolumes', path: 'volumes', handler: _ContainerSettingsVolumes2.default }),
        _addons2.default.createElement(Route, { name: 'containerSettingsNetwork', path: 'network', handler: _ContainerSettingsNetwork2.default }),
        _addons2.default.createElement(Route, { name: 'containerSettingsAdvanced', path: 'advanced', handler: _ContainerSettingsAdvanced2.default })
      )
    ),
    _addons2.default.createElement(Route, { name: 'search', handler: _NewContainerSearch2.default }),
    _addons2.default.createElement(Route, { name: 'preferences', path: 'preferences', handler: _Preferences2.default }),
    _addons2.default.createElement(Route, { name: 'about', path: 'about', handler: _About2.default })
  ),
  _addons2.default.createElement(DefaultRoute, { name: 'loading', handler: _Loading2.default }),
  _addons2.default.createElement(Route, { name: 'setup', handler: _Setup2.default })
);

module.exports = routes;
