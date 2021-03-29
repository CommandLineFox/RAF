import { ObjectId } from "bson";

export interface Student {
    _id: ObjectId;
    ime: string;
    prezime: string;
    godina: number;
    smer: string;
    broj: number;
    godinaUpisa: number;
}
