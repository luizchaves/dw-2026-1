// create array
const numbers = [1, 2, 3, 4, 5];

// accessing values
console.log(numbers[0]); // 1
console.log(numbers[2]); // 3
console.log(numbers[4]); // 5

// adding values
numbers.push(6); // adds 6 to the end of the array
numbers.unshift(0); // adds 0 to the beginning of the array
console.log(numbers); // [0, 1, 2, 3, 4, 5, 6]

numbers[6] = 7; // adds 7 to the end of the array
console.log(numbers); // [0, 1, 2, 3, 4, 5, 7]

// changing values
numbers[6] = 70;
console.log(numbers); // [0, 1, 2, 3, 4, 5, 70]

// removing values
numbers.pop(); // removes the last element from the array
console.log(numbers); // [0, 1, 2, 3, 4, 5]

numbers.shift(); // removes the first element from the array
console.log(numbers); // [1, 2, 3, 4, 5]

delete numbers[4]; // removes the element at index 4
console.log(numbers); // [1, 2, 3, 4, <1 empty item>]

// length property
console.log(numbers); // [1, 2, 3, 4, <1 empty item>]
console.log(numbers.length); // 5

// multiple types
const host = [1, 'pc-professor', true, ['192.168.0.2', '10.0.0.2']];
console.log(host[0]); // 1
console.log(host[1]); // 'pc-professor'
console.log(host[2]); // true
console.log(host[3]); // ['192.168.0.2', '10.0.0.2']

// nested arrays
console.log(host[3][1]); // '10.0.0.2'

// destructuring arrays
// const id = host[0];
// const hostname = host[1];
// const status = host[2];
// const ipAddresses = host[3];
// host [1, 'pc-professor', true, ['192.168.0.2', '10.0.0.2']]
const [id, hostname, status, ipAddresses] = host;
console.log(id); // 1
console.log(hostname); // 'pc-professor'
console.log(status); // true
console.log(ipAddresses); // ['192.168.0.2', '10.0.0.2']

// spread operator
const newHost = [...host, 'AF:00:00:00:00:00'];
console.log(newHost);
// [1, 'pc-professor', true, ['192.168.0.2', '10.0.0.2'], 'AF:00:00:00:00:00']

// iteration
console.log(numbers); // [1, 2, 3, 4, <1 empty item>]

for (let i = 0; i < numbers.length; i++) {
  console.log(i, numbers[i]);
}

for (const value of numbers) {
  console.log(value);
}

for (const index in numbers) {
  console.log(index, numbers[index]);
}

for (const [index, value] of numbers.entries()) {
  console.log(index, value);
}

// iteration methods
numbers.forEach((value, index) => {
  console.log(index, value);
});

numbers.map((value) => value * 2); // [2, 4, 6, 8, <1 empty item>]

numbers.filter((value) => value > 3); // [4, 5]

numbers.find((value) => value > 3); // 4

// other methods
// includes
console.log(numbers.includes(3)); // true
console.log(numbers.includes(30)); // false
// indexOf
console.log(numbers.indexOf(3)); // 2
console.log(numbers.indexOf(30)); // -1
// join
console.log(numbers.join(' - ')); // '1 - 2 - 3 - 4 - 5'
// slice
console.log(numbers.slice(1, 4)); // [2, 3, 4]
// reverse
console.log(numbers.reverse()); // [5, 4, 3, 2, 1]
// sort
console.log([10, 1, 2].sort()); // [1, 10, 2]
console.log([10, 1, 2].sort((a, b) => a - b)); // [1, 2, 10]
console.log([10, 1, 2].sort((a, b) => b - a)); // [10, 2, 1]
