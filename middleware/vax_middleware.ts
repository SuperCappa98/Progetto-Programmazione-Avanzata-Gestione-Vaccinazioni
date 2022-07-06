import {ErrorMsgEnum} from "../factory/errorMsg";
import {Vaccine} from "../models/Vaccine";
import { Batch } from "../models/Batch";


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
    if(Number.isInteger(req.body.doses) && req.body.doses>0){  
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
    if(delivery_date.getDate() && delivery_date.getTime() <= today.getTime() 
    && delivery_date.getTime() >= min_date.getTime() ){ // getDate return False if date is invalid; min_date for null               
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
            const batch = req.body.batch.toUpperCase();
            const delivery_date = new Date(req.body.delivery_date);
            const duplicate = await Batch.findOne({where: {vaccine: req.body.vaccine_id, batch: batch, delivery_date: delivery_date}});
            if(duplicate === null){
                next();
            }else{
                next(ErrorMsgEnum.FieldValueAlreadyExists);
            }
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
    const duplicate = await Batch.findOne({where: {vaccine: req.body.vaccine_id, batch: batch, delivery_date: delivery_date}});
    if(duplicate === null){
        next();
    }else{
        next(ErrorMsgEnum.FieldValueAlreadyExists);
    }      
};

