'use strict';

const ROPSTEN_HOST = null;
const ROPSTEN_PORT = null;

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      gas: 5000000,
      network_id: '*'
    },
    ropsten: {
      host: ROPSTEN_HOST,
      port: ROPSTEN_PORT,
      gas: 4000000,
      network_id: 3,
      gasPrice: 10e9
    }
  }
};
