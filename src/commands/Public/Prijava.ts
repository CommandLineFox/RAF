import Command from "@command/Command";
import { Public } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Guild } from "@models/Guild";
import { capitalizeWords, sanitize, validateGodina, validateGrupa, validateNumber, validateSmer } from "@utils/Utils";

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

        let greska = false;
        for (let i = 0; i < pitanja.length; i++) {
            if (greska) {
                return;
            }

            await member.user.send(pitanja[i])
                .then(async (message) => {
                    await message.channel.awaitMessages({ filter: msg => msg.author === member.user, max: 1, time: 120000, errors: ["time"] })
                        .then((response) => {
                            const odgovor = response.first()!.content;

                            const proveren = provera(odgovor, i);
                            if (proveren.startsWith("Грешка:")) {
                                greska = true;
                                member.user.send(proveren);
                                database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                                return;
                            }

                            odgovori.push(proveren);
                        })
                        .catch(() => {
                            member.user.send("Прошло је 2 минута. Молимо Вас пријавите се поново.");
                            database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                        });
                })
                .catch(() => {
                    event.send("Молимо Вас омогућите боту да Вас контактира у приватним порукама како би сте се верификовали.");
                    database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
                    greska = true;
                });
        }

        if (!greska) {
            addRoles(event, odgovori, role);
            member.user.send("Успешно сте се верификовали. Уколико постоји нека грешка, молимо Вас контактирајте модератора или администратора сервера.");
            database.guilds.updateOne({ id: guild.id }, { "$pull": { "applications": member.id } });
            log(event, guild, member, odgovori);
        }
    }
}

function addRoles(event: CommandEvent, odgovori: string[], role: Role) {
    const member = event.member;

    for (let i = 0; i < odgovori.length; i++) {
        switch (i) {
            case 0: {
                member.setNickname(capitalizeWords(odgovori[0]));
                break;
            }

            case 1:
            case 2:
            case 3: {
                const uloga = event.guild.roles.cache.find(r => sanitize(r.name) === sanitize(odgovori[i]));
                if (!uloga) {
                    member.user.send("Дошло је до грешке при тражењу улоге. Молимо Вас контактирајте администратора.");
                    event.client.database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "applications": member.id } });
                    return;
                }

                member.roles.add(uloga);
            }
        }
    }

    member.roles.add(role);
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
        .addField("Година студија:", odgovori[1])
        .addField("Смер:", odgovori[2])
        .addField("Група:", odgovori[3])
        .addField("Број на сајту:", odgovori[4]);

    let role;
    if (guild.config.roles?.notifications) {
        role = event.guild.roles.cache.get(guild.config.roles?.notifications);
    }

    const content = role ? `<@&${role.id}>` : "";
    (channel as TextChannel).send({ content: content, embeds: [embed] });
}

function provera(argument: string, index: number): string {
    switch (index) {
        case 0: {
            return sanitize(argument);
        }
        case 1: {
            return validateGodina(argument);
        }

        case 2: {
            return validateSmer(argument);
        }

        case 3: {
            return validateGrupa(argument);
        }

        case 4: {
            return validateNumber(argument);
        }
    }

    return "";
}
