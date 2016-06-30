'use strict';

module.exports = class Table {
  constructor(name, conn) {
    this.name = name;
    this.conn = conn;
  }

  get(id) {
    return this.conn.get(id, this.name);
  }

  list() {
    return this.conn.list(this.name);
  }

  put(obj) {
    return this.conn.put(obj, this.name);
  }

  delete(id) {
    return this.conn.delete(id, this.name);
  }
}
