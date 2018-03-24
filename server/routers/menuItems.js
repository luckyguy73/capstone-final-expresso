// Import expressjs and create route handler
const express = require('express');
const menuItems = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItems.param('menuId', (req,res,next,id) => {
  db.get(`select * from Menu where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.menu = row;
      next();
    } else res.status(404).send();
  });
});

menuItems.param('menuItemId', (req,res,next,id) => {
  db.get(`select * from MenuItem where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.menuItem = row;
      next();
    } else res.status(404).send();
  });
});

menuItems.get('/', (req,res,next) => {
  db.all(`select * from MenuItem where menu_id = ${req.menu.id}`, (err,rows) => {
    if(err) res.status(500).send();
    else res.status(200).send({menuItems: rows});
  });
});

menuItems.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const desc = req.body.menuItem.description;
  const inv = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  if (!name || !inv || !price) return res.status(400).send();
  db.run(`insert into MenuItem (name, description, inventory, price, menu_id) 
  values ('${name}', '${desc}', ${inv}, ${price}, ${req.menu.id})`, function(err) {
    if (err) next(err);
    else db.get(`select * from MenuItem where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({menuItem: row});
    });
  });
});

menuItems.put('/:menuItemId', (req,res,next) => {
  const name = req.body.menuItem.name;
  const desc = req.body.menuItem.description;
  const inv = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  if (!name || !inv || !price) return res.status(400).send();
  db.run(`update MenuItem set name = '${name}', description = '${desc}', inventory = ${inv},
  price = ${price} where id = ${req.menuItem.id}`, function(err) {
    if (err) next(err);
    else db.get(`select * from MenuItem where id = ${req.menuItem.id}`, (err, row) => {
      res.status(200).send({menuItem: row});
    });
  });
});

menuItems.delete('/:menuItemId', (req,res,next) => {
  db.run(`delete from MenuItem where id = ${req.menuItem.id}`, (err) => {
    if (err) next(err);
    else res.status(204).send();
  });
});

// Export module
module.exports = menuItems;