'use strict';

const express = require('express');
const auth = require('./middleware.js');

const router = express.Router();

router.get('/public-stuff', (req,res) => {
  res.status(200).send('Welcome to the jungle');
});

router.get('/hidden-stuff', auth(), (req,res) => {
  res.status(200).send('Enjoy this - you can only read stuff.');
});

router.get('/something-to-read', auth('read'), (req,res) => {
  res.status(200).send('Enjoy reading this.');
});

router.post('/create-a-thing', auth('create'), (req,res) => {
  res.status(200).send('Enjoy creating this.');
});

router.put('/update', auth('update'), (req,res) => {
  res.status(200).send('Enjoy updating this.');
});

router.patch('/jp', auth('update'), (req,res) => {
  res.status(200).send('Enjoy updating this.');
});

router.delete('/bye-bye', auth('delete'), (req,res) => {
  res.status(200).send('Enjoy deleting this.');
});

router.get('/everything', auth('delete'), (req,res) => {
  res.status(200).send('Enjoy everything.');
});

module.exports = router;