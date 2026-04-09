// String ', ", `
// DSK01LB65-JP
console.log('DSK01LB65-JP');
console.log("DSK01LB65-JP");
console.log(`DSK01LB65-JP`);

// Concat
// IP: 192.168.0.1
// Mask: 255.255.255.0
const ip = '192.168.0.1';
const mask = '255.255.255.0';
console.log('IP: ' + ip + ', Mask: ' + mask);

// Template literals / Template strings
// string interpolation
console.log(`IP: ${ip}, Mask: ${mask}`);
// multi-line strings
console.log(`IP: ${ip},
Mask: ${mask}`);

// Array of characters (immutable)
const hostname = 'dsk01lb65-jp';
console.log(hostname[0]); // 'd'

hostname[0] = 'D'; // does not change the string
console.log(hostname); // 'dsk01lb65-jp'

// Object String

// String.length
console.log(hostname.length); // 12

// String.split / Array.join
// 192.168.0.1, 192.168.0.2, 192.168.0.3
const ips = '192.168.0.1, 192.168.0.2, 192.168.0.3';
const ipArray = ips.split(', ');
console.log(ipArray); // ['192.168.0.1', '192.168.0.2', '192.168.0.3']

// IP: 192.168.0.1
// IP: 192.168.0.3
// IP: 192.168.0.2
for (const ip of ipArray) {
  console.log(`IP: ${ip}`);
}

// String.trim
const userInput = '   hello world   ';
console.log(userInput.trim()); // 'hello world'

// String.toLowerCase
const upperCaseString = 'HELLO WORLD';
console.log(upperCaseString.toLowerCase()); // 'hello world'

// String.includes
// JP?
console.log(hostname.includes('JP')); // true

// String.match
// /\d+\.\d+\.\d+\.\d+/
// 192.168.0.1, 192.168.0.2, 192.168.0.3
console.log(ips); // '192.168.0.1, 192.168.0.2, 192.168.0.3'
console.log(ips.match(/\d+\.\d+\.\d+\.\d+/g)); // ['192.168.0.1', '192.168.0.2', '192.168.0.3']

// String.padStart
// DSK01LB65-JP => DSK001LB065-JP
const desktop = String(1).padStart(3, '0');
const laboratory = String(65).padStart(3, '0');
const campus = 'jp'.toUpperCase();
const newHostname = `DSK${desktop}LB${laboratory}-${campus}`;
console.log(newHostname); // 'DSK001LB065-JP'
