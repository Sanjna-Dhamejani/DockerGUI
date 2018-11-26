'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require('react/addons');

var _addons2 = _interopRequireDefault(_addons);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _ContainerUtil = require('../utils/ContainerUtil');

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _ContainerActions = require('../actions/ContainerActions');

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remote = _electron2.default.remote;
var dialog = remote.dialog;


var ContainerSettingsGeneral = _addons2.default.createClass({
  displayName: 'ContainerSettingsGeneral',

  mixins: [_addons2.default.addons.LinkedStateMixin],

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    var env = _ContainerUtil2.default.env(this.props.container) || [];
    env.push(['', '']);

    env = _underscore2.default.map(env, function (e) {
      return [_Util2.default.randomId(), e[0], e[1]];
    });

    return {
      slugName: null,
      nameError: null,
      copiedId: false,
      env: env
    };
  },

  handleNameChange: function handleNameChange(e) {
    var name = e.target.value;
    if (name === this.state.slugName) {
      return;
    }

    name = name.replace(/^\s+|\s+$/g, ''); // Trim
    name = name.toLowerCase();
    // Remove Accents
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/,:;";
    var to = "aaaaeeeeiiiioooouuuunc-----";
    for (var i = 0, l = from.length; i < l; i++) {
      name = name.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    name = name.replace(/[^a-z0-9-_.\s]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Collapse whitespace and replace by -
    .replace(/-+/g, '-') // Collapse dashes
    .replace(/_+/g, '_'); // Collapse underscores

    this.setState({
      slugName: name
    });
  },

  handleNameOnKeyUp: function handleNameOnKeyUp(e) {
    if (e.keyCode === 13 && this.state.slugName) {
      this.handleSaveContainerName();
    }
  },

  handleCopyContainerId: function handleCopyContainerId() {
    _electron.clipboard.writeText(this.props.container.Id);
    this.setState({
      copiedId: true
    });

    var _this = this;
    setTimeout(function () {
      _this.setState({
        copiedId: false
      });
    }, 5000);
  },

  handleSaveContainerName: function handleSaveContainerName() {
    var newName = this.state.slugName;
    if (newName === this.props.container.Name) {
      return;
    }

    this.setState({
      slugName: null
    });

    if (this.props.containers[newName]) {
      this.setState({
        nameError: 'A container already exists with this name.'
      });
      return;
    }

    _ContainerActions2.default.rename(this.props.container.Name, newName);
    this.context.router.transitionTo('containerSettingsGeneral', { name: newName });
    _MetricsUtil2.default.track('Changed Container Name');
  },

  handleSaveEnvVars: function handleSaveEnvVars() {
    _MetricsUtil2.default.track('Saved Environment Variables');
    var list = [];
    _underscore2.default.each(this.state.env, function (kvp) {
      var _kvp = (0, _slicedToArray3.default)(kvp, 3),
          key = _kvp[1],
          value = _kvp[2];

      if (key && key.length || value && value.length) {
        list.push(key + '=' + value);
      }
    });
    _ContainerActions2.default.update(this.props.container.Name, { Env: list });
  },

  handleChangeEnvKey: function handleChangeEnvKey(index, event) {
    var env = _underscore2.default.map(this.state.env, _underscore2.default.clone);
    env[index][1] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleChangeEnvVal: function handleChangeEnvVal(index, event) {
    var env = _underscore2.default.map(this.state.env, _underscore2.default.clone);
    env[index][2] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleAddEnvVar: function handleAddEnvVar() {
    var env = _underscore2.default.map(this.state.env, _underscore2.default.clone);
    env.push([_Util2.default.randomId(), '', '']);
    this.setState({
      env: env
    });
    _MetricsUtil2.default.track('Added Pending Environment Variable');
  },

  handleRemoveEnvVar: function handleRemoveEnvVar(index) {
    var env = _underscore2.default.map(this.state.env, _underscore2.default.clone);
    env.splice(index, 1);

    if (env.length === 0) {
      env.push([_Util2.default.randomId(), '', '']);
    }

    this.setState({
      env: env
    });

    _MetricsUtil2.default.track('Removed Environment Variable');
  },

  handleDeleteContainer: function handleDeleteContainer() {
    var _this2 = this;

    dialog.showMessageBox({
      message: 'Are you sure you want to delete this container?',
      buttons: ['Delete', 'Cancel']
    }, function (index) {
      if (index === 0) {
        _MetricsUtil2.default.track('Deleted Container', {
          from: 'settings',
          type: 'existing'
        });
        _ContainerActions2.default.destroy(_this2.props.container.Name);
      }
    });
  },

  render: function render() {
    var _this3 = this;

    if (!this.props.container) {
      return false;
    }

    var clipboardStatus;
    var willBeRenamedAs;
    var btnSaveName = _addons2.default.createElement(
      'a',
      { className: 'btn btn-action', onClick: this.handleSaveContainerName, disabled: 'disabled' },
      'Save'
    );
    if (this.state.slugName) {
      willBeRenamedAs = _addons2.default.createElement(
        'p',
        null,
        'Will be renamed as: ',
        _addons2.default.createElement(
          'strong',
          null,
          this.state.slugName
        )
      );
      btnSaveName = _addons2.default.createElement(
        'a',
        { className: 'btn btn-action', onClick: this.handleSaveContainerName },
        'Save'
      );
    } else if (this.state.nameError) {
      willBeRenamedAs = _addons2.default.createElement(
        'p',
        null,
        _addons2.default.createElement(
          'strong',
          null,
          this.state.nameError
        )
      );
    }

    if (this.state.copiedId) {
      clipboardStatus = _addons2.default.createElement(
        'p',
        { className: 'fadeOut' },
        _addons2.default.createElement(
          'strong',
          null,
          'Copied to Clipboard'
        )
      );
    }

    var containerInfo = _addons2.default.createElement(
      'div',
      { className: 'settings-section' },
      _addons2.default.createElement(
        'h3',
        null,
        'Container Info'
      ),
      _addons2.default.createElement(
        'div',
        { className: 'container-info-row' },
        _addons2.default.createElement(
          'div',
          { className: 'label-id' },
          'ID'
        ),
        _addons2.default.createElement('input', { type: 'text', className: 'line disabled', defaultValue: this.props.container.Id, disabled: true }),
        _addons2.default.createElement(
          'a',
          { className: 'btn btn-action btn-copy', onClick: this.handleCopyContainerId },
          'Copy'
        ),
        clipboardStatus
      ),
      _addons2.default.createElement(
        'div',
        { className: 'container-info-row' },
        _addons2.default.createElement(
          'div',
          { className: 'label-name' },
          'NAME'
        ),
        _addons2.default.createElement('input', { id: 'input-container-name', type: 'text', className: 'line', placeholder: 'Container Name', defaultValue: this.props.container.Name, onChange: this.handleNameChange, onKeyUp: this.handleNameOnKeyUp }),
        btnSaveName,
        willBeRenamedAs
      )
    );

    var vars = _underscore2.default.map(this.state.env, function (kvp, index) {
      var _kvp2 = (0, _slicedToArray3.default)(kvp, 3),
          id = _kvp2[0],
          key = _kvp2[1],
          val = _kvp2[2];

      var icon = void 0;
      if (index === _this3.state.env.length - 1) {
        icon = _addons2.default.createElement(
          'a',
          { onClick: _this3.handleAddEnvVar, className: 'only-icon btn btn-positive small' },
          _addons2.default.createElement('span', { className: 'icon icon-add' })
        );
      } else {
        icon = _addons2.default.createElement(
          'a',
          { onClick: _this3.handleRemoveEnvVar.bind(_this3, index), className: 'only-icon btn btn-action small' },
          _addons2.default.createElement('span', { className: 'icon icon-delete' })
        );
      }

      return _addons2.default.createElement(
        'div',
        { key: id, className: 'keyval-row' },
        _addons2.default.createElement('input', { type: 'text', className: 'key line', defaultValue: key, onChange: _this3.handleChangeEnvKey.bind(_this3, index) }),
        _addons2.default.createElement('input', { type: 'text', className: 'val line', defaultValue: val, onChange: _this3.handleChangeEnvVal.bind(_this3, index) }),
        icon
      );
    });

    return _addons2.default.createElement(
      'div',
      { className: 'settings-panel' },
      containerInfo,
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Environment Variables'
        ),
        _addons2.default.createElement(
          'div',
          { className: 'env-vars-labels' },
          _addons2.default.createElement(
            'div',
            { className: 'label-key' },
            'KEY'
          ),
          _addons2.default.createElement(
            'div',
            { className: 'label-val' },
            'VALUE'
          )
        ),
        _addons2.default.createElement(
          'div',
          { className: 'env-vars' },
          vars
        ),
        _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', disabled: this.props.container.State.Updating, onClick: this.handleSaveEnvVars },
          'Save'
        )
      ),
      _addons2.default.createElement(
        'div',
        { className: 'settings-section' },
        _addons2.default.createElement(
          'h3',
          null,
          'Delete Container'
        ),
        _addons2.default.createElement(
          'a',
          { className: 'btn btn-action', onClick: this.handleDeleteContainer },
          'Delete Container'
        )
      )
    );
  }
});

module.exports = ContainerSettingsGeneral;
