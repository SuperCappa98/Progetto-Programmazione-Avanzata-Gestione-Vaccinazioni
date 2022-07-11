import {Vaccine} from '../models/Vaccine';
import {ErrorMsgEnum, getErrorMsg} from "../factory/errorMsg";
import {SuccessMsgEnum, getSuccessMsg} from "../factory/successMsg";
import { Batch } from '../models/Batch';
import { Delivery } from '../models/Delivery';
import { DBSingleton } from "../singleton/DBSingleton";
import { QueryTypes, Sequelize } from 'sequelize';
import { Vaccination } from '../models/Vaccination';
import { generateCustomerInformation, generateHeader, generateVaccinationTable, generateCoverageDataUserTable } from '../utils/generate_pdf';
const PDFDocument = require('pdfkit');
import { SingleVax } from '../utils/statistics';
const math = require('mathjs');
require('dotenv').config();

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
            var new_delivery = {Batch:newDelivery.batch, Doses:newDelivery.delivery_doses, DeliveryDate:newDelivery.delivery_date, VaccineId:newDelivery.vaccine};   
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, NewDelivery:new_delivery});
             
        });
    }catch (error:any) {
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

export async function vaxList(vax_name: Array<string>, availability: Array<number>, expiration_date: Array<Date>, res:any): Promise<void>{
    try{
        var vaccine_name:string[] = [];
        if(vax_name !== null){
            for (let i = 0; i < vax_name.length; i++) {
                vaccine_name[i]= vax_name[i].toLowerCase();
            }
        }

        const vax_data = await sequelize.query(
            `SELECT v.*, b.batch, b.expiration_date, sum(b.available_doses) as total_available_doses 
            FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id)  
            GROUP BY v.vaccine_id, b.batch, b.expiration_date`,
            {
                type: QueryTypes.SELECT
            }
        );
        
        const vax_data_json = JSON.parse(JSON.stringify(vax_data));
        console.log(vax_data_json);
        let listFiltered;

        if (vax_name == null && availability == null && expiration_date == null){
            await Vaccine.findAll().then((vaxList: object[]) => {
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
            });
        }else if(availability == null && expiration_date == null) {
            await Vaccine.findAll({ where: {vaccine_name:vaccine_name} }).then((vaxList: object[]) => {
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:vaxList});
            });
        }else if(vax_name == null && expiration_date == null) {
            listFiltered = vax_data_json.map((vax_data: any) => {
                let new_vax_data = Object.assign({}, vax_data);
                delete new_vax_data.batch;
                delete new_vax_data.expiration_date;
                return new_vax_data;
            }).reduce((c: { vaccine_id: any; vaccine_name: any; coverage: any; total_available_doses: any; }[], 
                i: { vaccine_id: any; vaccine_name: any; coverage: any; total_available_doses: any; }) => {
                let cc = c.findIndex((e)=>e.vaccine_id==i.vaccine_id);
                if(cc==-1) c.push({vaccine_id: i.vaccine_id, vaccine_name:i.vaccine_name, coverage:i.coverage, total_available_doses: parseInt(i.total_available_doses)});
                else c[cc].total_available_doses += parseInt(i.total_available_doses);
                return c
            }, []);
            //console.log(listFiltered);

            if(availability[0] !== null && availability[1] === null){ // filter >
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses > availability[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }else if(availability[0] === null && availability[1] !== null){ // filter <
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses < availability[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }        
        }else if(vax_name == null && availability == null) {
            listFiltered = vax_data_json.map((vax_data: any) => {
                let new_vax_data = Object.assign({}, vax_data);
                delete new_vax_data.total_available_doses;
                return new_vax_data;
            });
            //console.log(listFiltered);

            if(expiration_date[0] !== null && expiration_date[1] === null){ // filter >
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; }) => 
                vax_data.expiration_date > expiration_date[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});     
            }else if(expiration_date[0] === null && expiration_date[1] !== null){ // filter <
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; })  => 
                vax_data.expiration_date < expiration_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});    
            }else if(expiration_date[0] !== null && expiration_date[1] !== null){ // filter >= <=
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; })  => 
                vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }
        }else if(expiration_date == null) {
            listFiltered = vax_data_json.map((vax_data: any) => {
                let new_vax_data = Object.assign({}, vax_data);
                delete new_vax_data.batch;
                delete new_vax_data.expiration_date;
                return new_vax_data;
            }).reduce((c: { vaccine_id: any; vaccine_name: any; coverage: any; total_available_doses: any; }[], 
                i: { vaccine_id: any; vaccine_name: any; coverage: any; total_available_doses: any; }) => {
                let cc = c.findIndex((e)=>e.vaccine_id==i.vaccine_id);
                if(cc==-1) c.push({vaccine_id: i.vaccine_id, vaccine_name:i.vaccine_name, coverage:i.coverage, total_available_doses: parseInt(i.total_available_doses)});
                else c[cc].total_available_doses += parseInt(i.total_available_doses);
                return c
            }, []).filter((vax_data: { vaccine_name: string; })  => vaccine_name.includes(vax_data.vaccine_name));
            //console.log(listFiltered);

            if(availability[0] !== null && availability[1] === null){ // filter >
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses > availability[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }else if(availability[0] === null && availability[1] !== null){ // filter <
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses < availability[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                listFiltered = listFiltered.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }      
        }else if(availability == null) {
            listFiltered = vax_data_json.map((vax_data: any) => {
                let new_vax_data = Object.assign({}, vax_data);
                delete new_vax_data.total_available_doses;
                return new_vax_data;
            }).filter((vax_data: { vaccine_name: string; })  => vaccine_name.includes(vax_data.vaccine_name));
            console.log(listFiltered);

            if(expiration_date[0] !== null && expiration_date[1] === null){ // filter >
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; }) => 
                vax_data.expiration_date > expiration_date[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});     
            }else if(expiration_date[0] === null && expiration_date[1] !== null){ // filter <
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; })  => 
                vax_data.expiration_date < expiration_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});    
            }else if(expiration_date[0] !== null && expiration_date[1] !== null){ // filter >= <=
                listFiltered = listFiltered.filter((vax_data: { expiration_date: Date; })  => 
                vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
            }
        }else if(vax_name == null) {
            if(expiration_date[0] !== null && expiration_date[1] === null){ // filter >
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }     
            }else if(expiration_date[0] === null && expiration_date[1] !== null){ // filter <
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }     
            }else if(expiration_date[0] !== null && expiration_date[1] !== null){ // filter >= <=
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = vax_data_json.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && 
                    vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }     
            }
        }else{
            listFiltered = vax_data_json.filter((vax_data: { vaccine_name: string; })  => vaccine_name.includes(vax_data.vaccine_name));

            if(expiration_date[0] !== null && expiration_date[1] === null){ // filter >
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date > expiration_date[0] && vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }     
            }else if(expiration_date[0] === null && expiration_date[1] !== null){ // filter <
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date < expiration_date[1] && vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }     
            }else if(expiration_date[0] !== null && expiration_date[1] !== null){ // filter >= <=
                if(availability[0] !== null && availability[1] === null){ // filter >
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && vax_data.total_available_doses > availability[0]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] === null && availability[1] !== null){ // filter <
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && vax_data.total_available_doses < availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
                }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                    listFiltered = listFiltered.filter((vax_data: {expiration_date:Date, total_available_doses: number; }) => 
                    vax_data.expiration_date >= expiration_date[0] && vax_data.expiration_date <= expiration_date[1] && 
                    vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaxList).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaxList:listFiltered});
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

        const vax_data = await sequelize.query(
            `SELECT v.*, sum(b.available_doses) as total_available_doses 
            FROM vaccine as v JOIN batch as b on (b.vaccine = v.vaccine_id) 
            WHERE v.vaccine_name = ? 
            GROUP BY v.vaccine_id 
            HAVING sum(b.available_doses) > 0`,
            {
                replacements: [vaccine_name],
                type: QueryTypes.SELECT
            }
        );

        const vax_data_json = JSON.parse(JSON.stringify(vax_data));
        //console.log(vax_data_json);

        if(availability == null){
            if(vax_data_json.length !== 0) {
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.AvailableDoses).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:vax_data_json[0].total_available_doses});
            }else{
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.NotAvailableDoses).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg});
            }
        }else{
            let listFiltered;
            if(availability[0] !== null && availability[1] === null){ // filter >
                listFiltered = vax_data_json.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses > availability[0]);
                if(listFiltered.length !== 0) {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:listFiltered[0].total_available_doses});
                }else{
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg});
                }  
            }else if(availability[0] === null && availability[1] !== null){ // filter <
                listFiltered = vax_data_json.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses < availability[1]);
                if(listFiltered.length !== 0) {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:listFiltered[0].total_available_doses});
                }else{
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg});
                }   
            }else if(availability[0] !== null && availability[1] !== null){ // filter >= <=
                listFiltered = vax_data_json.filter((vax_data: { total_available_doses: number; }) => 
                vax_data.total_available_doses >= availability[0] && vax_data.total_available_doses <= availability[1]);
                if(listFiltered.length !== 0) {
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg, AvailableDoses:listFiltered[0].total_available_doses});
                }else{
                    const new_res_msg = getSuccessMsg(SuccessMsgEnum.FilterNotAvailableDoses).getMsg();
                    res.status(new_res_msg.status).json({Message:new_res_msg.msg});
                }
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

