'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _DockerUtil = require('../utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

var _ContainerActions = require('../actions/ContainerActions');

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _NetworkStore = require('../stores/NetworkStore');

var _NetworkStore2 = _interopRequireDefault(_NetworkStore);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _ContainerUtil = require('../utils/ContainerUtil');

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _ContainerStore = require('../stores/ContainerStore');

var _ContainerStore2 = _interopRequireDefault(_ContainerStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerSettingsNetwork = _addons2.default.createClass({
  displayName: 'ContainerSettingsNetwork',

  mixins: [_addons2.default.addons.LinkedStateMixin],

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    var usedNetworks = this.getUsedNetworks(_NetworkStore2.default.all());
    var links = _ContainerUtil2.default.links(this.props.container);
    return {
      networks: _NetworkStore2.default.all(),
      error: _NetworkStore2.default.getState().error,
      pending: _NetworkStore2.default.getState().pending,
      usedNetworks: usedNetworks,
      links: links,
      newLink: {
        container: "",
        alias: ""
      },
      isNewLinkValid: false,
      containers: this.containerLinkOptions(_ContainerStore2.default.getState().containers)
    };
  },

  getUsedNetworks: function getUsedNetworks(networks) {
    var usedKeys = _underscore2.default.keys(this.props.container.NetworkSettings.Networks);

    return _underscore2.default.object(_underscore2.default.map(networks, function (network) {
      return [network.Name, _underscore2.default.contains(usedKeys, network.Name)];
    }));
  },


  componentDidMount: function componentDidMount() {
    _NetworkStore2.default.listen(this.update);
  },

  componentWillUnmount: function componentWillUnmount() {
    _NetworkStore2.default.unlisten(this.update);
  },

  update: function update() {
    var newState = {
      networks: _NetworkStore2.default.all(),
      error: _NetworkStore2.default.getState().error,
      pending: _NetworkStore2.default.getState().pending
    };
    if (!newState.pending) {
      newState.usedNetworks = this.getUsedNetworks(_NetworkStore2.default.all());
    }
    this.setState(newState);
  },

  handleSaveNetworkOptions: function handleSaveNetworkOptions() {
    _MetricsUtil2.default.track('Saved Network Options');
    var connectedNetworks = [];
    var disconnectedNetworks = [];
    var containerNetworks = this.props.container.NetworkSettings.Networks;
    var usedNetworks = this.state.usedNetworks;
    _underscore2.default.each(_NetworkStore2.default.all(), function (network) {
      var isConnected = _underscore2.default.has(containerNetworks, network.Name);
      if (isConnected !== usedNetworks[network.Name]) {
        if (isConnected) {
          disconnectedNetworks.push(network.Name);
        } else {
          connectedNetworks.push(network.Name);
        }
      }
    });
    if (connectedNetworks.length || disconnectedNetworks.length) {
      _DockerUtil2.default.updateContainerNetworks(this.props.container.Name, connectedNetworks, disconnectedNetworks);
    }
  },

  handleToggleNetwork: function handleToggleNetwork(event) {
    var usedNetworks = _underscore2.default.clone(this.state.usedNetworks);
    var networkName = event.target.name;
    var newState = !usedNetworks[networkName];
    if (newState) {
      if (networkName === 'none') {
        usedNetworks = _underscore2.default.mapObject(usedNetworks, function () {
          return false;
        });
      } else {
        usedNetworks['none'] = false;
      }
    }
    usedNetworks[networkName] = newState;
    this.setState({
      usedNetworks: usedNetworks
    });
  },

  handleToggleHostNetwork: function handleToggleHostNetwork() {
    var NetworkingConfig = {
      EndpointsConfig: {}
    };
    if (!this.state.usedNetworks.host) {
      NetworkingConfig.EndpointsConfig.host = {};
    }
    _ContainerActions2.default.update(this.props.container.Name, { NetworkingConfig: NetworkingConfig });
  },

  containerLinkOptions: function containerLinkOptions(containers) {
    var usedNetworks = _underscore2.default.keys(this.props.container.NetworkSettings.Networks);
    var currentContainerName = this.props.container.Name;

    return _underscore2.default.values(containers).filter(function (container) {

      var sameNetworks = _underscore2.default.keys(container.NetworkSettings.Networks).filter(function (network) {
        return _underscore2.default.contains(usedNetworks, network);
      });

      if (container.State.Downloading) {
        // is downloading
        return false;
      } else if (container.Name == currentContainerName) {
        // is current container
        return false;
      } else if (sameNetworks.length == 0) {
        // not in the same network
        return false;
      } else {
        return true;
      }
    }).sort(function (a, b) {
      return a.Name.localeCompare(b.Name);
    });
  },

  handleNewLink: function handleNewLink() {
    var links = this.state.links;
    links.push({
      alias: this.state.newLink.alias.trim(),
      container: this.state.newLink.container
    });
    this.setState({
      links: links,
      newLink: {
        container: "",
        alias: ""
      }
    });

    this.saveContainerLinks();
  },

  handleNewLinkContainerChange: function handleNewLinkContainerChange() {
    var newLink = this.state.newLink;
    newLink.container = event.target.value;
    this.setState({
      newLink: newLink
    });
    this.checkNewLink();
  },

  handleNewLinkAliasChange: function handleNewLinkAliasChange() {
    var newLink = this.state.newLink;
    newLink.alias = event.target.value;
    this.setState({
      newLink: newLink
    });
    this.checkNewLink();
  },

  checkNewLink: function checkNewLink() {
    this.setState({
      isNewLinkValid: this.state.newLink.container != "" && /[A-Za-z0-9\-]$/.test(this.state.newLink.alias)
    });
  },

  handleRemoveLink: function handleRemoveLink(event) {
    var links = this.state.links;
    links.splice(parseInt(event.target.name), 1);
    this.setState({
      links: links
    });

    this.saveContainerLinks();
  },

  saveContainerLinks: function saveContainerLinks() {
    var linksPaths = _ContainerUtil2.default.normalizeLinksPath(this.props.container, this.state.links);

    var hostConfig = _underscore2.default.extend(this.props.container.HostConfig, { Links: linksPaths });
    _ContainerActions2.default.update(this.props.container.Name, { HostConfig: hostConfig });
  },

  render: function render() {
    var _this = this;

    var isUpdating = this.props.container.State.Updating || this.state.pending;
    var networks = _underscore2.default.map(this.state.networks, function (network, index) {
      if (network.Name !== 'host') {
        return _addons2.default.createElement(
          'tr',
          { key: network.Id },
          _addons2.default.createElement(
            'td',
            null,
            _addons2.default.createElement('input', { type: 'checkbox', disabled: isUpdating || _this.state.usedNetworks.host, name: network.Name, checked: _this.state.usedNetworks[network.Name], onChange: _this.handleToggleNetwork })
          ),
          _addons2.default.createElement(
            'td',
            null,
            network.Name
          ),
          _addons2.default.createElement(
            'td',
            null,
            network.Driver
          )
        );
      }
    });

    var links = _underscore2.default.map(this.state.links, function (link, key) {
      return _addons2.default.createElement(
        'tr',
        null,
        _addons2.default.createElement(
          'td',
          null,
          link.container
        ),
        _addons2.default.createElement(
          'td',
          null,
          link.alias
        ),
        _addons2.default.createElement(
          'td',
          null,
          _addons2.default.createElement(
            _reactRouter2.default.Link,
            { to: 'container', params: { name: link.container } },
            _addons2.default.createElement(
              'a',
              { className: 'btn btn-action small' },
              'OPEN'
            )
          ),
          _addons2.default.createElement(
            'a',
            { name: key, className: 'btn btn-action small', onClick: _this.handleRemoveLink },
            'REMOVE'
          )
        )
      );
    });

    var containerOptions = _underscore2.default.map(this.state.containers, function (container) {
      return _addons2.default.createElement(
        'option',
        { value: container.Name },
        container.Name
      );
    });

    return _addons2.default.createElement(
      'div',
      { className: 'settings-panel' },
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Configure network'
        ),
        _addons2.default.createElement(
          'table',
          { className: 'table volumes' },
          _addons2.default.createElement(
            'thead',
            null,
            _addons2.default.createElement(
              'tr',
              null,
              _addons2.default.createElement(
                'th',
                null,
                '\xA0'
              ),
              _addons2.default.createElement(
                'th',
                null,
                'NAME'
              ),
              _addons2.default.createElement(
                'th',
                null,
                'DRIVER'
              )
            )
          ),
          _addons2.default.createElement(
            'tbody',
            null,
            networks
          )
        ),
        !this.state.usedNetworks.host ? _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', disabled: isUpdating, onClick: this.handleSaveNetworkOptions },
          'Save'
        ) : null,
        this.state.usedNetworks.host ? _addons2.default.createElement(
          'span',
          null,
          'You cannot configure networks while container connected to host network'
        ) : null
      ),
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Host network'
        ),
        !this.state.usedNetworks.host ? _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', disabled: isUpdating, onClick: this.handleToggleHostNetwork },
          'Connect to host network'
        ) : null,
        this.state.usedNetworks.host ? _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', disabled: isUpdating, onClick: this.handleToggleHostNetwork },
          'Disconnect from host network'
        ) : null
      ),
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Links'
        ),
        _addons2.default.createElement(
          'table',
          { className: 'table links' },
          _addons2.default.createElement(
            'thead',
            null,
            _addons2.default.createElement(
              'tr',
              null,
              _addons2.default.createElement(
                'th',
                null,
                'NAME'
              ),
              _addons2.default.createElement(
                'th',
                null,
                'ALIAS'
              ),
              _addons2.default.createElement(
                'th',
                null,
                '\xA0'
              )
            )
          ),
          _addons2.default.createElement(
            'tbody',
            null,
            links,
            _addons2.default.createElement(
              'tr',
              null,
              _addons2.default.createElement(
                'td',
                null,
                _addons2.default.createElement(
                  'select',
                  { className: 'line', value: this.state.newLink.container, onChange: this.handleNewLinkContainerChange },
                  _addons2.default.createElement(
                    'option',
                    { disabled: true, value: '' },
                    'Select container'
                  ),
                  containerOptions
                )
              ),
              _addons2.default.createElement(
                'td',
                null,
                _addons2.default.createElement('input', { id: 'new-link-alias', type: 'text', className: 'line', value: this.state.newLink.alias, onChange: this.handleNewLinkAliasChange })
              ),
              _addons2.default.createElement(
                'td',
                null,
                _addons2.default.createElement(
                  'a',
                  { className: 'only-icon btn btn-positive small', disabled: !this.state.isNewLinkValid, onClick: this.handleNewLink },
                  _addons2.default.createElement('span', { className: 'icon icon-add' })
                )
              )
            )
          )
        )
      )
    );
  }
});

module.exports = ContainerSettingsNetwork;
