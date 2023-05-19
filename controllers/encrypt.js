const crypto = require('crypto');
algorithm = 'aes-256-ctr',
password = 'bus692cal';

function encrypt(password) {
    const encryptedPassword = crypto.pbkdf2Sync(password, 'buscal', 100000, 64, 'sha512');
    return encryptedPassword.toString('base64');
}

function encryptID(id) {
  try{
    const encryptedID = crypto.pbkdf2Sync(id, 'buscal', 100000, 64, 'sha512').toString("hex").toUpperCase().slice(-8);
    return encryptedID
  }catch(err){
    throw new Error(`Can't encrypt: ${err.message}`)
  }
}

module.exports = {
    encrypt,
    encryptID
};