// get PDF with all the vaccinations for a user
export async function downloadPDF(req_user: any, res:any){
    try{
        var user_key;

        if(req_user.role === "Admin"){
            user_key = req_user.userKeyClient; // admin need to get the client key
        } else {
            user_key = req_user.userKey; // client have already his personal key in token
        }

        console.log("user_key after if: ",user_key);
        user_key = user_key.toUpperCase();

        const vaccinations = await sequelize.query(
            `SELECT vax.vaccine_name, vax.coverage, vaxs.batch, vaxs.user_key, vaxs.timestamp_vc
            FROM vaccine as vax JOIN vaccination as vaxs ON (vax.vaccine_id = vaxs.vaccine)
            WHERE user_key = :key
            ORDER BY timestamp_vc DESC`,
            {
            replacements: { key: user_key },
            type: QueryTypes.SELECT
            }
        );

        console.log("all vaccinations: ",vaccinations);
        const vaccinations_json = JSON.parse(JSON.stringify(vaccinations));
        console.log("all vaccinations PARSED: ",vaccinations_json);

        let doc = new PDFDocument({ margin: 50, bufferPages:true, pdfVersion: '1.5', tagged:true, displayTitle:true});
        console.log(doc);

        // Document meta data
        doc.info['Title'] = 'Vaccinazioni';
    


        let buffers: any = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {

            let pdfData = Buffer.concat(buffers);
            console.log(Buffer.byteLength(pdfData));
            
            res.writeHead(200, {
            'Content-Length': Buffer.byteLength(pdfData),
            'Content-Type': 'application/pdf',
            'Content-disposition': 'attachment;filename=vaccinazioni.pdf',})
            .end(pdfData);
        });

        generateHeader(doc);
        generateCustomerInformation(doc, user_key);
        generateVaccinationTable(doc, vaccinations_json);
        doc.end(); 

    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

// get JSON with all the vaccinations for a user
export async function vaccinationsJson(user_key: any, vax_name:string, vaccination_date:Array<Date>, res:any){
    try{

        if(vax_name !== null){
            vax_name = vax_name.toLowerCase();
        }

        user_key = user_key.toUpperCase();

        // get the list for all the vaccinations
        const vaccinations = await sequelize.query(
            `SELECT vax.vaccine_name, vax.coverage, vaxs.batch, vaxs.user_key, vaxs.timestamp_vc
            FROM vaccine as vax JOIN vaccination as vaxs ON (vax.vaccine_id = vaxs.vaccine)
            WHERE user_key = :key
            ORDER BY timestamp_vc DESC`,
            {
            replacements: { key: user_key },
            type: QueryTypes.SELECT
            }
        );

        console.log("all vaccinations: ",vaccinations);
        const vaccinations_json = JSON.parse(JSON.stringify(vaccinations));
        console.log("all vaccinations PARSED: ",vaccinations_json);


        if(vax_name === null && vaccination_date === null){
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:vaccinations_json});
        }else if(vax_name !== null && vaccination_date === null){
            const listFilteredName = vaccinations_json.filter((vaccination: { vaccine_name: string; })  => vaccination.vaccine_name === vax_name);
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFilteredName});
        }else if(vax_name === null && vaccination_date !== null){
            let listFilteredDate;           
            if(vaccination_date[0] !== null && vaccination_date[1] === null){ // filter >
                listFilteredDate = vaccinations_json.filter((vaccination: { timestamp_vc: Date; }) => 
                vaccination.timestamp_vc > vaccination_date[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFilteredDate});     
            }else if(vaccination_date[0] === null && vaccination_date[1] !== null){ // filter <
                listFilteredDate = vaccinations_json.filter((vaccination: { timestamp_vc: Date; })  => 
                vaccination.timestamp_vc < vaccination_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFilteredDate});    
            }else if(vaccination_date[0] !== null && vaccination_date[1] !== null){ // filter >= <=
                listFilteredDate = vaccinations_json.filter((vaccination: { timestamp_vc: Date; })  => 
                vaccination.timestamp_vc >= vaccination_date[0] && vaccination.timestamp_vc <= vaccination_date[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFilteredDate});
            }
        }else if(vax_name !== null && vaccination_date !== null){ // filters with both conditions
            let listFiltered;
            if(vaccination_date[0] !== null && vaccination_date[1] === null){ // filter >
                listFiltered = vaccinations_json.filter((vaccination: { timestamp_vc: Date; vaccine_name:string})  => 
                vaccination.timestamp_vc > vaccination_date[0] && vaccination.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFiltered});    
            }else if(vaccination_date[0] === null && vaccination_date[1] !== null){ // filter <
                listFiltered = vaccinations_json.filter((vaccination: { timestamp_vc: Date; vaccine_name:string})  => 
                vaccination.timestamp_vc < vaccination_date[1] && vaccination.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFiltered});    
            }else if(vaccination_date[0] !== null && vaccination_date[1] !== null){ // filter >= <=
                listFiltered = vaccinations_json.filter((vaccination: { timestamp_vc: Date; vaccine_name:string})  => 
                vaccination.timestamp_vc >= vaccination_date[0] && vaccination.timestamp_vc <= vaccination_date[1] && vaccination.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.VaccinationsList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, VaccinationsList:listFiltered});
            }
        }
    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

