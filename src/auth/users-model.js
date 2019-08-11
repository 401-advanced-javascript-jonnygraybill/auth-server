'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const roles = require('../auth/roles-model');

const usedTokens = new Set();


const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['superuser','supervisor','editor', 'admin','user']},
}, {toObject:{virtuals:true}, toJSON:{virtuals:true}} );

users.virtual('acl', {
  ref:'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: true,
});

users.pre('findOne', function() {
  try {
    this.populate('acl');
  }
  catch(e) {
    throw new Error(e.message);
  }
});

users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(console.error);
});

users.statics.authenticateToken = function(token) {
  if (usedTokens.has(token)) {
    return Promise.reject('Token has already been used');
  }
  usedTokens.add(token);
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

users.methods.can = function(capability) {
  console.log(`🗻 ${capability}`)
  console.log(`📱 ${this}`);
  return this.acl.capabilities.includes(capability);
};

users.methods.generateSingleToken = function() {
  let payload = {
    id: this._id,
    role: this.role,
    jti: crypto.randomBytes(20).toString('hex')
  };
  return jwt.sign(payload, process.env.SECRET, {expiresIn: "15m"});
}

module.exports = mongoose.model('users', users);