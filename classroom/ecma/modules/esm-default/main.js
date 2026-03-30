// EcmaScript module (ESM) - Named and default exports
import MathLib, { sum, subtract, multiply, divide } from './lib.js';

console.log(sum(10, 5)); // 15
console.log(subtract(10, 5)); // 5
console.log(multiply(10, 5)); // 50
console.log(divide(10, 5)); // 2
console.log(MathLib.sum(10, 5)); // 15
console.log(MathLib.subtract(10, 5)); // 5
console.log(MathLib.multiply(10, 5)); // 50
console.log(MathLib.divide(10, 5)); // 2