export async function coverageExpiredUserList(vax_name:string, days_coverage_expired:Array<number>, res:any){
    try{
        if(vax_name !== null){
            vax_name = vax_name.toLowerCase();
        }

        const coverage_expired_users = await sequelize.query(
            `SELECT vaxs.user_key, vax.vaccine_name, max(vaxs.timestamp_vc) AS last_vaccination_timestamp, 
            CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc))) AS days_coverage_expired
            FROM vaccine AS vax JOIN vaccination AS vaxs ON (vaxs.vaccine = vax.vaccine_id)
            GROUP BY vax.vaccine_name, vaxs.user_key, vax.coverage
            HAVING  vax.coverage + DATE(max(vaxs.timestamp_vc)) < CURRENT_DATE`,
            {
            type: QueryTypes.SELECT
            }
        );

        const coverage_expired_users_json = JSON.parse(JSON.stringify(coverage_expired_users));
        let listFiltered;
        
        if(vax_name === null && days_coverage_expired === null){
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:coverage_expired_users_json});
        }else if(vax_name !== null && days_coverage_expired === null){
            listFiltered = coverage_expired_users_json.filter((user: { vaccine_name: string; })  => user.vaccine_name === vax_name);
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});
        }else if(vax_name === null && days_coverage_expired !== null){
            if(days_coverage_expired[0] !== null && days_coverage_expired[1] === null){ // filter >
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
                user.days_coverage_expired > days_coverage_expired[0]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});   
            }else if(days_coverage_expired[0] === null && days_coverage_expired[1] !== null){ // filter <
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
                user.days_coverage_expired < days_coverage_expired[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});   
            }else if(days_coverage_expired[0] !== null && days_coverage_expired[1] !== null){ // filter >= <=
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
                user.days_coverage_expired >= days_coverage_expired[0] && user.days_coverage_expired <= days_coverage_expired[1]);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});
            }
        }else if(vax_name !== null && days_coverage_expired !== null){ // filters with both conditions
            if(days_coverage_expired[0] !== null && days_coverage_expired[1] === null){ // filter >
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; vaccine_name:string; }) => 
                user.days_coverage_expired > days_coverage_expired[0] && user.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});   
            }else if(days_coverage_expired[0] === null && days_coverage_expired[1] !== null){ // filter <
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; vaccine_name:string; })  => 
                user.days_coverage_expired < days_coverage_expired[1] && user.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});  
            }else if(days_coverage_expired[0] !== null && days_coverage_expired[1] !== null){ // filter >= <=
                listFiltered = coverage_expired_users_json.filter((user: { days_coverage_expired: number; vaccine_name:string; })  => 
                user.days_coverage_expired >= days_coverage_expired[0] && user.days_coverage_expired <= days_coverage_expired[1] && user.vaccine_name === vax_name);
                const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageExpiredUserList).getMsg();
                res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageExpiredUserList:listFiltered});
            }
        }
    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

