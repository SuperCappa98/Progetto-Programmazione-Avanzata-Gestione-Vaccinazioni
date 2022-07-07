import {Vaccine} from '../models/Vaccine';
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";
import {SuccessMsgEnum, getSuccessMsg} from "../factory/successMsg";
import exp from 'constants';
import { Batch } from '../models/Batch';
import { Delivery } from '../models/Delivery';


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
export async function addVaxDoses(delivery_doses:number, batch:string, delivery_date:Date, expiration_date:Date, vaccine_id:number, res:any): Promise<void>{
    try {
        batch = batch.toUpperCase();
        delivery_date = new Date(delivery_date);
        expiration_date = new Date(expiration_date);
        console.log("delivery DATE", delivery_date);
        console.log("expiration DATE", expiration_date);

        
        const batch_in_db = await Batch.findOne({
            where: {
                vaccine:vaccine_id,
                batch:batch
            }
        });

        console.log("batch_in_db:", batch_in_db);

        // if batch already in db we update available doses
        if(batch_in_db !== null) {
            const updateDoses = await Batch.increment(["available_doses"], {by:delivery_doses, where:{vaccine:vaccine_id, batch:batch}});

        }else{ // if batch not in db we create batch 
            const newBatch = await Batch.create({batch:batch, vaccine:vaccine_id, available_doses:delivery_doses, expiration_date:expiration_date });
        }

        await Delivery.create({ delivery_doses: delivery_doses, batch: batch, delivery_date: delivery_date, vaccine: vaccine_id})
        .then((newDelivery:any) => {
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewBatchWithNDosesSuccessMsg).getMsg();   
            var new_delivery = {Batch:newDelivery.batch, Doses:newDelivery.doses, DeliveryDate:newDelivery.delivery_date, VaccineId:newDelivery.vaccine, ExpirationDate:newDelivery.expiration_date}   
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewDelivery:new_delivery})
             
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}
