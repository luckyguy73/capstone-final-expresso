// Import expressjs and create route handler
const express = require('express');
const employees = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheets = require('./timesheets');
employees.use('/:employeeId/timesheets', timesheets);

employees.param('employeeId', (req,res,next,id) => {
  db.get(`select * from Employee where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.employee = row;
      next();
    } else res.status(404).send();
  });
});

employees.get('/', (req,res,next) => {
  db.all(`select * from Employee where is_current_employee = 1`, (err,rows) => {
    if(err) res.status(500).send();
    else res.status(200).send({employees: rows});
  });
});

employees.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const pos = req.body.employee.position;
  const wage = req.body.employee.wage;
  const emp = req.body.employee.isCurrentEmployee;
  if (!name || !pos || !wage) return res.status(400).send();
  db.run(`insert into Employee (name, position, wage, is_current_employee) 
  values ('${name}', '${pos}', ${wage}, '${emp===0?0:1}')`, function(err) {
    if (err) next(err);
    else db.get(`select * from Employee where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({employee: row});
    });
  });
});

employees.get('/:employeeId', (req,res,next) => {
  res.status(200).send({employee: req.employee});
});

employees.put('/:employeeId', (req,res,next) => {
  const name = req.body.employee.name;
  const pos = req.body.employee.position;
  const wage = req.body.employee.wage;
  const emp = req.body.employee.isCurrentEmployee;
  if (!name || !pos || !wage) return res.status(400).send();
  db.run(`update Employee set name = '${name}', position = '${pos}',
  wage = ${wage}, is_current_employee = '${emp===0?0:1}'
  where id = ${req.employee.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Employee where id = ${req.employee.id}`, (err, row) => {
      res.status(200).send({employee: row});
    });
  });
});

employees.delete('/:employeeId', (req,res,next) => {
  db.run(`update employee set is_current_employee = 0 
  where id = ${req.employee.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Employee where id = ${req.employee.id};`, (err, row) => {
      res.status(200).send({employee: row});
    });
  });
});

// Export module
module.exports = employees;