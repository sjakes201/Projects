"use strict";

function getValue(state, name) {
  if (name in state) {
    return state[name];
  } else {
    while ("outerScope" in state) {
      state = state["outerScope"];
      if (name in state) {
        return state[name];
      }
    }
    throw new Error("VARIABLE NAME: '" + name + "' DOES NOT EXIST IN STATE");
  }
}

function setValue(isAssignment, state, name, value) {
  if (isAssignment) {
    if (name in state) {
      state[name] = value;
    }
    while ("outerScope" in state) {
      state = state["outerScope"];
      if (name in state) {
        state[name] = value;
      }
    }
  } else {
    state[name] = value;
  }
}

function interpExpression(state, expr) {
  switch (expr.kind) {
    case "number":
      return expr.value;
    case "boolean":
      return expr.value;
    case "operator":
      let v1 = interpExpression(state, expr.e1);
      let v2 = interpExpression(state, expr.e2);
      if (typeof v1 !== typeof v2) {
        throw new Error(
          "Cannot use operator on these types: " + v1 + " and " + v2
        );
      }
      switch (expr.op) {
        case "+":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot add non-numbers");
          }
          return v1 + v2;
        case "-":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot subtract non-numbers");
          }
          return v1 - v2;
        case "*":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot multiply non-numbers");
          }
          return v1 * v2;
        case "/":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot divide non-numbers");
          }
          return v1 / v2;
        case "&&":
          if (typeof v1 !== "boolean" || typeof v2 !== "boolean") {
            throw new Error("You cannot AND non-booleans");
          }
          return v1 && v2;
        case "||":
          if (typeof v1 !== "boolean" || typeof v2 !== "boolean") {
            throw new Error("You cannot OR non-booleans");
          }
          return v1 || v2;
        case "<":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot < non-numbers");
          }
          return v1 ? v1 : v1 || v2;
        case ">":
          if (typeof v1 !== "number" || typeof v2 !== "number") {
            throw new Error("You cannot > non-numbers");
          }
          return v1 > v2;
        case "===":
          return v1 === v2;
        default:
          break;
      }
      break;
    case "variable":
      return getValue(state, expr.name);
    default:
      throw new Error("Expression could not be evaluated.");
  }
}

function interpBlock(state, stmtArr) {
  let thisState = { outerScope: state };
  stmtArr.forEach((element) => {
    interpStatement(thisState, element);
  });
}

function interpStatement(state, stmt) {
  switch (stmt.kind) {
    case "let":
      setValue(
        false,
        state,
        stmt.name,
        interpExpression(state, stmt.expression)
      );
      break;
    case "assignment":
      setValue(
        true,
        state,
        stmt.name,
        interpExpression(state, stmt.expression)
      );
      break;
    case "if":
      let value = interpExpression(state, stmt.test);
      if (value) {
        interpBlock(state, stmt.truePart);
      } else {
        interpBlock(state, stmt.falsePart);
      }
      break;
    case "while":
      while (interpExpression(state, stmt.test)) {
        interpBlock(state, stmt.body);
      }
      break;
    case "print":
      console.log(interpExpression(state, stmt.expression));
      break;
    default:
      throw new Error("Error attempting to interpret statement");
  }
  return state;
}

function interpProgram(stmts) {
  let globalState = {};
  stmts.forEach((line) => {
    interpStatement(globalState, line);
  });
  return globalState;
}

module.exports = {
  interpExpression,
  interpStatement,
  interpProgram,
  getValue,
  setValue,
};