export async function coverageDataUser(req_user:any, format:string, order_by:string, res:any){
    try{
        var user_key;
        if(req_user.role === "Admin"){
            user_key = req_user.userKeyClient; // admin need to get the client key
        } else {
            user_key = req_user.userKey; // client have already his personal key in token
        }
        user_key = user_key.toUpperCase();

        let coverage_data_user;
        if(order_by == null) {
            coverage_data_user = await sequelize.query(
                `SELECT vaxs.user_key, vax.vaccine_name, max(vaxs.timestamp_vc) AS last_vaccination_timestamp, 
                CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc))) AS days_coverage
                FROM vaccine AS vax JOIN vaccination AS vaxs ON (vaxs.vaccine = vax.vaccine_id)
                WHERE user_key = ?
                GROUP BY vax.vaccine_name, vaxs.user_key, vax.coverage`,
                {
                    replacements: [user_key],
                    type: QueryTypes.SELECT
                }
            );
        }else if(order_by == "ASC"){
            coverage_data_user = await sequelize.query(
                `SELECT vaxs.user_key, vax.vaccine_name, max(vaxs.timestamp_vc) AS last_vaccination_timestamp, 
                CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc))) AS days_coverage
                FROM vaccine AS vax JOIN vaccination AS vaxs ON (vaxs.vaccine = vax.vaccine_id)
                WHERE user_key = ?
                GROUP BY vax.vaccine_name, vaxs.user_key, vax.coverage
                ORDER BY abs(CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc)))) ASC`,
                {
                    replacements: [user_key],
                    type: QueryTypes.SELECT
                }
            );
        }else if(order_by == "DESC"){
            coverage_data_user = await sequelize.query(
                `SELECT vaxs.user_key, vax.vaccine_name, max(vaxs.timestamp_vc) AS last_vaccination_timestamp, 
                CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc))) AS days_coverage
                FROM vaccine AS vax JOIN vaccination AS vaxs ON (vaxs.vaccine = vax.vaccine_id)
                WHERE user_key = ?
                GROUP BY vax.vaccine_name, vaxs.user_key, vax.coverage
                ORDER BY abs(CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc)))) DESC`,
                {
                    replacements: [user_key],
                    type: QueryTypes.SELECT
                }
            );
        }
        
        const coverage_data_user_json = JSON.parse(JSON.stringify(coverage_data_user));
        //console.log(coverage_data_user_json);

        coverage_data_user_json.forEach((data_user: {days_coverage?:number}) => {
            if (data_user.days_coverage !== undefined && data_user.days_coverage < 0) {
                data_user.days_coverage = Math.abs(data_user.days_coverage);
                delete Object.assign(data_user, {["days_to_coverage"]: data_user["days_coverage"]})["days_coverage"]; 
            }else if (data_user.days_coverage !== undefined && data_user.days_coverage >= 0) {
                delete Object.assign(data_user, {["days_from_coverage"]: data_user["days_coverage"]})["days_coverage"];
            }
        });

        //console.log(coverage_data_user_json);

        if(format == "JSON") {
            const new_res_msg = getSuccessMsg(SuccessMsgEnum.CoverageDataUser).getMsg();
            res.status(new_res_msg.status).json({Message:new_res_msg.msg, CoverageDataUser:coverage_data_user_json});
        }else if(format == "PDF") {
            let doc = new PDFDocument({ margin: 50, bufferPages:true, pdfVersion: '1.5', tagged:true, displayTitle:true});
            console.log(doc);

            // Document meta data
            doc.info['Title'] = 'Dati sulla copertura vaccinale';
    
            let buffers: any = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {

                let pdfData = Buffer.concat(buffers);
                console.log(Buffer.byteLength(pdfData));
            
                res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=dati_copertura_vaccinale.pdf'})
                .end(pdfData);
            });

            generateHeader(doc);
            generateCustomerInformation(doc, user_key);
            generateCoverageDataUserTable(doc, coverage_data_user_json);
            doc.end(); 
        }
    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}

