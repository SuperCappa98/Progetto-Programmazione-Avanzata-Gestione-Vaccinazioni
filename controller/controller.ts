import {Vaccine} from '../models/Vaccine';

export function addVax(name:string, coverage:number): void{ 
    Vaccine.create({vaccine_name:name, coverage:coverage});
}