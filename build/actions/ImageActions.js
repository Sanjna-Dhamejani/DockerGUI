'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DockerUtil = require('../utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImageActions = function () {
  function ImageActions() {
    (0, _classCallCheck3.default)(this, ImageActions);
  }

  (0, _createClass3.default)(ImageActions, [{
    key: 'all',
    value: function all() {
      this.dispatch({});
      _DockerUtil2.default.refresh();
    }
  }, {
    key: 'destroy',
    value: function destroy(image) {
      _DockerUtil2.default.removeImage(image);
    }
  }]);
  return ImageActions;
}();

exports.default = _alt2.default.createActions(ImageActions);
