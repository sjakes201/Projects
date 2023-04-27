"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bool(value) {
  return { kind: "boolean", value };
}
exports.bool = bool;
function number(value) {
  return { kind: "number", value };
}
exports.number = number;
function variable(name) {
  return { kind: "variable", name };
}
exports.variable = variable;
function operator(op, e1, e2) {
  return { kind: "operator", op, e1, e2 };
}
exports.operator = operator;
function let_(name, expression) {
  return { kind: "let", name, expression };
}
exports.let_ = let_;
function assignment(name, expression) {
  return { kind: "assignment", name, expression };
}
exports.assignment = assignment;
function if_(test, truePart, falsePart) {
  return { kind: "if", test, truePart, falsePart };
}
exports.if_ = if_;
function while_(test, body) {
  return { kind: "while", test, body };
}
exports.while_ = while_;
function print(expression) {
  return { kind: "print", expression };
}
exports.print = print;
