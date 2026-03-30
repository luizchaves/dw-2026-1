// function declaration
function sum(a, b) {
  return a + b;
}

// anonymous function
// function expression
const subtract = function (a, b) {
  return a - b;
};

// arrow function
const multiply = (a, b) => {
  return a * b;
};

// arrow function with implicit return
const divide = (a, b) => a / b;

// function call
console.log(sum(10, 5)); // 15
console.log(subtract(10, 5)); // 5
console.log(multiply(10, 5)); // 50
console.log(divide(10, 5)); // 2

console.log(sum(10)); // NaN
console.log(sum(10, 5, 20)); // 15

// default parameters
function pow(a, b = 1) {
  return a ** b;
}

console.log(pow(10, 2)); // 100
console.log(pow(10)); // 10

// rest parameters
function sumAll(...numbers) {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

console.log(sumAll(10, 20, 30)); // 60 | numbers = [10, 20, 30]
console.log(sumAll(10, 20)); // 30 | numbers = [10, 20]
console.log(sumAll(10)); // 10 | numbers = [10]
console.log(sumAll()); // 0 | numbers = []

// callback function
function calculate(a, b, operation) {
  return operation(a, b);
}

console.log(calculate(10, 5, sum)); // 15
console.log(calculate(10, 5, subtract)); // 5
console.log(calculate(10, 5, multiply)); // 50
console.log(calculate(10, 5, divide)); // 2
console.log(calculate(10, 5, (a, b) => a % b)); // 0
console.log(calculate(10, 5, function (a, b) { return a ** b; })); // 100

