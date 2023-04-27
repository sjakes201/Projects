// Parser provided

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const P = require("parsimmon");
const a = require("./ast");
const { error, ok } = require("./result");
const tc = require("./tc");
let ws = P.optWhitespace;
function token(name_tok) {
  return ws.then(P.string(name_tok)).skip(ws);
}

function operator(name_op) {
  return P.string(name_op).skip(ws);
}

let num = P.regexp(/-?[0-9]+/)
  .desc("integer")
  .skip(ws)
  .map(str => a.number(Number(str)));
let name = P.regexp(/[A-Za-z]+/)
  .desc("variable name")
  .skip(ws);
let bool = P.string("true")
  .map(_ => true)
  .or(P.string("false").map(_ => false))
  .skip(ws)
  .map(b => a.bool(b));
let atom = ws.then(
  bool
    .or(name.map(str => a.variable(str)))
    .or(num)
    .or(P.lazy(() => expr.wrap(operator("("), operator(")"))))
);
let mul = P.lazy(() =>
  atom.chain(
    (
      lhs // get left hand side with atom
    ) =>
      P.seq(operator("*").or(operator("/")), atom)
        .many()
        .map(opNumArr => {
          // get as many sequences of operator x atom pairs
          return opNumArr.reduce((acc, currVal) => {
            // reduce over the array of pairs
            if (currVal[0] === "*") {
              return a.operator("*", acc, currVal[1]); // build tree with acc as lhs
            }
            return a.operator("/", acc, currVal[1]);
          }, lhs);
        })
  )
);
let add = P.lazy(() =>
  mul.chain(lhs =>
    P.seq(operator("+").or(operator("-")), mul)
      .many()
      .map(opNumArr => {
        // get many sequences of operator x multiplication expression pairs
        return opNumArr.reduce((acc, currVal) => {
          if (currVal[0] === "+") {
            return a.operator("+", acc, currVal[1]);
          }
          return a.operator("-", acc, currVal[1]);
        }, lhs);
      })
  )
);
let cmp = P.lazy(() =>
  add.chain(lhs =>
    P.seq(operator(">").or(operator("<")).or(operator("===")), add)
      .many()
      .map(opNumArr => {
        return opNumArr.reduce((acc, currVal) => {
          if (currVal[0] === ">") {
            return a.operator(">", acc, currVal[1]);
          }
          if (currVal[0] === "<") {
            return a.operator("<", acc, currVal[1]);
          }
          return a.operator("===", acc, currVal[1]);
        }, lhs);
      })
  )
);
let and = P.lazy(() =>
  cmp.chain(lhs =>
    P.seq(operator("&&"), cmp)
      .many()
      .map(opNumArr => {
        return opNumArr.reduce((acc, currVal) => a.operator("&&", acc, currVal[1]), lhs);
      })
  )
);
let or = P.lazy(() =>
  and.chain(lhs =>
    P.seq(operator("||"), and)
      .many()
      .map(opNumArr => {
        return opNumArr.reduce((acc, currVal) => a.operator("||", acc, currVal[1]), lhs);
      })
  )
);
let expr = or;
let stmt = P.lazy(() =>
  token("let")
    .then(name.skip(operator("=")).chain(name => expr.skip(operator(";")).map(expression => a.let_(name, expression))))
    .or(
      token("if")
        .then(expr.wrap(operator("("), operator(")")))
        .chain(test =>
          block.skip(token("else")).chain(truePart => block.map(falsePart => a.if_(test, truePart, falsePart)))
        )
    )
    .or(
      token("while")
        .then(expr.wrap(operator("("), operator(")")))
        .chain(test => block.map(body => a.while_(test, body)))
    )
    .or(
      token("print")
        .then(expr.wrap(operator("("), operator(")")))
        .skip(operator(";"))
        .map(expression => ({ kind: "print", expression }))
    )
    .or(
      name.skip(operator("=")).chain(name => expr.skip(operator(";")).map(expression => a.assignment(name, expression)))
    )
);

let block = P.lazy(() => stmt.many().wrap(operator("{"), operator("}")));
function commaOr(strings) {
  if (strings.length <= 1) {
    return strings.join("");
  }
  let last = strings.pop();
  return strings.join(", ") + ", or " + last;
}
function parseExpression(input) {
  let result = expr.skip(P.eof).parse(input.trim());
  if (result.status) {
    return ok(result.value);
  } else {
    return error(`Parse error. Expected ${commaOr(result.expected)}`);
  }
}
exports.parseExpression = parseExpression;
function parseProgram(input) {
  let result = stmt.many().skip(P.eof).parse(input.trim());
  if (result.status) {
    const stmts = result.value;
    return tc.tc(stmts).map(_ => stmts);
  } else {
    return error(`Parse error. Expected ${commaOr(result.expected)} at Line ${result.index.line}`);
  }
}
exports.parseProgram = parseProgram;
