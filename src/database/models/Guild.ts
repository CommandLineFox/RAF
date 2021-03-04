import { ObjectId } from "bson";

export interface Roles {
    moderator?: string[];
    notifications?: string;
    verified?: string;
}

export interface Channels {
    log?: string;
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    channels?: Channels;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
}
