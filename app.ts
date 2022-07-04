// Import libraries
'use strict';
import express from "express";
import * as controller from './controller/controller';
import { STATUS_CODES } from "http";
import * as CoR from './middleware/CoR';
import * as jwtMdlw from './middleware/jwt_middleware';
const { StatusCode } = require('status-code-enum')
var bodyParser = require('body-parser')


// Creating express object (in this case, the app)
const app = express();

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Parse data into request body
app.use(bodyParser.json())

// Token Validation
app.use(CoR.jwt);

// Check token payload
app.use(CoR.jwtPayload);

 // Route to check service
 app.get('/', (req:any,res:any) => {
    res.send('app is running & your token is valid & well formatted!');
});


// Route to add vaccine
app.post('/addVax', CoR.checkAdmin, CoR.checkVaxData, (req:any,res:any) => {
   res.send('you are an admin && input data are OK: You can add vax!')
   // controller.addVax(req.body.name, req.body.coverage);
});




/*
 *  routes
 */


 
// Server Setup
app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);