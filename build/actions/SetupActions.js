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

var _SetupUtil = require('../utils/SetupUtil');

var _SetupUtil2 = _interopRequireDefault(_SetupUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SetupActions = function () {
  function SetupActions() {
    (0, _classCallCheck3.default)(this, SetupActions);
  }

  (0, _createClass3.default)(SetupActions, [{
    key: 'retry',
    value: function retry(removeVM) {
      this.dispatch({ removeVM: removeVM });
      _SetupUtil2.default.retry(removeVM);
    }
  }, {
    key: 'useVbox',
    value: function useVbox() {
      this.dispatch({});
      _SetupUtil2.default.useVbox();
    }
  }]);
  return SetupActions;
}();

exports.default = _alt2.default.createActions(SetupActions);
