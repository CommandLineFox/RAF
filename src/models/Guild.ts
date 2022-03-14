export interface Dropdown {
    label?: string;
    description?: string;
    value?: string;
}

export interface Roles {
    moderator?: string[];
    notifications?: string;
    verified?: string;
    years?: string[];
    groups?: string[];
    directions?: string[];
}

export interface Channels {
    log?: string;
    failLog?: string;
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    channels?: Channels;
}

export interface Guild {
    id: string;
    config: GuildConfig;
    applications: string[];
}
