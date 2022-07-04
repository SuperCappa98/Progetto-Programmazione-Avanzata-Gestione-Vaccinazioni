import {Vaccine} from '../models/Vaccine';

// check name != equal
//insert in db
// ok or ko
export function addVax(name:string, coverage:number): void{ 
    
    Vaccine.create({vaccine_name:name, coverage:coverage});
}