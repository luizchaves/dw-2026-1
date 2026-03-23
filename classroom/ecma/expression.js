// expression: keywords, literal, operadores, variáveis, chamadas de função, etc
const a = 10;

// ASI (Automatic Semicolon Insertion)
const b = 20
console.log(a + b) // 30

const c = 30;
console.log(a + b + c); // 60

const d = 40; const e = 50
console.log(d + e); // 90

const f = 60, g = 70;
console.log(f + g); // 130

// Coercion
console.log('10' + 20); // '1020'
console.log(Number('10') + 20); // 30
console.log(+'10' + 20); // 30
console.log('10' - 20); // -10
console.log(Number('10') - 20); // -10

// associativity, precedence

// arithmetic expression
// +, -, *, /, %, **
// return Number
console.log(10 + 20); // 30
console.log(20 - 10); // 10
console.log(10 * 20); // 200
console.log(20 / 10); // 2
console.log(20 % 10); // 0
console.log(10 ** 2); // 100

// Comparison expression
// >, <, >=, <=
// return Boolean
console.log(10 > 20); // false
console.log(10 < 20); // true
console.log(10 >= 20); // false
console.log(10 <= 20); // true

// Equality expression
// ==, ===, !=, !==
// return Boolean
console.log(10 == 20); // false
console.log(10 === 20); // false
console.log(10 != 20); // true
console.log(10 !== 20); // true
console.log(10 == '10'); // true
console.log(10 === '10'); // false
