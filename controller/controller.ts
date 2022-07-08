import {Vaccine} from '../models/Vaccine';
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";
import {SuccessMsgEnum, getSuccessMsg} from "../factory/successMsg";
import exp from 'constants';
import { Batch } from '../models/Batch';
import { Delivery } from '../models/Delivery';
import { DBSingleton } from "../singleton/DBSingleton";
import { QueryTypes, Sequelize } from 'sequelize';
import { Vaccination } from '../models/Vaccination';

const sequelize: Sequelize = DBSingleton.getConnection();


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
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewDeliveryWithNDoses).getMsg();   
            var new_delivery = {Batch:newDelivery.batch, Doses:newDelivery.delivery_doses, DeliveryDate:newDelivery.delivery_date, VaccineId:newDelivery.vaccine}   
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewDelivery:new_delivery});
             
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

export async function vaxList(vax_name: Array<string>, availability: Array<number>, expiration_date: Array<Date>, res:any): Promise<void>{
    try{
        if (vax_name == null && availability == null && expiration_date == null){
            await Vaccine.findAll().then((vaxList: object[]) => {
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
            });
        }else if(availability == null && expiration_date == null) {
            var vaccine_name:string[] = [];
            for (let i = 0; i < vax_name.length; i++) {
                vaccine_name[i]= vax_name[i].toLowerCase();
            }
            await Vaccine.findAll({
                where: {vaccine_name:vaccine_name}
            }).then((vaxList: object[]) => {
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
            });
        }else if(vax_name == null && expiration_date == null) {
            if(availability[0] !== null && availability[1] === null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) GROUP BY v.vaccine_id HAVING sum(b.available_doses) > ?',
                    {
                        replacements: [availability[0]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else if(availability[0] === null && availability[1] !== null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) GROUP BY v.vaccine_id HAVING sum(b.available_doses) < ?',
                    {
                        replacements: [availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else{
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) GROUP BY v.vaccine_id HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                    {
                        replacements: [availability[0], availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }
        }else if(vax_name == null && availability == null) {
            if(expiration_date[0] !== null && expiration_date[1] === null) {
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date > ?',
                    {
                        replacements: [expiration_date[0]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else if(expiration_date[0] === null && expiration_date[1] !== null) {
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date < ?',
                    {
                        replacements: [expiration_date[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else{
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date >= ? AND b.expiration_date <= ?',
                    {
                        replacements: [expiration_date[0], expiration_date[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }
        }else if(availability == null) {
            var vaccine_name:string[] = [];
            for (let i = 0; i < vax_name.length; i++) {
                vaccine_name[i]= vax_name[i].toLowerCase();
            }
            if(expiration_date[0] !== null && expiration_date[1] === null) {
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date > ?',
                    {
                        replacements: [vaccine_name, expiration_date[0]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else if(expiration_date[0] === null && expiration_date[1] !== null) {
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date < ?',
                    {
                        replacements: [vaccine_name, expiration_date[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else{
                await sequelize.query(
                    'SELECT v.*, b.batch, b.expiration_date FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date >= ? AND b.expiration_date <= ?',
                    {
                        replacements: [vaccine_name, expiration_date[0], expiration_date[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }
        }else if(expiration_date == null) {
            var vaccine_name:string[] = [];
            for (let i = 0; i < vax_name.length; i++) {
                vaccine_name[i]= vax_name[i].toLowerCase();
            }
            if(availability[0] !== null && availability[1] === null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) GROUP BY v.vaccine_id HAVING sum(b.available_doses) > ?',
                    {
                        replacements: [vaccine_name, availability[0]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else if(availability[0] === null && availability[1] !== null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) GROUP BY v.vaccine_id HAVING sum(b.available_doses) < ?',
                    {
                        replacements: [vaccine_name, availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }else{
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) GROUP BY v.vaccine_id HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                    {
                        replacements: [vaccine_name, availability[0], availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxList: object[]) => {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                });
            }
        }else if(vax_name == null) {
            if(expiration_date[0] !== null && expiration_date[1] === null) {
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [expiration_date[0], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [expiration_date[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [expiration_date[0], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }else if(expiration_date[0] === null && expiration_date[1] !== null) {
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [expiration_date[1], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [expiration_date[1], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [expiration_date[1], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }else{
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [expiration_date[0], expiration_date[1], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [expiration_date[0], expiration_date[1], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [expiration_date[0], expiration_date[1], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }
        }else{
            var vaccine_name:string[] = [];
            for (let i = 0; i < vax_name.length; i++) {
                vaccine_name[i]= vax_name[i].toLowerCase();
            }
            if(expiration_date[0] !== null && expiration_date[1] === null) {
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date > ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }else if(expiration_date[0] === null && expiration_date[1] !== null) {
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [vaccine_name, expiration_date[1], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [vaccine_name, expiration_date[1], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date < ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [vaccine_name, expiration_date[1], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }else{
                if(availability[0] !== null && availability[1] === null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) > ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], expiration_date[1], availability[0]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else if(availability[0] === null && availability[1] !== null) {
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) < ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], expiration_date[1], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }else{
                    await sequelize.query(
                        'SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name IN (?) AND b.expiration_date >= ? AND b.expiration_date <= ? GROUP BY v.vaccine_id, b.batch, b.expiration_date HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                        {
                            replacements: [vaccine_name, expiration_date[0], expiration_date[1], availability[0], availability[1]],
                            type: QueryTypes.SELECT
                        }
                    ).then((vaxList: object[]) => {
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
                    });
                }
            }
        }
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

export async function availableVaxDoses(vax_name: string, availability: Array<number>, res:any): Promise<void>{
    try{
        const vaccine_name= vax_name.toLowerCase();
        if(availability == null){
            await sequelize.query(
                'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name = ? GROUP BY v.vaccine_id HAVING sum(b.available_doses) > 0',
                {
                    replacements: [vaccine_name],
                    type: QueryTypes.SELECT
                }
            ).then((vaxData: object[]) => {
                if(vaxData.length !== 0) {
                    let vax_data_json = JSON.parse(JSON.stringify(vaxData));
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.AvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:vax_data_json[0].total_available_doses});
                }else{
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.NotAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg});
                }
            });
        }else{
            if(availability[0] !== null && availability[1] === null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name = ? GROUP BY v.vaccine_id HAVING sum(b.available_doses) > ?',
                    {
                        replacements: [vaccine_name, availability[0]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxData: object[]) => {
                    if(vaxData.length !== 0) {
                        let vax_data_json = JSON.parse(JSON.stringify(vaxData));
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:vax_data_json[0].total_available_doses});
                    }else{
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg})
                    }
                });
            }else if(availability[0] === null && availability[1] !== null) {
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name = ? GROUP BY v.vaccine_id HAVING sum(b.available_doses) < ?',
                    {
                        replacements: [vaccine_name, availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxData: object[]) => {
                    if(vaxData.length !== 0) {
                        let vax_data_json = JSON.parse(JSON.stringify(vaxData));
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:vax_data_json[0].total_available_doses});
                    }else{
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg})
                    }
                });
            }else{
                await sequelize.query(
                    'SELECT v.*, sum(b.available_doses) as total_available_doses FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) WHERE v.vaccine_name = ? GROUP BY v.vaccine_id HAVING sum(b.available_doses) >= ? AND sum(b.available_doses) <= ?',
                    {
                        replacements: [vaccine_name, availability[0], availability[1]],
                        type: QueryTypes.SELECT
                    }
                ).then((vaxData: object[]) => {
                    if(vaxData.length !== 0) {
                        let vax_data_json = JSON.parse(JSON.stringify(vaxData));
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:vax_data_json[0].total_available_doses});
                    }else{
                        const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                        res.status(new_res_msg.status).json({Message:new_res_msg.msg})
                    }
                });
            }
        }
    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

// add vaccination and decrement available doses in batch table
export async function addVaccination(vaccine_id:number, batch:string, user_key:string, timestamp_vc:Date, res:any){
    try{
        batch = batch.toUpperCase();
        user_key = user_key.toUpperCase();
        const vaxData = await Vaccination.create({vaccine:vaccine_id, batch:batch, user_key:user_key, timestamp_vc:timestamp_vc});
        await Batch.decrement(["available_doses"], {by:1, where:{vaccine:vaccine_id, batch:batch}});
        const new_res_msg = getSuccessMsg(SuccessMsgEnum.NewVaccination).getMsg();
        res.status(new_res_msg.status).json({Message:new_res_msg.msg, Vaccination:vaxData});
        
    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}


