"use strict";

const { parseProgram } = require("./include/parser.js");
const { interpProgram } = require("./interpreter.js");

const program = `
  let n = 20;

  let a = 1;
  let b = 1; 

  while (n > 0) {
    let c = b;

    b = b + a;

    a = c;

    n = n - 1;
  }

  print(b);
`;

const result = parseProgram(program);

if (result.ok) {
  try {
    const state = interpProgram(result.value);
    console.log(`Program successfully terminated: ${JSON.stringify(state)}`);
  } catch (e) {
    console.log("Runtime Error: " + e);
  }
} else {
  console.log("Parsing Error: " + result.message);
}
