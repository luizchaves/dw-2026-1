x = 10;
console.log(x);

// const, let, var
const value = 20;
console.log(value); // 20

// TypeError: Assignment to constant variable.
// value = 30;

// 'const' declarations must be initialized.
// const y;

const values = [1, 2, 3];
console.log(values); // [1, 2, 3]

values.push(4);
console.log(values); // [1, 2, 3, 4])

// Cannot redeclare block-scoped variable 'values'.
// const values = 10;

// let
let count = 0;
console.log(count); // 0

count = 1;
console.log(count); // 1

// var
var name = 'Alice';
console.log(name); // Alice

var name = 'Bob';
console.log(name); // Bob
