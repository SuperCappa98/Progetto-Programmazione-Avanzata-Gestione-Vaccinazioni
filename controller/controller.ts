import {Vaccine} from '../models/Vaccine';
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";
import {SuccessMsgEnum, getSuccessMsg} from "../factory/successMsg";
import exp from 'constants';
import { Batch } from '../models/Batch';


function controllerErrors(err_msg_enum:ErrorMsgEnum, error:Error, res:any){
    console.log(error);
    const new_err_msg = getErrorMsg(err_msg_enum).getMsg();
    res.status(new_err_msg.status).json({Error:new_err_msg.status, Description:new_err_msg.msg});
}

// Insert new vax in database
export async function addVax(name:string, coverage:number, res:any): Promise<void> {
    try {
        console.log(name, coverage);
        name = name.toLowerCase();
        console.log(name, coverage);
        await Vaccine.create({ vaccine_name: name, coverage: coverage }).then((newVaccine:any) => {
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewVax).getMsg();   
            var new_vax = {Name:newVaccine.vaccine_name, Coverage:newVaccine.coverage};
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewVax:new_vax});
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}


// insert vax batch in db
export async function addVaxDoses(doses:number, batch:string, delivery_date:Date, expiration_date:Date, vaccine_id:number, res:any): Promise<void>{
    try {
        
        batch = batch.toUpperCase();
        delivery_date = new Date(delivery_date);
        expiration_date = new Date(expiration_date);
        console.log("delivery DATE", delivery_date);
        console.log("expiration DATE", expiration_date);

        await Batch.create({ doses: doses, batch: batch, delivery_date: delivery_date, vaccine: vaccine_id, expiration_date: expiration_date})
        .then((newBatch:any) => {
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewBatchWithNDosesSuccessMsg).getMsg();   
            var new_batch = {Batch:newBatch.batch, Doses:newBatch.doses, DeliveryDate:newBatch.delivery_date, Vaccine:newBatch.vaccine_id, ExpirationDate:newBatch.expiration_date}   
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewBatch:new_batch})
             
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}
