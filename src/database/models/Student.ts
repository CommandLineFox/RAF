import { ObjectId } from "bson";
import { Smer } from "@utils/Types";

export interface Index {
    broj: number;
    godina: number;
}

export interface StudentDoc {
    id: string;
    ime: string;
    prezime: string;
    godina: number;
    smer: Smer;
    index: Index;
}

export class Student implements StudentDoc {
    public _id: ObjectId;
    public id: string;
    public ime: string;
    public prezime: string;
    public godina: number;
    public smer: Smer;
    public index: Index;

    public constructor(data: StudentDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.ime = data.ime;
        this.prezime = data.prezime;
        this.godina = data.godina;
        this.smer = data.smer;
        this.index = data.index;
    }
}
