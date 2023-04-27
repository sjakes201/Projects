"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const result_1 = require("./result");
const result = require("./result");
function tcExpr(boundVars, expr) {
  if (expr.kind === "number") {
    return result_1.ok(undefined);
  } else if (expr.kind === "boolean") {
    return result_1.ok(undefined);
  } else if (expr.kind === "variable") {
    if (boundVars.contains(expr.name)) {
      return result_1.ok(undefined);
    } else {
      return result_1.error(`variable ${expr.name} is not declared`);
    }
  } else if (expr.kind === "operator") {
    return tcExpr(boundVars, expr.e1).then(_ => tcExpr(boundVars, expr.e2));
  } else {
    return result_1.unreachable("unhandled case in tcExpr");
  }
}
function tcBlock(env, statements) {
  return result.foldLeft(tcStmt, env, statements);
}
// We return the environement because 'let' statements declare variables that
// are visible to the next statement.
function tcStmt(env, stmt) {
  const { bound, all } = env;
  if (stmt.kind === "let") {
    const x = stmt.name;
    // if (all.contains(x)) {
    //     return result_1.error(`variable ${x} is re-declared`);
    // }
    return tcExpr(bound, stmt.expression).map(_ => ({ bound: bound.add(x), all: all.add(x) }));
  } else if (stmt.kind === "assignment") {
    const x = stmt.name;
    // if (bound.contains(x) === false) {
    //   return result_1.error(`variable ${x} is not declared`);
    // }
    return tcExpr(bound, stmt.expression).map(_ => env);
  } else if (stmt.kind === "if") {
    return tcExpr(bound, stmt.test)
      .then(_ => tcBlock(env, stmt.truePart))
      .then(({ all }) => tcBlock({ bound, all }, stmt.falsePart))
      .map(({ all }) => ({ bound, all }));
  } else if (stmt.kind === "while") {
    // NOTE(arjun): Same trick as above.
    return tcExpr(bound, stmt.test)
      .then(_ => tcBlock(env, stmt.body))
      .map(({ all }) => ({ bound, all }));
  } else if (stmt.kind === "print") {
    return tcExpr(bound, stmt.expression).map(_ => env);
  } else {
    return result_1.unreachable("unhandled case in tcStmt");
  }
}
/**
 * A very naive "type-checker", which only ensures that (1) variables are
 * declared before they are used and that (2) there are no pairs of let
 * statements in different scopes that declare two variables with the same name.
 */
function tc(stmts) {
  return tcBlock({ bound: immutable_1.Set.of(), all: immutable_1.Set.of() }, stmts).map(_ => undefined);
}
exports.tc = tc;
