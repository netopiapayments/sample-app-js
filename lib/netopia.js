const { Netopia, Ipn } = require('netopia-payment2');

const netopia = new Netopia({
  apiKey: process.env.API_KEY,
  posSignature: process.env.POS_SIGNATURE,
  isLive: false,
});

const ipn = new Ipn({
  posSignature: process.env.POS_SIGNATURE,
  posSignatureSet: [process.env.POS_SIGNATURE],
  publicKeyStr: process.env.PUBLIC_KEY_STR,
  hashMethod: 'sha512',
  alg : 'RS512'
});

module.exports = { netopia, ipn };
