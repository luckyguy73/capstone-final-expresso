// Import expressjs and create route handler
const express = require('express');
const timesheets = express.Router();

// Add sqlite3 database instance
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheets.param('employeeId', (req,res,next,id) => {
  db.get(`select * from Employee where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.employee = row;
      next();
    } else res.status(404).send();
  });
});

timesheets.param('timesheetId', (req,res,next,id) => {
  db.get(`select * from Timesheet where id = ${id};`, (err, row) => {
    if(err) next(err);
    else if (row) {
      req.timesheet = row;
      next();
    } else res.status(404).send();
  });
});

timesheets.get('/', (req,res,next) => {
  db.all(`select * from Timesheet where employee_id = ${req.employee.id}`, (err,rows) => {
    if(err) next(err);
    else res.status(200).send({timesheets: rows});
  });
});

timesheets.post('/', (req,res,next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const empId = req.employee.id;
  if (!hours || !rate || !date) return res.status(400).send();
  db.run(`insert into Timesheet (hours, rate, date, employee_id) 
  values (${hours}, ${rate}, ${date}, ${empId})`, function(err) {
    if (err) next(err);
    else db.get(`select * from Timesheet where id = ${this.lastID}`, (err, row) => {
      res.status(201).send({timesheet: row});
    });
  });
});

timesheets.put('/:timesheetId', (req,res,next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  if (!hours || !rate || !date) return res.status(400).send();
  db.run(`update Timesheet set hours = ${hours}, rate = ${rate}, date = ${date}
  where id = ${req.timesheet.id};`, function(err) {
    if (err) next(err);
    else db.get(`select * from Timesheet where id = ${req.timesheet.id}`, (err, row) => {
      res.status(200).send({timesheet: row});
    });
  });
});

timesheets.delete('/:timesheetId', (req,res,next) => {
  db.run(`delete from Timesheet where id = ${req.timesheet.id}`, (err) => {
    if (err) next(err);
    else res.status(204).send();
  });
});

// Export module
module.exports = timesheets;