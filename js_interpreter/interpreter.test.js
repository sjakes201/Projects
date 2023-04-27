"use strict";

const assert = require("assert");
const { parseExpression, parseProgram } = require("../include/parser.js");
const {
  interpExpression,
  interpProgram,
  interpStatement,
  getValue,
  setValue,
} = require("./interpreter.js");

test("getValue and setValue from state", () => {
  // let emptyState = {};
  // console.log(getValue(emptyState, favoriteNum));
  let state = { age: 21, isTall: true, name: "Jake" };
  assert(getValue(state, "age") === 21);
  assert(getValue(state, "isTall") === true);
  assert(getValue(state, "name") === "Jake");
  let creating = {};
  setValue(false, creating, "height", "tall");
  setValue(false, creating, "inCollege", true);
  setValue(false, creating, "legs", 2);
  assert(getValue(creating, "height") === "tall");
  assert(getValue(creating, "inCollege") !== false);
  assert(getValue(creating, "legs") === 2);
});

test("interpExpression interprets multiplication with a variable", () => {
  // console.log(parseExpression("x * 2"));
  const r = interpExpression({ x: 10 }, parseExpression("x * 2").value);
  assert(r === 20);
});

test("interpExpression interprets === correctly", () => {
  // console.log(parseExpression("true === true"));
  assert(interpExpression({}, parseExpression("true === true").value));
  assert(!interpExpression({}, parseExpression("true === false").value));
  assert(interpExpression({}, parseExpression("5 === 5").value));
  assert(!interpExpression({}, parseExpression("6 === 5").value));
});

test("interpExpression interprets more complicated expressions correctly", () => {
  assert(
    interpExpression({ x: 5, y: 2 }, parseExpression(" x * x * y").value) === 50
  );
  assert(
    interpExpression(
      {},
      parseExpression("true === true === ((5 - 5) === 0)").value
    ) === true
  );
  assert(
    interpExpression(
      {},
      parseExpression("false === true === ((5 - 5) === 0)").value
    ) === false
  );
  assert(
    interpExpression({ num: 500 }, parseExpression("(3 - num) * 2").value) ===
      -994
  );
  assert(interpExpression({}, parseExpression("(3-2) < 2").value) === true);
  assert(interpExpression({}, parseExpression("-50 > 0").value) === false);
  assert(
    interpExpression(
      { boolie: true },
      parseExpression("boolie && true").value
    ) === true
  );
  assert(
    interpExpression(
      { boolie: true },
      parseExpression("boolie && false").value
    ) === false
  );
  assert(
    interpExpression(
      { boolie: true },
      parseExpression("boolie || false").value
    ) === true
  );
});

test("interpStatement", () => {
  let state = {};
  interpStatement(state, {
    kind: "let",
    name: "favNum",
    expression: { kind: "number", value: 5 },
  });
  interpStatement(state, {
    kind: "let",
    name: "isShort",
    expression: { kind: "boolean", value: false },
  });
  assert(state["favNum"] === 5);
  assert(state["isShort"] === false);
  interpStatement(state, {
    kind: "assignment",
    name: "favNum",
    expression: { kind: "number", value: 20 },
  });
  assert(state["favNum"] === 20);
  let otherState = {};
  interpStatement(otherState, {
    kind: "if",
    test: { kind: "boolean", value: true },
    truePart: [
      {
        kind: "let",
        name: "varATrue",
        expression: { kind: "number", value: 67 },
      },
      {
        kind: "let",
        name: "varAATrue",
        expression: { kind: "number", value: 68 },
      },
    ],
    falsePart: [
      {
        kind: "let",
        name: "varBFalse",
        expression: { kind: "number", value: 55 },
      },
    ],
  });
  // assert(otherState.varATrue === 67 && otherState.varAATrue === 68);
  // interpStatement(state, {kind: "assignment", name: "favColorIsRed", expression: {kind: 'boolean', value: false}}); //successfully errored
});

test("interpProgram interprets basic declaration then assignment then loop then print", () => {
  const st = interpProgram(
    parseProgram("let x = 10; x = 3; while(x > 0) { x = x - 1; print(x);}")
      .value
  );
});

test("interpProgram interprets more complicated programs", () => {
  const st = interpProgram(
    parseProgram("let x = 10; x = 20; x = x * 10;").value
  );
  assert(st.x === 200);

  const more = interpProgram(
    parseProgram(
      "let x = 0; if(7 === (8-1)) { let b = 99; x = 10; } else { print(2); }"
    ).value
  );
  assert(more.x === 10);
  assert(!("b" in more));
});
