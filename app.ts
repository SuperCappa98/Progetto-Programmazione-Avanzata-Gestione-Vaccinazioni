// Import libraries
'use strict';
import express from "express";
import * as controller from './controller/controller';
import * as CoR from './middleware/CoR';
import {SuccessMsgEnum, getSuccessMsg} from "./factory/successMsg";


// Creating express object (in this case, the app)
const app = express();

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Parse data into request body
app.use(express.json());

// Token Validation
app.use(CoR.jwt);

// Check token payload
app.use(CoR.jwtPayload);

// Route to check service
app.get('/', (req:any,res:any) => {
    const res_msg = getSuccessMsg(SuccessMsgEnum.AppStarted).getMsg();   
    res.status(res_msg.status).json({Message:res_msg.msg})
});

// Route to add vaccine
app.post('/addVax', CoR.checkAdmin, CoR.checkVaxData, (req:any,res:any) => {
    controller.addVax(req.body.vaxName, req.body.coverage, res);
});

// Route to add N doses of a vaccine
app.post('/addDoses', CoR.checkAdmin, CoR.checkDosesData, (req:any,res:any) => {
   controller.addVaxDoses(req.body.delivery_doses, req.body.batch, req.body.delivery_date, req.body.expiration_date, req.body.vaccine_id, res);
});

// Route to display list of vaccines that can be filtered by name, availability, and/or expiration date
app.get('/vaxList', CoR.checkAdmin, CoR.checkVaxFilters, (req:any,res:any) => {
    if(!Object.keys(req.body).includes('vax_name')) req.body.vax_name = null;
    if(!Object.keys(req.body).includes('availability')) req.body.availability = null;
    if(!Object.keys(req.body).includes('expiration_date')) req.body.expiration_date = null;
    controller.vaxList(req.body.vax_name, req.body.availability, req.body.expiration_date, res);
});

// Route to display whether a given vaccine has any available doses and if so also allows filtering of availability
app.get('/availableVaxDoses', CoR.checkAdmin, CoR.checkAvailableVaxDoses, (req:any,res:any) => {
    if(!Object.keys(req.body).includes('availability')) req.body.availability = null;
    controller.availableVaxDoses(req.body.vax_name, req.body.availability, res);
});

// Route to add a vaccination
app.post('/addVaccination', CoR.checkAdmin, CoR.checkVaccinationData, (req:any,res:any) => {
    controller.addVaccination(req.body.vaccine_id, req.body.batch, req.body.user_key, req.body.timestamp_vc, res);
});

// Route to download user vaccinations in PDF
app.get('/downloadPDF', CoR.checkTokenField, (req:any,res:any) => {
    controller.downloadPDF(req.user, res);
});

// Route to get user vaccinations in JSON
app.get('/vaccinationsJson', CoR.checkTokenField, CoR.checkFilterValue, (req:any,res:any) => {
    if(!Object.keys(req.body).includes('vax_name')) req.body.vax_name = null;
    if(!Object.keys(req.body).includes('vaccination_date')) req.body.vaccination_date = null;
    controller.vaccinationsJson(req.user, req.body.vax_name, req.body.vaccination_date, res);
});

// Route to display list of people with expired coverage that can be filtered by vaccine name and/or number of days since coverage expired
app.get('/coverageExpiredUserList', CoR.checkAdmin, CoR.checkCoverageExpiredUserListFilters, (req:any,res:any) => {
    if(!Object.keys(req.body).includes('vax_name')) req.body.vax_name = null;
    if(!Object.keys(req.body).includes('days_coverage_expired')) req.body.days_coverage_expired = null;
    controller.coverageExpiredUserList(req.body.vax_name, req.body.days_coverage_expired, res);
});

// Route to 
app.get('/coverageDataUser', CoR.checkTokenField, CoR.checkCoverageDataUserFilters, (req:any,res:any) => {
    //res.send("ok, you can pass to controller");
    if(!Object.keys(req.body).includes('order_by')) req.body.order_by = null;
    controller.coverageDataUser(req.user, req.body.format, req.body.order_by, res);
});

// Route to get statistics 
app.get('/statistics', CoR.checkAdmin, (req:any,res:any) => {
    controller.statistics(res);
});


// Server Setup
app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);