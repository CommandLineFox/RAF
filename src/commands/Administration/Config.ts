import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { MessageEmbed } from "discord.js";
import { splitArguments } from "@utils/Utils";
import { DatabaseCheckOption, DisplayData } from "~/utils/Types";
import { Database } from "@database/Database";

export default class Config extends Command {
    public constructor() {
        super({
            name: "Config",
            triggers: ["config", "cfg", "setup"],
            description: "Подешавања одређених функција за овај сервер",
            group: Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }

    protected async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        const database = client.database;

        const guild = await database?.getGuild(event.guild.id);
        if (!guild) {
            return;
        }

        const [subcommand, option, args] = splitArguments(event.argument, 3);
        if (!subcommand) {
            await displayAllSettings(event, guild);
            return;
        }

        switch (subcommand.toLowerCase()) {
            case "prefix": {
                await prefixSettings(event, option, args, guild);
                break;
            }

            case "mod": {
                await moderatorSettings(event, option, args, guild);
                break;
            }

            case "notif": {
                await notifRoleSettings(event, option, args, guild);
                break;
            }

            case "verified": {
                await verifiedSettings(event, option, args, guild);
                break;
            }

            case "log": {
                await logSettings(event, option, args, guild);
                break;
            }

            case "years": {
                await yearSettings(event, option, args, guild);
                break;
            }

            case "groups": {
                await groupSettings(event, option, args, guild);
                break;
            }

            case "directions": {
                await directionSettings(event, option, args, guild);
                break;
            }
        }
    }
}

async function prefixSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                await event.send("Префикс може бити до 5 карактера.");
                break;
            }

            await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": args } });
            await event.send(`Префикс је постављен на \`${args}\``);
            break;
        }

        case "reset": {
            await database?.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.prefix": "" } });
            await event.send(`Префикс је враћен на \`${client.config.prefix}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "moderator");

    if (!option) {
        await displayData(event, guild, "moderators", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (!args) {
                await event.send("Морате да унесете улогу.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
            if (!role) {
                await event.send("Нисам нашао ту улогу.");
                return;
            }

            if (guild.config.roles?.moderator?.includes(role.id)) {
                await event.send("Ова улога је већ модератор.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } });
            await event.send(`\`${role.name}\` је додата као модератор.`);
            break;
        }

        case "remove": {
            if (!args) {
                await event.send("Морате да унесете улогу.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
            if (!role) {
                await event.send("Нисам нашао ту улогу.");
                return;
            }

            if (!guild.config.roles?.moderator?.includes(role.id)) {
                await event.send("Ова улога није модератор.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            await event.send(`\`${role.name}\` више није модератор.`);
            break;
        }
    }
}

async function notifRoleSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "roles");

    if (!option) {
        await displayData(event, guild, "notifications", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (!args) {
                await event.send("Морате да унесете улогу.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
            if (!role) {
                event.send("Нисам нашао ту улогу.");
                return;
            }

            await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.roles.notifications": role.id } });
            await event.send(`Улога за нотификације је сада \`${role.name}\``);
            break;
        }

        case "remove": {
            await database?.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.notifications": "" } });
            await event.send("Уклоњена је улога за нотификације.");
            break;
        }
    }
}

async function verifiedSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "roles");

    if (!option) {
        await displayData(event, guild, "verified", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (!args) {
                await event.send("Морате да унесете улогу.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
            if (!role) {
                event.send("Нисам нашао ту улогу.");
                return;
            }

            await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.roles.verified": role.id } });
            await event.send(`Улога за верификоване чланове је сада \`${role.name}\``);
            break;
        }

        case "remove": {
            await database?.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.verified": "" } });
            await event.send("Уклоњена је улога за верификоване чланове.");
            break;
        }
    }
}

async function logSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;
    await databaseCheck(database, guild, "channels");

    if (!option) {
        await displayData(event, guild, "log", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Нисам могао да нађем канал који тражиш.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.log": channel.id } });
            await event.send(`Канал за логовање је постављен на \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.log": "" } });
            await event.send("Канал за логовање је склоњен.");
            break;
        }
    }
}

async function yearSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (!args) {
                await event.send("Морате да унесете годину.");
                return;
            }

            if (guild.config.roles?.years?.includes(args)) {
                await event.send("Ова година већ постоји.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.years": args } });
            await event.send(`\`${args}\` је додата као година.`);
            break;
        }

        case "remove": {
            if (!args) {
                await event.send("Морате да унесете годину.");
                return;
            }

            if (!guild.config.roles?.years?.includes(args)) {
                await event.send("Ова година није постајала у бази.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.years": args } });
            await event.send(`\`${args}\` више није година.`);
            break;
        }
    }
}

