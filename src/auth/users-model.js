'use strict';

const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const faker = require('faker');
// const f = new Faker();
// let str = f.Random.Chars(size);
const fakeShit = Math.random(+ 15).toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
console.log(fakeShit);

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

console.log(makeid(5));


const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
  jti: {type:String, required:true, default:fakeShit}
});

// const blacklist = new mongoose.Schema({
//   jti: {type:String},
// })



users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(console.error);
});

users.statics.authenticateToken = function(token) {
  let parsedToken = jwt.verify(token, process.env.SECRET || "changeit");
  console.log(parsedToken);
  let query = {_id:parsedToken.id};
  return this.findOne(query);
}

users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

users.methods.generateToken = function() {
  let token = {
    id: this._id,
    role: this.role,
  };
  return jwt.sign(token, process.env.SECRET, {expiresIn: "15m"});
};

// let payload = {
//   id: this._id
// };

// let secret = process.env.SECRET;

// let singleToken = jwt2.encode(payload, secret);
// console.log(`🥶 ${singleToken}`);

// let decode = jwt2.decode(singleToken, secret);
// console.log(decode);


users.methods.generateSingleToken = function() {
  let payload = {
    id: this._id,
    role: this.role,
    jti: crypto.randomBytes(20).toString('hex')
  };
  return jwt.sign(payload, process.env.SECRET, {expiresIn: "15m"});
}

module.exports = mongoose.model('users', users);
// module.exports = mongoose.model('blacklist', blacklist);
