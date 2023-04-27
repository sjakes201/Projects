"use strict";
// This should be a library.
Object.defineProperty(exports, "__esModule", { value: true });
function unreachable(message) {
  throw new Error(message);
}
exports.unreachable = unreachable;
class OK {
  constructor(value) {
    this.value = value;
    this.ok = true;
  }
  unsafeGet() {
    return this.value;
  }
  then(other) {
    return other(this.value);
  }
  map(f) {
    return new OK(f(this.value));
  }
}
class Error {
  constructor(message) {
    this.message = message;
    this.ok = false;
  }
  unsafeGet() {
    throw new Error(`Called unsafeGet on Error(${this.message})`);
  }
  then(other) {
    return this;
  }
  map(f) {
    return this;
  }
}
function ok(value) {
  return new OK(value);
}
exports.ok = ok;
function error(message) {
  return new Error(message);
}
exports.error = error;
function foldLeft(f, init, array) {
  let acc = init;
  for (const x of array) {
    let r = f(acc, x);
    if (r.kind === "error") {
      return r;
    }
    acc = r.value;
  }
  return ok(acc);
}
exports.foldLeft = foldLeft;