async function groupSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (!args) {
                await event.send("Морате да унесете групу.");
                return;
            }

            if (guild.config.roles?.groups?.includes(args)) {
                await event.send("Ова група већ постоји.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.groups": args } });
            await event.send(`\`${args}\` је додата као група.`);
            break;
        }

        case "remove": {
            if (!args) {
                await event.send("Морате да унесете групу.");
                return;
            }

            if (!guild.config.roles?.groups?.includes(args)) {
                await event.send("Ова група није постајала у бази.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.groups": args } });
            await event.send(`\`${args}\` више није група.`);
            break;
        }
    }
}

async function directionSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (!args) {
                await event.send("Морате да унесете смер.");
                return;
            }

            if (guild.config.roles?.directions?.includes(args)) {
                await event.send("Овај смер већ постоји.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.directions": args } });
            await event.send(`\`${args}\` је додат као смер.`);
            break;
        }

        case "remove": {
            if (!args) {
                await event.send("Морате да унесете смер.");
                return;
            }

            if (!guild.config.roles?.directions?.includes(args)) {
                await event.send("Овај смер није постајала у бази.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.directions": args } });
            await event.send(`\`${args}\` више није смер.`);
            break;
        }
    }
}

async function displayAllSettings(event: CommandEvent, guild: Guild) {
    const embed = new MessageEmbed()
        .setTitle("Подешавања за овај сервер:")
        .addField("Префикс", await displayData(event, guild, "prefix"), true)
        .addField("Модератори", await displayData(event, guild, "moderators"), true)
        .addField("Нотификације", await displayData(event, guild, "notifications"), true)
        .addField("Верификовани", await displayData(event, guild, "verified"), true)
        .addField("Логовање", await displayData(event, guild, "log"), true)
        .addField("Године", await displayData(event, guild, "years"), true)
        .addField("Групе", await displayData(event, guild, "groups"), true)
        .setFooter(`Захтевано од стране ${event.author.tag}`, event.author.displayAvatarURL());

    await event.send(embed);
}

async function databaseCheck(database: Database, guild: Guild, option: DatabaseCheckOption): Promise<void> {
    switch (option.toLowerCase()) {
        case "roles": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            break;
        }

        case "moderator": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": { "moderator": [] } } });
            } else if (!guild.config.roles?.moderator) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }

        case "channels": {
            if (!guild.config.channels) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }
    }
}

async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean): Promise<any> {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild?.config.prefix ?? client.config.prefix;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    return "Нема улога које су модератри.";
                }

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                return list;
            }

            case "notifications": {
                const notif = guild.config.roles?.notifications;
                if (!notif) {
                    return "Нема улоге за нотификације.";
                }

                const uloga = event.guild.roles.cache.get(notif);
                return uloga?.name;
            }

            case "verified": {
                const verified = guild.config.roles?.verified;
                if (!verified) {
                    return "Нема улоге за верификоване.";
                }

                const uloga = event.guild.roles.cache.get(verified);
                return uloga?.name;
            }

            case "log": {
                if (!guild.config.channels?.log) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.log": "" } });
                    return "Није намештен.";
                }

                return `${event.guild.channels.cache.get(guild.config.channels.log)}`;
            }

            case "years": {
                if (!guild.config.roles?.years || guild.config.roles.years.length == 0) {
                    return "Нема улога за годину.";
                }
                return guild.config.roles.years.join(", ");
            }

            case "groups": {
                if (!guild.config.roles?.groups || guild.config.roles.groups.length == 0) {
                    return "Нема улога за годину.";
                }
                return guild.config.roles.groups.join(", ");
            }
        }
    } else {
        switch (type.toLowerCase()) {
            case "prefix": {
                await event.send(`Prefix je trenutno \`${guild?.config.prefix ?? client.config.prefix}\``);
                break;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    await event.send("Нема улога које су модератори.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("Ове улоге су модератори:")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                embed.setDescription(list);
                await event.send(embed);
                break;
            }

            case "notifications": {
                const notif = guild.config.roles?.notifications;
                if (!notif) {
                    event.send("Нема улоге за нотификације.");
                    return;
                }

                const uloga = event.guild.roles.cache.get(notif);
                event.send(`Улога за нотификације је ${uloga?.name}`);
                break;
            }

            case "verified": {
                const verified = guild.config.roles?.verified;
                if (!verified) {
                    event.send("Нема улоге за верификоване.");
                    return;
                }

                const uloga = event.guild.roles.cache.get(verified);
                event.send(`Улога за верификоване је ${uloga?.name}`);
                break;
            }

            case "log": {
                if (!guild.config.channels?.log) {
                    event.send("Нема канала за логовање.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.log": "" } });
                    return;
                }

                await event.send(`Канал за логовање је <#${event.guild.channels.cache.get(guild.config.channels.log)}>`);
                break;
            }
        }
    }
    return;
}
