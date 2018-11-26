"use strict";

module.exports = {
  router: null,

  get: function get() {
    return this.router;
  },

  set: function set(router) {
    this.router = router;
  }
};
