// Import libraries
import {ErrorMsgEnum} from "../factory/errorMsg";
import {Vaccine} from "../models/Vaccine";
import {Batch} from "../models/Batch";
import {Delivery} from "../models/Delivery";
import {Vaccination} from "../models/Vaccination";
import { User } from "../models/User";
const Sequelize = require('sequelize');


/**
 * Middleware layer 'checkVaxData'
 * 
 * Check vax data types and check if there are no other vaccines 
 * with the same name in the database
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkVaxData = async (req: any, res: any, next: any) => {   
        console.log("request body: ", req.body);
        if(isNaN(req.body.vaxName) && Number.isInteger(req.body.coverage)){
            const vaxName = req.body.vaxName.toLowerCase(); // set vax name to lower case
            console.log("vaxNameToLowerCase: ", vaxName);
            const nameDuplicated = await Vaccine.findOne({ where: { vaccine_name: vaxName } });           
            if (nameDuplicated === null) {
                next();
            }else{
                next(ErrorMsgEnum.FieldValueAlreadyExists);
            }         
        }else{
            next(ErrorMsgEnum.BadFormattedData);
        }   
};

/**
 * Middleware layer 'checkDosesValue'
 * 
 * Check doses value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkDosesValue = (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.delivery_doses) && req.body.delivery_doses>0){  
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkBatchValue'
 * 
 * Check batch value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkBatchValue = (req: any, res: any, next: any) => {
    if(isNaN(req.body.batch) && req.body.batch.length<=50){
        next();           
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }         
};

/**
 * Middleware layer 'checkDeliveryDate'
 * 
 * Check delivery date value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkDeliveryDate = (req: any, res: any, next: any) => {
    if(req.body.delivery_date !== null){
        const delivery_date = new Date(req.body.delivery_date);
        const today = new Date();
        if(delivery_date.getDate() && delivery_date.getTime() <= today.getTime()){ // getDate return False if date is invalid        
            next();   
        }else{
            next(ErrorMsgEnum.NotValidValue);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkExpirationDate'
 * 
 * Check expiration date value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkExpirationDate = (req: any, res: any, next: any) => {
    if(req.body.expiration_date !== null){
        const delivery_date = new Date(req.body.delivery_date);
        const expiration_date = new Date(req.body.expiration_date);               
        if(expiration_date.getDate() && expiration_date.getTime() >= delivery_date.getTime()){ // getDate return False if date is invalid          
            next();
        }else{
            next(ErrorMsgEnum.NotValidValue);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkVaccinId'
 * 
 * Check vaccine id value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkVaccineId = async (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.vaccine_id) && req.body.vaccine_id>0){
        const vaccine_id = await Vaccine.findOne({ where: { vaccine_id: req.body.vaccine_id } });
        if(vaccine_id !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotPositiveInt);
    }
};

/**
 * Middleware layer 'checkDelivery'
 * 
 * Check if delivery is not already in the database
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkDelivery = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase();
    const delivery_date = new Date(req.body.delivery_date);
    const duplicate = await Delivery.findOne({where: {vaccine: req.body.vaccine_id, batch: batch, delivery_date: delivery_date}});
    if(duplicate === null){
        next();
    }else{
        next(ErrorMsgEnum.FieldValueAlreadyExists);
    }      
};

/**
 * Middleware layer 'checkBatchExpiration'
 * 
 * Check if batch is already in the database,
 * then if so check if batch expiration date is equal to the request expiration date
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkBatchExpiration = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase(); // set batch to upper case

    await Batch.findOne({
        where: {
            vaccine:req.body.vaccine_id,
            batch:batch
        }
    }).then((r) => {
            if(r !== null){  // batch already in db -> check on expiration date
                let json = JSON.parse(JSON.stringify(r));
                console.log("json:", json);
                if(json.expiration_date === req.body.expiration_date){
                    next();
                }else{
                    next(ErrorMsgEnum.FieldValueNotMatch);
                };
            }else{
                next();  // batch not already in db -> add it in the controller with doses
            }
    });
};

/**
 * Middleware layer 'checkFilterVaxName'
 * 
 * Check vax name filter values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFilterVaxName = async (req: any, res: any, next: any) => {
    if(req.body.vax_name == null){ 
        next(); // vax name filter can be null
    }else if(Array.isArray(req.body.vax_name)){ // if not null, vax name filter must be a string array
        var string_bool = true;
        req.body.vax_name.forEach((vax_name:any) => { // checks if each element of the array is a string 
            if(typeof vax_name !== "string"){ 
                string_bool = false;
            }
        });
        if(string_bool){
            var exist_bool = true;
            for (let i = 0; i < req.body.vax_name.length; i++) { // checks if each element of the array is in the database 
                const vax_name = req.body.vax_name[i];
                const vaxName = vax_name.toLowerCase(); // set vax name to lower case
                const vax_name_db = await Vaccine.findOne({ where: {vaccine_name: vaxName}});
                if(vax_name_db === null){
                    exist_bool = false;
                }
            }
            if(exist_bool){
                next();
            }else{
                next(ErrorMsgEnum.NotFoundInDB);
            }
        }else{
            next(ErrorMsgEnum.NotValidValue);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkFilterAvailability'
 * 
 * Check availability filter values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFilterAvailability = (req: any, res: any, next: any) => {
    if(req.body.availability == null){
        next(); // availability filter can be null
    }else if(Array.isArray(req.body.availability)){ // if not null, availability filter must be a number array of 2 elements
        if(req.body.availability.length === 2){ // checks if the elements of the array are 2
            var number_bool = true;
            req.body.availability.forEach((number:any) => { // checks if each element of the array is a number or a null
                if(typeof number !== "number" && number !== null){
                    number_bool = false;
                }
            });
            if(number_bool){
                if(((req.body.availability[0] === null && req.body.availability[1]>=0) ||
                    (req.body.availability[0]>=0 && req.body.availability[1] === null) ||
                    (req.body.availability[0]>=0 && req.body.availability[1]>=0 && req.body.availability[1]>req.body.availability[0])) 
                    && !(req.body.availability[0] === null && req.body.availability[1] === null)){
                    // only an element can be a null in the array 
                    // if an element is not null it must be >= 0
                    // if both elements are not null, the first element must be < second
                    next(); 
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else{
                next(ErrorMsgEnum.NotValidValue);
            }
        }else{
            next(ErrorMsgEnum.InvalidArrayLength);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkFilterExpirationDate'
 * 
 * Check expiration date filter values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFilterExpirationDate = (req: any, res: any, next: any) => {
    if(req.body.expiration_date == null){
        next(); // expiration date filter can be null
    }else if(Array.isArray(req.body.expiration_date)){ // if not null, expiration date filter must be a Date array of 2 elements
        if(req.body.expiration_date.length === 2){ // checks if the elements of the array are 2
            // if [null,null] -> invalid
            if(req.body.expiration_date[0] === null && isNaN(req.body.expiration_date[1])){ // [null, "date2"] -> find vaccines before date2
                const expiration_date = new Date(req.body.expiration_date[1]);
                if(expiration_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.expiration_date[0]) && req.body.expiration_date[1] === null){ // ["date1", null] -> find vaccines after date1
                const expiration_date = new Date(req.body.expiration_date[0]);
                if(expiration_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.expiration_date[0]) && isNaN(req.body.expiration_date[1])){ // ["date1", "date2"] -> find vaccines between date1 & date2
                const min_expiration_date = new Date(req.body.expiration_date[0]);
                const max_expiration_date = new Date(req.body.expiration_date[1]);
                if(min_expiration_date.getDate() && max_expiration_date.getDate() && max_expiration_date.getTime()>min_expiration_date.getTime()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else{
                next(ErrorMsgEnum.NotValidValue);
            }
        }else{
            next(ErrorMsgEnum.InvalidArrayLength);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkVaxName'
 * 
 * Check vax name value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkVaxName = async (req: any, res: any, next: any) => {
    if(typeof req.body.vax_name === "string"){
        const vax_name = req.body.vax_name.toLowerCase(); // set vax name to lower case
        const vaxName = await Vaccine.findOne({ where: {vaccine_name: vax_name}});
        if(vaxName !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkUserKey'
 * 
 * Check user key value 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkUserKey = async (req:any, res:any, next:any) => {
    if(isNaN(req.body.user_key)  && req.body.user_key.length === 16){
        const user_key = req.body.user_key.toUpperCase(); // set user key to upper case
        const db_user = await User.findOne({where: {user_key: user_key}});
        if(db_user !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkBatchKey'
 * 
 * Check batch key value (i.e., the vaccine id and batch pair)
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkBatchKey = async (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.vaccine_id) && req.body.vaccine_id>0){
        const batch = req.body.batch.toUpperCase(); // set batch to upper case
        const batchInDb = await Batch.findOne({where: {vaccine: req.body.vaccine_id, batch: batch}});
        if(batchInDb !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkBatchAvailability'
 * 
 * Check batch availability in the database
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkBatchAvailability = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase(); // set batch to upper case

    await Batch.findOne({where: {vaccine:req.body.vaccine_id, batch:batch}}).then((r) => {
        let json = JSON.parse(JSON.stringify(r));
        console.log("json:", json.available_doses);
        if(json.available_doses > 0){
            next();
        }else{
            next(ErrorMsgEnum.NoMoreDosesInBatch);
        };
    });      
};

/**
 * Middleware layer 'checkBatchNotExpired'
 * 
 * Check timestamp value and if batch is not expired
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkBatchNotExpired = async (req: any, res: any, next: any) => {
    console.log("req.body.timestamp_vc:", req.body.timestamp_vc);
    if(isNaN(req.body.timestamp_vc)){
        const today = new Date();
        const timestamp_vc = new Date(req.body.timestamp_vc);

        // check if timestamp is valid and if his value > than today
        if(timestamp_vc.getDate() && timestamp_vc.getTime() <= today.getTime()){  
            const batch = req.body.batch.toUpperCase();
            await Batch.findOne({where: {vaccine:req.body.vaccine_id, batch:batch}}).then((r) => {
                let json = JSON.parse(JSON.stringify(r));
                console.log("json:", json.expiration_date);
                const expiration_date = new Date(json.expiration_date); // needed to compare date with timestamp
                if(expiration_date.getTime() >= timestamp_vc.getTime()){
                    next();
                }else{
                    next(ErrorMsgEnum.DosesInBatchExpired);
                };
            });
        }else{
            next(ErrorMsgEnum.NotValidValue);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }     
};

/**
 * Middleware layer 'checkUserNotCovered'
 * 
 * Check if user is still covered by request vaccine
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkUserNotCovered = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase();
    await Vaccination.findAll({ 
        attributes:[[Sequelize.fn('max', Sequelize.col('timestamp_vc')),'max']], 
        where: {vaccine:req.body.vaccine_id, user_key:req.body.user_key}
    }).then(async (last_vaccination) => { // get last vaccination
        if(last_vaccination !== null){
            const json = JSON.parse(JSON.stringify(last_vaccination));
            const last_timestamp = json[0].max;
            let date_last_vaccination = new Date(last_timestamp);

            // find vax coverage
            await Vaccine.findOne({attributes: ["coverage"], where: {vaccine_id:req.body.vaccine_id} }).then((vax_coverage => { 
                const parsed_coverage = JSON.parse(JSON.stringify(vax_coverage));
                date_last_vaccination.setDate(date_last_vaccination.getDate() + parsed_coverage.coverage); // add coverage days to last vaccination
                let end_coverage_date = new Date();
                end_coverage_date = date_last_vaccination;
                const timestamp_vc = new Date(req.body.timestamp_vc);
                
                if(end_coverage_date.getTime() < timestamp_vc.getTime()){
                    next(); // user not more covered -> we can do vaccination
                }else{
                    next(ErrorMsgEnum.UserStillCovered);
                }
            }));
        }else{
            next(); // no other vaccinations with that vaccine -> user not covered!
        }
    });
};

/**
 * Middleware layer 'checkTokenField'
 * 
 * Check the admin token to see if a Client user key is present and if so check its format
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkTokenField = async (req: any, res: any, next: any) => {
    console.log(req.user.userKey);
    console.log(req.user.userKeyClient);
    if(req.user.role === "Admin"){  // role admin -> other field in token: userKeyClient -> check format
        if(typeof(req.user.userKeyClient) === "string" && req.user.userKeyClient.length === 16){
            const user_key = req.user.userKeyClient.toUpperCase(); // set user key to upper case
            const db_user = await User.findOne({where: {user_key: user_key}});
            if(db_user !== null){
                next();
            }else{
                next(ErrorMsgEnum.NotFoundInDB);
            }
        }else{
            next(ErrorMsgEnum.BadFormattedUserDataInJWTPayload);
        }
    }else{
        const user_key = req.user.userKey.toUpperCase(); // set user key to upper case
        const db_user = await User.findOne({where: {user_key: user_key}});
        if(db_user !== null){
            next(); // role = User -> no other fields to check
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        } 
    }
};

/**
 * Middleware layer 'checkVaccinationDate'
 * 
 * Check vaccination date filter values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkVaccinationDate = (req: any, res: any, next: any) => {
    if(req.body.vaccination_date == null){
        next(); // vaccination date filter can be null
    }else if(Array.isArray(req.body.vaccination_date)){ // if not null, vaccination date filter must be a Date array of 2 elements
        if(req.body.vaccination_date.length === 2){ // checks if the elements of the array are 2
            // if [null,null] -> invalid
            if(req.body.vaccination_date[0] === null && isNaN(req.body.vaccination_date[1])){ // [null, "date2"] -> find vaccinations before date2 
                const vaccination_date = new Date(req.body.vaccination_date[1]);
                if(vaccination_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.vaccination_date[0]) && req.body.vaccination_date[1] === null){ // ["date1", null] -> find vaccinations after date1
                const vaccination_date = new Date(req.body.vaccination_date[0]);
                if(vaccination_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.vaccination_date[0]) && isNaN(req.body.vaccination_date[1])){  // ["date1", "date2"] -> find vaccinations between date1 & date2
                const min_vaccination_date = new Date(req.body.vaccination_date[0]);
                const max_vaccination_date = new Date(req.body.vaccination_date[1]);
                if(min_vaccination_date.getDate() && max_vaccination_date.getDate() && max_vaccination_date.getTime()>min_vaccination_date.getTime()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else{
                next(ErrorMsgEnum.NotValidValue);
            }
        }else{
            next(ErrorMsgEnum.InvalidArrayLength);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkFilterVaxNameJson'
 * 
 * Check vax name filter value, but in this case the value can be null or a string
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFilterVaxNameJson = async (req: any, res: any, next: any) => {
    if(req.body.vax_name == null){
        next();
    }else if(typeof req.body.vax_name === "string"){
        const vax_name = req.body.vax_name.toLowerCase();
        const vaxName = await Vaccine.findOne({ where: {vaccine_name: vax_name}});
        if(vaxName !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkFilterNDaysCoverageExpired'
 * 
 * Check days coverage expired filter values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFilterNDaysCoverageExpired = (req: any, res: any, next: any) => {
    if(req.body.days_coverage_expired == null){
        next(); // days coverage expired filter can be null
    }else if(Array.isArray(req.body.days_coverage_expired)){ // if not null, days coverage expired filter must be a number array of 2 elements
        if(req.body.days_coverage_expired.length === 2){ // checks if the elements of the array are 2
            var number_bool = true;
            req.body.days_coverage_expired.forEach((number:any) => { // checks if each element of the array is a number or a null
                if(typeof number !== "number" && number !== null){
                    number_bool = false;
                }
            });
            if(number_bool){
                if(((req.body.days_coverage_expired[0] === null && req.body.days_coverage_expired[1]>=0) ||
                    (req.body.days_coverage_expired[0]>=0 && req.body.days_coverage_expired[1] === null) ||
                    (req.body.days_coverage_expired[0]>=0 && req.body.days_coverage_expired[1]>=0 && req.body.days_coverage_expired[1]>req.body.days_coverage_expired[0])) 
                    && !(req.body.days_coverage_expired[0] === null && req.body.days_coverage_expired[1] === null)){
                    // only an element can be a null in the array 
                    // if an element is not null it must be >= 0
                    // if both elements are not null, the first element must be < second
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else{
                next(ErrorMsgEnum.NotValidValue);
            }
        }else{
            next(ErrorMsgEnum.InvalidArrayLength);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkFormat'
 * 
 * Check format value 
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkFormat = (req: any, res: any, next: any) => {
    if(req.body.format == "JSON" || req.body.format == "PDF"){ // check if format value is JSON or PDF
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'checkOrderByFilter'
 * 
 * Check order by filter value
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkOrderByFilter = (req: any, res: any, next: any) => {
    if(req.body.order_by == null){
        next(); // order by filter can be null
    }else if(req.body.order_by == "ASC" || req.body.order_by == "DESC"){ // check if order by value is ASC or DESC
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

/**
 * Middleware layer 'routeNotFound'
 * 
 * Handle requests in which an unexpected route is specified
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const routeNotFound = (req: any, res: any, next: any) => {
    next(ErrorMsgEnum.RouteNotFound);
};

/**
 * Middleware layer 'checkUserName'
 * 
 * Check user name and surname values
 * 
 * @param req Client request
 * @param res Server response
 * @param next Calls the next middleware layer   
 */
export const checkUserName = async (req: any, res: any, next: any) => {
    if(typeof req.body.name === "string" && typeof req.body.surname === "string"){
            next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

