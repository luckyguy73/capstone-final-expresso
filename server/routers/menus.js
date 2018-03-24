// Import expressjs and create route handler
const express = require('express');
const menus = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItems = require('./menuItems');
menus.use('/:menuId/menu-items', menuItems);

menus.param('menuId', (req,res,next,id) => {
  db.get(`select * from Menu where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.menu = row;
      next();
    } else res.status(404).send();
  });
});

menus.get('/', (req,res,next) => {
  db.all(`select * from Menu`, (err,rows) => {
    if(err) next(err);
    else res.status(200).send({menus: rows});
  });
});

menus.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) return res.status(400).send();
  db.run(`insert into Menu (title) 
  values ('${title}')`, function(err) {
    if (err) next(err);
    else db.get(`select * from Menu where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({menu: row});
    });
  });
});

menus.get('/:menuId', (req,res,next) => {
  res.status(200).send({menu: req.menu});
});

menus.put('/:menuId', (req,res,next) => {
  const title = req.body.menu.title;
  if (!title) return res.status(400).send();
  db.run(`update Menu set title = '${title}' where id = ${req.menu.id}`, function(err) {
    if (err) next(err);
    else db.get(`select * from Menu where id = ${req.menu.id}`, (err, row) => {
      res.status(200).send({menu: row});
    });
  });
});


menus.delete('/:menuId', (req,res,next) => {
  db.get(`select * from MenuItem where menu_id = ${req.menu.id}`, (err, issue) => {
    if (err) next(err);
    else if (issue) res.status(400).send();
    else db.run(`delete from Menu where id = ${req.menu.id}`, (err) => {
      if (err) next(err);
      else res.status(204).send();
    });
  });
});

// Export module
module.exports = menus;