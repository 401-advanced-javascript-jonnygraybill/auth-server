'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const Role = require('./roles-model');
const auth = require('./middleware.js');
const singleAuth = require('./middleware.js');
const blacklist = require('./users-model.js');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/roles', (req, res, next) => {
  let role = new Role(req.body);
  role.save()
    .then( (role) => {
      res.send(role);
    }).catch(next);
});

//attempt at single-use
authRouter.post('/single-request', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.payload = user.generateSingleToken();
      req.user = user;
      res.set('payload', req.payload);
      res.cookie('singleAuth', req.payload);
      res.send(req.payload);
    }).catch(next);
});

authRouter.post('/signin', auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/single', singleAuth, (req, res, next) => {
  res.cookie('singleAuth', req.payload);
  res.send(`😋 ${req.payload}`);
});


module.exports = authRouter;
