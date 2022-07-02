// Import libraries
'use strict';
import express from "express";
import { STATUS_CODES } from "http";
import * as CoR from './middleware/CoR';


// Creating express object (in this case, the app)
const app = express();

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Parse data into request body
app.use(express.json());

// Token Validation
app.use(CoR.JWT);



 // Route to check service
 app.get('/', function (req:any,res:any) {
    res.send('app is running')
});


// Route to add vaccine
app.get('/addVax', checkUserRole, Middleware.functions, controller
});


/*
 *  routes
 */


 
// Server Setup
app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);