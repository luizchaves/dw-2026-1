// Boolean
console.log(true);
console.log(false);

// Nullish
// Null
console.log(null);

// Undefined
console.log(undefined);

// Number
console.log(-15);
console.log(15);
console.log(0b1111);
console.log(0o17);
console.log(0xf);
console.log(3.14);
console.log(314e-2);
console.log(Math.PI);
console.log(NaN);
console.log(10 - 'a'); // NaN
console.log(isNaN(10 - 'a')); // true
console.log(Infinity);
console.log(1 / 0); // Infinity
console.log(-Infinity);
// IEE 754
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 == 0.3); // false

// String
const name = 'IFPB';
console.log('Hello, World!');
console.log("Hello, World!");
console.log("Hello, " + name);
console.log(`Hello, ${name}!`);
console.log(`Hello,
  World!`);

// Array
console.log([1, 2, 3]);
console.log(['a', 'b', 'c']);
console.log([1, 'a', true, null, undefined]);
console.log([1, 'Fulano', true, ['fulano@email.com']]);

// Object / JSON
console.log({
  id: 1,
  name: 'Fulano',
  active: true,
  emails: ['fulano@email.com']
});
