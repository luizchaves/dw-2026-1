// if
// falsy: false, 0, -0, 0n, "", null, undefined, NaN
// truthy: !falsy
const number = 10;

if (number > 0) {
  console.log('positive');
}

if (number > 0) console.log('positive');

if (number > 0) {
  console.log('positive');
} else {
  console.log('negative');
}

// ternary: a ? b : c
// if a is truthy, return b
// if a is falsy, return c
const isPositive = number > 0 ? 'positive' : 'negative';
console.log(isPositive);

if (number > 0) {
  console.log('positive');
} else if (number < 0) {
  console.log('negative');
} else {
  console.log('zero');
}

// switch
const number1 = 20;
const number2 = 10;
const operador = '+'; // '+', '-', '*', '/'

if (operador === '+') {
  console.log(number1 + number2);
} else if (operador === '-') {
  console.log(number1 - number2);
} else if (operador === '*') {
  console.log(number1 * number2);
} else if (operador === '/') {
  console.log(number1 / number2);
} else {
  console.log('Invalid operator');
}

switch (operador) {
  case '+':
    console.log(number1 + number2);
    break;
  case '-':
    console.log(number1 - number2);
    break;
  case '*':
    console.log(number1 * number2);
    break;
  case '/':
    console.log(number1 / number2);
    break;
  default:
    console.log('Invalid operator');
}

switch (true) {
  case number > 0:
    console.log('positive');
    break;
  case number < 0:
    console.log('negative');
    break;
  default:
    console.log('zero');
}

// while
let flag = 1;

while (flag < 10) {
  console.log(flag);
  flag++;
}

// do...while
flag = 1;

do {
  console.log(flag);
  flag++;
} while (flag < 10);

// for
for (let i = 1; i < 10; i++) {
  console.log(i);
}

console.log(`
00, 01, 02, 03, 04, 05, 06, 07, 08, 09,
10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
90, 91, 92, 93, 94, 95, 96, 97, 98, 99
`)

let result = '';

for (let i = 0; i < 100; i++) {
  if (i < 10) result += '0';
  result += i;
  if (i < 99) result += ',';
  result += (i % 10 === 9) ? '\n' : ' ';
}

console.log(result);
