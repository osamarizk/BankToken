require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const { API_URL, MNEMONIC } = process.env;

module.exports = {
  
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
    
     rinkeby: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, API_URL)
      
      },
      network_id:4,
      gas: 4000000, //4M is the max,
      from: "0xeE665A0a39D20805AC9668Fadbf5D313003Fd5DC",
      
  
     
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.1",
       optimizer: {
         enabled: false,
         runs: 200
       }
    }
  },

  
};
