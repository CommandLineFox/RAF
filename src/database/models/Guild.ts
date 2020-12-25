import { ObjectId } from "bson";

export interface Roles {
    moderator?: string[];
    notifikacije?: string;
    verified?: string;
    prva?: string;
    druga?: string;
    treca?: string;
    cetvrta?: string;
    rn?: string;
    ri?: string;
    rm?: string;
    rd?: string;
    s?: string;
}

export interface Channels {
    log?: string;
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    channels?: Channels;
}

export interface GuildDoc {
    id: string;
    config?: GuildConfig;
}

export class Guild implements GuildDoc {
    public _id: ObjectId;
    public id: string;
    public config: GuildConfig;

    public constructor(data: GuildDoc) {
        this._id = new ObjectId();
        this.id = data.id;
        this.config = data.config ?? {};
    }
}
