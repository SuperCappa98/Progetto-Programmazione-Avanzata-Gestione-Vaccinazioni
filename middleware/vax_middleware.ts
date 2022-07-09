import {ErrorMsgEnum} from "../factory/errorMsg";
import {Vaccine} from "../models/Vaccine";
import { Batch } from "../models/Batch";
import { Delivery } from "../models/Delivery";
import { send } from "process";
import { Vaccination } from "../models/Vaccination";
import { User } from "../models/User";
const Sequelize = require('sequelize');


// Check vax data types and check no other vaccine in db with the same name
export const checkVaxData = async (req: any, res: any, next: any) => {
    
        console.log("request body: ", req.body);
        if(isNaN(req.body.vaxName) && Number.isInteger(req.body.coverage)){
            const vaxName = req.body.vaxName.toLowerCase();
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

// Check doses value
export const checkDosesValue = (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.delivery_doses) && req.body.delivery_doses>0){  
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

// Check batch value
export const checkBatchValue = (req: any, res: any, next: any) => {
    if (isNaN(req.body.batch) && req.body.batch.length<=50) {
        next();           
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }         
};

// Check delivery date value
export const checkDeliveryDate = (req: any, res: any, next: any) => {
    const delivery_date = new Date(req.body.delivery_date);
    const today = new Date();
    const min_date = new Date("2000-01-01");    
    if(delivery_date.getDate() && delivery_date.getTime() <= today.getTime()  // getDate return False if date is invalid; min_date for null  
    && delivery_date.getTime() >= min_date.getTime() ){             
        next();   
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

// Check expiration date value
export const checkExpirationDate = (req: any, res: any, next: any) => {
    const delivery_date = new Date(req.body.delivery_date);
    const expiration_date = new Date(req.body.expiration_date);               
    if(expiration_date.getDate() && expiration_date.getTime() >= delivery_date.getTime()){                    
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

// Check vaccine id value
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

// Check delivery in the db
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

// Check if batch in db: expiration date == req.expiration date
export const checkBatchExpiration = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase();

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
}

export const checkFilterVaxName = async (req: any, res: any, next: any) => {
    if(req.body.vax_name == null) {
        next();
    }else if(Array.isArray(req.body.vax_name)) {
        var string_bool = true;
        req.body.vax_name.forEach((vax_name:any) => {
            if(typeof vax_name !== "string"){
                string_bool = false;
            }
        });
        if(string_bool) {
            var exist_bool = true;
            for (let i = 0; i < req.body.vax_name.length; i++) {
                const vax_name = req.body.vax_name[i];
                const vaxName = vax_name.toLowerCase();
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

export const checkFilterAvailability = (req: any, res: any, next: any) => {
    if(req.body.availability == null) {
        next();
    }else if(Array.isArray(req.body.availability)) {
        if(req.body.availability.length === 2){
            var number_bool = true;
            req.body.availability.forEach((number:any) => {
                if(typeof number !== "number" && number !== null){
                    number_bool = false;
                }
            });
            if(number_bool) {
                if(((req.body.availability[0] === null && req.body.availability[1]>=0) ||
                    (req.body.availability[0]>=0 && req.body.availability[1] === null) ||
                    (req.body.availability[0]>=0 && req.body.availability[1]>=0 
                        && req.body.availability[1]>req.body.availability[0])) 
                        && !(req.body.availability[0] === null && req.body.availability[1] === null)){
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

export const checkFilterExpirationDate = (req: any, res: any, next: any) => {
    if(req.body.expiration_date == null) {
        next();
    }else if(Array.isArray(req.body.expiration_date)) {
        if(req.body.expiration_date.length === 2){
            if(req.body.expiration_date[0] === null && isNaN(req.body.expiration_date[1])){
                const expiration_date = new Date(req.body.expiration_date[1]);
                if(expiration_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.expiration_date[0]) && req.body.expiration_date[1] === null){
                const expiration_date = new Date(req.body.expiration_date[0]);
                if(expiration_date.getDate()){                    
                    next();
                }else{
                    next(ErrorMsgEnum.NotValidValue);
                }
            }else if(isNaN(req.body.expiration_date[0]) && isNaN(req.body.expiration_date[1])){
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

export const checkVaxName = async (req: any, res: any, next: any) => {
    if(typeof req.body.vax_name === "string") {
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

// Check user key format and user key value in the db
export const checkUserKey = async (req:any, res:any, next:any) => {
    if(isNaN(req.body.user_key)  && req.body.user_key.length === 16){
        const user_key = req.body.user_key.toUpperCase();
        const db_user = await Vaccination.findOne({where: {user_key: user_key}});
        if(db_user !== null){
            next();
        }else{
            next(ErrorMsgEnum.NotFoundInDB);
        }
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
}


// Check vaccine id, batch values
export const checkBatchKey = async (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.vaccine_id) && req.body.vaccine_id>0){
        const batch = req.body.batch.toUpperCase();
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

// Check batch availability in db
export const checkBatchAvailability = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase();

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

// Check timestamp value (format and > than today) and batch not expired
export const checkBatchNotExpired = async (req: any, res: any, next: any) => {
    console.log("req.body.timestamp_vc:", req.body.timestamp_vc)
    if(isNaN(req.body.timestamp_vc)){
        const today = new Date();
        const timestamp_vc = new Date(req.body.timestamp_vc);
        if(timestamp_vc.getDate() && timestamp_vc.getTime() <= today.getTime()){
            
            const batch = req.body.batch.toUpperCase();
            await Batch.findOne({where: {vaccine:req.body.vaccine_id, batch:batch}}).then((r) => {
                let json = JSON.parse(JSON.stringify(r));
                console.log("json:", json.expiration_date);
                const expiration_date = new Date(json.expiration_date); // need to compare date with timestamp
                if(expiration_date.getTime() >= timestamp_vc.getTime()){
                    next();
                }else{
                    next(ErrorMsgEnum.DosesInBatchExpired);
                };
            });
        }else{
            next(ErrorMsgEnum.NotValidValue);
        }
    } else{
        next(ErrorMsgEnum.NotValidValue);
    }     
};

// check if user still covered by req.vaccine
export const checkUserNotCovered = async (req: any, res: any, next: any) => {
    const batch = req.body.batch.toUpperCase();
    await Vaccination.findAll({ attributes:[[Sequelize.fn('max', Sequelize.col('timestamp_vc')),'max']], where: {vaccine:req.body.vaccine_id, user_key:req.body.user_key}}).then(async (last_vaccination) => { // get last vaccination
        if(last_vaccination !== null){
            const json = JSON.parse(JSON.stringify(last_vaccination));
            const last_timestamp = json[0].max;
            let date_last_vaccination = new Date(last_timestamp);

            await Vaccine.findOne({attributes: ["coverage"], where: {vaccine_id:req.body.vaccine_id} }).then((vax_coverage => { // find vax coverage
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
    })
}

export const checkTokenField = (req: any, res: any, next: any) => {
    console.log(req.user);
    console.log(req.user.userKeyClient);
    if(req.user.role === "Admin") {  // role admin -> other field in token: userKeyClient -> check format
        if(typeof(req.user.userKeyClient) === "string" && req.user.userKeyClient.length === 16){
            next();
        }else{
            next(ErrorMsgEnum.BadFormattedUserDataInJWTPayload);
        }
    } else {
        next(); // role = User -> no other fields to check
    }
}

// check values of vaccination date 
export const checkVaccinationDate = (req: any, res: any, next: any) => {
    if(req.body.vaccination_date == null) {
        next();
    }else if(Array.isArray(req.body.vaccination_date)) {
        if(req.body.vaccination_date.length === 2){
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

export const checkFilterVaxNameJson = async (req: any, res: any, next: any) => {
    if(req.body.vax_name == null) {
        next();
    }else if(typeof req.body.vax_name === "string") {
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

export const checkFilterNDaysCoverageExpired = (req: any, res: any, next: any) => {
    if(req.body.days_coverage_expired == null) {
        next();
    }else if(Array.isArray(req.body.days_coverage_expired)) {
        if(req.body.days_coverage_expired.length === 2){
            var number_bool = true;
            req.body.days_coverage_expired.forEach((number:any) => {
                if(typeof number !== "number" && number !== null){
                    number_bool = false;
                }
            });
            if(number_bool) {
                if(((req.body.days_coverage_expired[0] === null && req.body.days_coverage_expired[1]>=0) ||
                    (req.body.days_coverage_expired[0]>=0 && req.body.days_coverage_expired[1] === null) ||
                    (req.body.days_coverage_expired[0]>=0 && req.body.days_coverage_expired[1]>=0 
                        && req.body.days_coverage_expired[1]>req.body.days_coverage_expired[0])) 
                        && !(req.body.days_coverage_expired[0] === null && req.body.days_coverage_expired[1] === null)){
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

export const checkFormat = (req: any, res: any, next: any) => {
    if(req.body.format == "JSON" || req.body.format == "PDF") {
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};

export const checkOrderByFilter = (req: any, res: any, next: any) => {
    if(req.body.order_by == null) {
        next();
    }else if(req.body.order_by == "ASC" || req.body.order_by == "DESC") {
        next();
    }else{
        next(ErrorMsgEnum.NotValidValue);
    }
};



