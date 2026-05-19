import cuid from 'cuid';
import { hosts } from '../database/data.js';
import { HostNotFoundError, InvalidHostError } from '../errors/HostError.js';

function create({ name, ip, address, os, group, status, uptime, id }) {
  id = id ?? cuid();
  const hostIp = ip ?? address;

  if (!name || !hostIp) {
    throw new InvalidHostError('Error when passing parameters');
  }

  const newHost = { name, ip: hostIp, os, group, status, uptime, id };

  hosts.push(newHost);

  return newHost;
}

function read(where) {
  if (where) {
    const field = Object.keys(where)[0];

    const value = where[field];

    const filteredHosts = hosts.filter((host) =>
      typeof host[field] === 'string'
        ? host[field].toLowerCase().includes(value.toLowerCase())
        : host[field] === value
    );

    return filteredHosts;
  }

  return hosts;
}

function readById(id) {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  const index = hosts.findIndex((host) => host.id === id);

  if (!hosts[index]) {
    throw new HostNotFoundError('Host not found');
  }

  return hosts[index];
}

function update({ id, name, ip, address, os, group, status, uptime }) {
  const hostIp = ip ?? address;

  if (!name || !hostIp || !id) {
    throw new InvalidHostError('Error when passing parameters');
  }

  const index = hosts.findIndex((host) => host.id === id);

  if (!hosts[index]) {
    throw new HostNotFoundError('Host not found');
  }

  const newHost = { name, ip: hostIp, os, group, status, uptime, id };

  hosts[index] = newHost;

  return newHost;
}

function remove(id) {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  const index = hosts.findIndex((host) => host.id === id);

  if (!hosts[index]) {
    throw new HostNotFoundError('Host not found');
  }

  hosts.splice(index, 1);

  return true;
}

export default { create, read, readById, update, remove };