// get statistics
export async function statistics(res:any){
    try{

        // list of vaccines in db
        const vaxs = await Vaccine.findAll({attributes:["vaccine_id"]});
        console.log("vaxs:",vaxs);
        const parsed_vaxs = JSON.parse(JSON.stringify(vaxs));
        console.log("parsed_vaxs:",parsed_vaxs);
        const vaxs_list = parsed_vaxs.map((vaccine: { vaccine_id: any; }) => vaccine.vaccine_id);
        console.log("vaxs_list:",vaxs_list);
        let statistics_list = [];

        // get statistics for each vaccin in db
        for (let index = 0; index < vaxs_list.length; index++) {
            console.log(`vaxs_list[${index}]:`, vaxs_list[index]);
            const vaccinations = await Vaccination.findAll({attributes:["timestamp_vc"], where: { vaccine:vaxs_list[index]}}); // select vaccinations for specific vaccine
            console.log(`vaxs_list[${index}]:`, vaxs_list[index]);
            console.log(vaccinations);
            const parsed_vaccinations = JSON.parse(JSON.stringify(vaccinations));
            console.log(parsed_vaccinations);
            const months = parsed_vaccinations.map((vaccination: { timestamp_vc:string; }) => {
            const timestamp = new Date(vaccination.timestamp_vc);
            return timestamp.getMonth()+1});
            console.log(months); // [4, 12, 12]
            const aggregate_months = months.reduce((acc:any, month:number) => {
                (acc[month] = acc[month] + 1 || 1);
                return acc;
            }, {});
            console.log(aggregate_months); // { '4': 1, '12': 2 }
            let m:number;
            for(m=1; m<=12; m++){
                if(Number(aggregate_months[m])){
                    console.log(`m in months: ${m}`);                   
                } else {
                    console.log(`m not in months: ${m}`);
                    aggregate_months[m]= 0;
                }
            }
            console.log(aggregate_months);  // { '1': 0, '2': 0 ... '4': 1,'5': 0,.... '12': 2 }

            
            const list_aggr_months = Object.values(aggregate_months); // [0,0 ... 1,0,.... 2 ]
            console.log("list_aggr_months: ", list_aggr_months);
            
            const min = list_aggr_months.reduce((prev:any, current:any) => Math.min(prev,current));
            const max = list_aggr_months.reduce((prev:any, current:any) => Math.max(prev, current));
            
            const sum_v = (list_aggr_months.reduce((prev:any, current:any) => prev + current, 0));
            const sum_v_number = sum_v as number;
            const mean_vaccinations = sum_v_number / list_aggr_months.length;
            const dev =  math.std(list_aggr_months, 'biased');
           

            console.log("min: ", min);
            console.log("max: ", max);
            console.log("vaccinations_mean: ", mean_vaccinations);
            console.log("dev: ", dev);

            const delivery = await Delivery.findAll({attributes:["delivery_doses"], where: { vaccine:vaxs_list[index]}});
            const parsed_delivery = JSON.parse(JSON.stringify(delivery));
            console.log("parsed_delivery: ", parsed_delivery);
            const total_delivery = parsed_delivery.reduce((acc:any, delivery:any) => acc + delivery.delivery_doses, 0);
            console.log("total_delivery: ", total_delivery);
            const total_deliv_number = total_delivery as number;
            const mean_delivery = total_deliv_number / list_aggr_months.length;

            let vaccine = await Vaccine.findOne({attributes:["vaccine_name"], where: {vaccine_id:vaxs_list[index] }});
            let parsed_vaccine = JSON.parse(JSON.stringify(vaccine));
            const singleVax = new SingleVax(parsed_vaccine['vaccine_name'], min, max, +mean_vaccinations.toFixed(2), +dev.toFixed(2), +mean_delivery.toFixed(2) );
            statistics_list.push(singleVax);
        }
        console.log(statistics_list);



        //------ statistics for user not covered

        const coverage_expired_users = await sequelize.query(
            `SELECT vaxs.user_key, vax.vaccine_name, max(vaxs.timestamp_vc) AS last_vaccination_timestamp, 
            CURRENT_DATE - (vax.coverage + DATE(max(vaxs.timestamp_vc))) AS days_coverage_expired
            FROM vaccine AS vax JOIN vaccination AS vaxs ON (vaxs.vaccine = vax.vaccine_id)
            GROUP BY vax.vaccine_name, vaxs.user_key, vax.coverage
            HAVING  vax.coverage + DATE(max(vaxs.timestamp_vc)) < CURRENT_DATE`,
            {
            type: QueryTypes.SELECT
            }
        );

        const coverage_expired_users_json = JSON.parse(JSON.stringify(coverage_expired_users));
      
        // filter user not covered > 90 days
        let listFiltered_90 = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
        user.days_coverage_expired > 90);
        console.log("listFiltered_90:",listFiltered_90);
               
        // filter user not covered <= 30 days
        let listFiltered_30 = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
        user.days_coverage_expired <= 30);
        console.log("listFiltered_30:",listFiltered_30);
     
        // filter user not covered   30  <  <= 90 days
        let listFiltered_31_90 = coverage_expired_users_json.filter((user: { days_coverage_expired: number; }) => 
        user.days_coverage_expired > 30 && user.days_coverage_expired <= 90);
        console.log("listFiltered_31_90:",listFiltered_31_90);
        
        const users_90 = listFiltered_90.length;
        const users_30 = listFiltered_30.length;
        const users_31_90 = listFiltered_31_90.length;
        console.log(users_90, users_30, users_31_90);

        const users_statistics = {
            "users_90": users_90,
            "users_30": users_30,
            "users_31_90": users_31_90,
        }

        statistics_list.push(users_statistics);

        //-------------------------------------   


        const new_res_msg = getSuccessMsg(SuccessMsgEnum.Statistics).getMsg();
        res.status(new_res_msg.status).json({Message:new_res_msg.msg, Statistics:statistics_list});
        // res.send("here you are your statistcs with month aggregation!");


    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}


export async function generateRedisKey(user_key:string, name:string, surname:string, res:any){
    try{
        const redis = require('redis');
        const client = redis.createClient({
            host: process.env.REDISHOST,
            port: process.env.REDISPORT
        })

        client.on('error', (err:any) => console.log('Redis Client Error', err));

        await client.on('connect', function() {
            console.log('Connected!');
        });

        await client.connect();

        let random_key = new Date().valueOf();
        const key = random_key.toString();
        console.log(random_key);

        let jwt = require('jsonwebtoken');
        let token = jwt.sign({ name: name, surname: surname, userKey: user_key, role: 'User' }, process.env.SECRET_KEY);

        await client.set(key, token);
        const value = await client.get(key);
        console.log(value);
        await client.expire(key, 60);

        client.quit();

        const new_res_msg = getSuccessMsg(SuccessMsgEnum.RedisKey).getMsg();
        res.status(new_res_msg.status).json({Message:new_res_msg.msg, RedisKey:key});
      

    }catch(error:any){
        controllerErrors(ErrorMsgEnum.InternalServer, error, res);
    }
}
      



