// Defining classes - Constructor, property, methods, static, private, inheritance

// Class Host (name, address)
class Host {
  static count = 0;

  constructor(name, address) {
    this.id = ++Host.count;
    this.name = name;
    this.address = address;
  }

  getHost() {
    return `${this.name} - ${this.address}`;
  }
}

const host = new Host('IFPB', 'www.ifpb.edu.br');
console.log(host); //=> Host { id: 1, name: 'IFPB', address: 'www.ifpb.edu.br' }
console.table(host);
// ┌─────────┬───────────────────┐
// │ (index) │ Values            │
// ├─────────┼───────────────────┤
// │ id      │ 1                 │
// │ name    │ 'IFPB'            │
// │ address │ 'www.ifpb.edu.br' │
// └─────────┴───────────────────┘
console.log(host.getHost()); //=> IFPB - www.ifpb.edu.br

// Class IfpbHost extends Host (name, address, campus)
class EduHost extends Host {
  constructor(name, address, campus) {
    super(name, address);
    this.campus = campus;
  }

  getHost() {
    return `${super.getHost()} - ${this.campus}`;
  }
}

const ifpbHost = new EduHost('IFPB', 'www.ifpb.edu.br', 'João Pessoa');
console.log(ifpbHost); //=> EduHost { id: 2, name: 'IFPB', address: 'www.ifpb.edu.br', campus: 'João Pessoa' }
console.log(ifpbHost.getHost()); //=> IFPB - www.ifpb.edu.br - João Pessoa

// HostSet (add, getHosts) / Encapsulation / Private properties
class HostSet {
  #hosts = [];

  add(host) {
    this.#hosts.push(host);
  }

  getHosts() {
    return this.#hosts;
  }
}

const hostSet = new HostSet();
hostSet.add(host);
hostSet.add(ifpbHost);
console.log(hostSet.hosts); //=> undefined
console.log(hostSet.getHosts()); //=> [Host, EduHost]
console.table(hostSet.getHosts());
// ┌─────────┬────┬────────┬───────────────────┬───────────────┐
// │ (index) │ id │ name   │ address           │ campus        │
// ├─────────┼────┼────────┼───────────────────┼───────────────┤
// │ 0       │ 1  │ 'IFPB' │ 'www.ifpb.edu.br' │               │
// │ 1       │ 2  │ 'IFPB' │ 'www.ifpb.edu.br' │ 'João Pessoa' │
// └─────────┴────┴────────┴───────────────────┴───────────────┘
console.log(JSON.stringify(hostSet.getHosts()));
//=> [{"id":1,"name":"IFPB","address":"www.ifpb.edu.br"},{"id":2,"name":"IFPB","address":"www.ifpb.edu.br","campus":"João Pessoa"}]
console.log(JSON.stringify(hostSet.getHosts(), null, 2));
// [
//   {
//     "id": 1,
//     "name": "IFPB",
//     "address": "www.ifpb.edu.br"
//   },
//   {
//     "id": 2,
//     "name": "IFPB",
//     "address": "www.ifpb.edu.br",
//     "campus": "João Pessoa"
//   }
// ]

// JSON - JavaScript Object Notation
// id: 1
// name: 'IFPB'
// address: 'www.ifpb.edu.br'
const hostJson = {
  id: 1,
  name: 'IFPB',
  address: 'www.ifpb.edu.br',
};

// console.log({
//   "id": 1,
//   "name": 'IFPB',
//   "address": 'www.ifpb.edu.br',
// });

console.log(hostJson); //=> { id: 1, name: 'IFPB', address: 'www.ifpb.edu.br' }
console.log(hostJson.id); //=> 1
console.log(hostJson['id']); //=> 1

// Property Shorthand
const name = 'IFPB';
const address = 'www.ifpb.edu.br';

console.log({
  name: name,
  address: address,
}); //=> { name: 'IFPB', address: 'www.ifpb.edu.br' }

console.log({
  name,
  address,
}); //=> { name: 'IFPB', address: 'www.ifpb.edu.br' }

// Destructuring properties
const router = {
  manufacturer: 'Cisco',
  model: 'C9200L-24P-4G',
  ip: '192.168.0.1',
  isActive: true,
};

// const manufacturer = router.manufacturer;
// const model = router.model;
const { manufacturer, model } = router;

// Spread properties / copy Reference vs value
const router1 = router; // Copy Reference

router1.ip = '192.168.0.2';

console.log(router.ip); //=> '192.168.0.2'

const router2 = { ...router }; // Copy Value

router2.ip = '192.168.0.3';

console.log(router.ip); //=> '192.168.0.2'

// Dynamic property
const property = 'campus';
const campus = 'João Pessoa';
console.log({
  ...router,
  ip: '192.168.0.1',
  property: campus, // property: 'João Pessoa'
  [property]: campus, // campus: 'João Pessoa'
});

// JSON - JSON.stringify, JSON.parse

console.log(host); //=> Host { id: 1, name: 'IFPB', address: 'www.ifpb.edu.br' }
console.log(JSON.stringify(host)); //=> '{"id":1,"name":"IFPB","address":"www.ifpb.edu.br"}'
console.log(JSON.stringify(host, null, 2));
// {
//   "id": 1,
//   "name": "IFPB",
//   "address": "www.ifpb.edu.br"
// }

const hostJsonString = '{"id":1,"name":"IFPB","address":"www.ifpb.edu.br"}';
console.log(hostJsonString.id); //=> undefined
console.log(JSON.parse(hostJsonString)); //=> { id: 1, name: 'IFPB', address: 'www.ifpb.edu.br' }
console.log(JSON.parse(hostJsonString).id); //=> 1

// Object - Object.keys, Object.values, Object.entries
for (const key in host) {
  console.log(key); //=> id, name, address
}

// TypeError: host is not iterable
// for (const value of host) {
//   console.log(value);
// }

console.log(Object.keys(host)); //=> [ 'id', 'name', 'address' ]
console.log(Object.values(host)); //=> [ 1, 'IFPB', 'www.ifpb.edu.br' ]
console.log(Object.entries(host)); //=> [ [ 'id', 1 ], [ 'name', 'IFPB' ], [ 'address', 'www.ifpb.edu.br' ] ]

for (const value of Object.values(host)) {
  console.log(value); //=> 1, IFPB, www.ifpb.edu.br
}

for (const [key, value] of Object.entries(host)) {
  console.log(`${key}: ${value}`); //=> id: 1, name: IFPB, address: www.ifpb.edu.br
}
