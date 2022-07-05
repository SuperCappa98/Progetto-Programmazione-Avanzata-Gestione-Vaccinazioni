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
                next(ErrorMsgEnum.VaxName);
            }         
        }else{
            next(ErrorMsgEnum.BadFormattedVaxData);
        }
    
};

// Check doses value
export const checkDosesValue = (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.doses) && req.body.doses>0){  
        next();
    }else{
        let error = new Error("Doses value not valid!");
        next(error);
    }
};

// Check batch value
export const checkBatchValue = (req: any, res: any, next: any) => {
    if (isNaN(req.body.batch) && req.body.batch.length<=50) {
        next();           
    }else{
        let error = new Error("Batch value not valid!");
        next(error);
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
        let error = new Error("Delivery date not valid");
        next(error);
    }
};

// Check expiration date value
export const checkExpirationDate = (req: any, res: any, next: any) => {
    const delivery_date = new Date(req.body.delivery_date);
    const expiration_date = new Date(req.body.expiration_date);               
    if(expiration_date.getDate() && expiration_date.getTime() >= delivery_date.getTime()){                    
        next();
    }else{
        let error = new Error("Expiration date not valid");
        next(error);
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
                let error = new Error("This delivery is already in the database!");
                next(error);
            }
        }else{
            let error = new Error("Can't find related vaccine in database!");
            next(error);
        }
    }else{
        let error = new Error("Vaccine id is not a positive integer!");
        next(error);
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
        let error = new Error("This delivery is already in the database!");
        next(error);
    }      
};




/*

// Check data types and check vaccine in db for reference key
export const checkDosesData = async (req: any, res: any, next: any) => {
    if(Number.isInteger(req.body.doses) && req.body.doses>0){  

        if (isNaN(req.body.batch) && req.body.batch.length<=50) {

            const delivery_date = new Date(req.body.delivery_date);
            const today = new Date();
            console.log("Today: ",today);
            const min_date = new Date("2000-01-01");
            console.log(min_date);
            
            if(delivery_date.getDate() && delivery_date.getTime() <= today.getTime() 
                && delivery_date.getTime() >= min_date.getTime() ){ // getDate return False if date is invalid; min_date for null               
                
                    const expiration_date = new Date(req.body.expiration_date);
                
                if(expiration_date.getDate() && expiration_date.getTime() >= delivery_date.getTime()){                    
                    
                    if(Number.isInteger(req.body.vaccine_id) && req.body.vaccine_id>0){
                        const vaccine_id = await Vaccine.findOne({ where: { vaccine_id: req.body.vaccine_id } });
                        
                        if(vaccine_id !== null){
                            const batch = req.body.batch.toUpperCase();
                            console.log("batch:",batch);
                            console.log("delivery date:",delivery_date);                        
                            const insert_duplicate = await Batch.findOne({where: {vaccine: req.body.vaccine_id, batch: batch, delivery_date: delivery_date}});
                            
                            if(insert_duplicate === null){
                                next();
                            }else{
                                let error = new Error("This delivery is already in the database!");
                                next(error);
                            }
                        }else{
                            let error = new Error("Can't find related vaccine in database!");
                            next(error);
                        }
                    }else{
                        let error = new Error("Vaccine id is not a positive integer!");
                        next(error);
                    }
                }else{
                    let error = new Error("Expiration date is incorrect");
                    next(error);
                }
            }else{
                let error = new Error("Delivery date is incorrect");
                next(error);
            }
        }else{
            let error = new Error("Incorrect batch data format!");
            next(error);
        }         
    }else{
        let error = new Error("Incorrect doses data format!");
        next(error);
    }
   
};

*/