import Command from "@command/Command";
import { Public } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Guild } from "@models/Guild";
import { capitalizeWords, sanitize, validateGrupa, validateNumber, validateSmer } from "@utils/Utils";

export default class Prijava extends Command {
    public constructor() {
        super({
            name: "Prijava",
            triggers: ["prijava", "пријава", "verify"],
            description: "Започиње процес провере студента",
            group: Public
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        try {
            const client = event.client;
            const database = client.database;

            const guild = await database.getGuild(event.guild.id);
            if (!guild || !guild.config.roles || !guild.config.roles.verified) {
                event.send("Постоји грешка са базом података. Молимо Вас, контактирајте једног од администратора.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.verified);
            if (!role) {
                event.send("Постоји грешка са подешавањима сервера. Молимо Вас конактирајте једног од администратора.");
                return;
            }

            const member = event.member;
            if (member.roles.cache.has(role.id)) {
                event.send("Већ сте верификовани. Не можете се поново верификовати.");
                return;
            }

            if (guild.applications.length > 0 && guild.applications.includes(member.id)) {
                event.send("Већ сте у процесу пријаве.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$push": { "applications": member.id } });

            const pitanja = client.config.questions as string[];
            const odgovori = [] as string[];
            const pogresniOdgovori = [] as string[];

            let greska = false;
            for (let i = 0; i < pitanja.length; i++) {
                if (greska) {
                    await database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                    return;
                }

                await member.user.send(pitanja[i])
                    .then(async (message) => {
                        await message.channel.awaitMessages({ filter: msg => msg.author === member.user, max: 1, time: 120000, errors: ["time"] })
                            .then(async (response) => {
                                const odgovor = response.first()!.content;

                                const proveren = provera(odgovor, i);
                                if (proveren.startsWith("Грешка:")) {
                                    pogresniOdgovori.push(odgovor);
                                    greska = true;
                                    await member.user.send(proveren);
                                    await database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                                    await failLog(event, guild, member, odgovori, pogresniOdgovori);
                                    return;
                                }

                                odgovori.push(proveren);
                                pogresniOdgovori.push(proveren);
                            })
                            .catch(async () => {
                                await member.user.send("Прошло је 2 минута. Молимо Вас пријавите се поново.");
                                await database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                            });
                    })
                    .catch(async () => {
                        await event.send("Молимо Вас омогућите боту да Вас контактира у приватним порукама како би сте се верификовали.");
                        await database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                        greska = true;
                    });
            }

            if (!greska) {
                await addRoles(event, odgovori, role);
                await member.user.send("Успешно сте се верификовали. Уколико постоји нека грешка, молимо Вас контактирајте модератора или администратора сервера.");
                await database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                await log(event, guild, member, odgovori);
            }
        } catch (error) {
            event.client.emit("error", (error as Error));
        }
    }
}

async function addRoles(event: CommandEvent, odgovori: string[], role: Role) {
    const member = event.member;

    for (let i = 0; i < odgovori.length; i++) {
        switch (i) {
            case 0: {
                await member.setNickname(capitalizeWords(odgovori[0]));
                break;
            }

            case 1:
            case 2: {
                if (odgovori[i] != "-") {
                    const uloga = event.guild.roles.cache.find(r => sanitize(r.name) === sanitize(odgovori[i]));
                    if (!uloga) {
                        await member.user.send("Дошло је до грешке при тражењу улоге. Молимо Вас контактирајте администратора.");
                        await event.client.database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "applications": member.id } });
                        return;
                    }

                    await member.roles.add(uloga);
                    break;
                }
            }
        }
    }

    await member.roles.add(role);
}

function log(event: CommandEvent, guild: Guild, member: GuildMember, odgovori: string[]): void {
    if (!guild.config.channels?.log) {
        return;
    }

    const channel = event.guild.channels.cache.get(guild.config.channels.log);
    if (!channel) {
        return;
    }

    const embed = new MessageEmbed()
        .setTitle("Нови верификовани корисник")
        .addField("Discord налог:", `${member.user.tag} (${member.id})`)
        .addField("Име и презиме:", odgovori[0])
        .addField("Смер:", odgovori[1])
        .addField("Група:", odgovori[2])
        .addField("Број на сајту:", odgovori[3]);

    if (odgovori.includes("-")) {
        embed.addField("Поновац:", "Ponovac");
    }

    let role;
    if (guild.config.roles?.notifications) {
        role = event.guild.roles.cache.get(guild.config.roles?.notifications);
    }

    const content = role ? `<@&${role.id}>` : "";
    (channel as TextChannel).send({ content: content, embeds: [embed] });
}

async function failLog(event: CommandEvent, guild: Guild, member: GuildMember, odgovori: string[], pogresniOdgovori: string[]): Promise<void> {
    if (!guild.config.channels?.failLog) {
        return;
    }

    const channel = event.guild.channels.cache.get(guild.config.channels.failLog);
    if (!channel) {
        return;
    }

    const embed = new MessageEmbed()
        .setTitle("Нови верификовани корисник")
        .addField("Discord налог:", `${member.user.tag} (${member.id})`)
        .addField("Име и презиме:", pogresniOdgovori[0] ?? odgovori[0] ?? "Нема одговора")
        .addField("Смер:", pogresniOdgovori[1] ?? odgovori[1] ?? "Нема одговора")
        .addField("Група:", pogresniOdgovori[2] ?? odgovori[2] ?? "Нема одговора")
        .addField("Број на сајту:", pogresniOdgovori[3] ?? odgovori[3] ?? "Нема одговора");

    if (odgovori.includes("-")) {
        embed.addField("Поновац:", "Ponovac");
    }

    let role;
    if (guild.config.roles?.notifications) {
        role = event.guild.roles.cache.get(guild.config.roles?.notifications);
    }

    const content = role ? `<@&${role.id}>` : "";
    await (channel as TextChannel).send({ content: content, embeds: [embed] });
}

function provera(argument: string, index: number): string {
    switch (index) {
        case 0: {
            return sanitize(argument);
        }

        case 1: {
            return validateSmer(argument);
        }

        case 2: {
            return validateGrupa(argument);
        }

        case 3: {
            return validateNumber(argument);
        }
    }

    return "";
}
