import { ObjectId } from "bson";
import { Smer } from "@utils/Types";

export interface Index {
    broj: number;
    godina: number;
}

export interface Student {
    _id: ObjectId;
    id: string;
    ime: string;
    prezime: string;
    godina: number;
    smer: Smer;
    index: Index;
}
