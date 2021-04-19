import Command from "@command/Command";
import { Public } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Grupa, Smer } from "@utils/Types";
import { Role } from "discord.js";

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
                    await message.channel.awaitMessages(msg => msg.author === member.user, { max: 1, time: 120000, errors: ["time"], })
                        .then((response) => {
                            const odgovor = response.first()!.content;

                            const proveren = provera(odgovor, i);
                            if (proveren.startsWith("Грешка:")) {
                                greska = true;
                                member.user.send(proveren);
                                return;
                            }

                            odgovori.push(proveren);
                        })
                        .catch(() => {
                            member.user.send("Прошло је 2 минута. Молимо Вас пријавите се поново.");
                        });
                });
        }

        addRoles(event, odgovori, role);
        member.user.send("Успешно сте се верификовали. Уколико постоји нека грешка, молимо Вас контактирајте модератора или администратора сервера.");
    }
}

function addRoles(event: CommandEvent, odgovori: string[], role: Role) {
    const member = event.member;

    for (let i = 0; i < odgovori.length; i++) {
        switch (i) {
            case 0: {
                member.setNickname(CapitalizeWords(odgovori[0]));
                break;
            }

            case 1:
            case 2:
            case 3: {
                const role = event.guild.roles.cache.find(role => role.name === odgovori[i]);
                if (!role) {
                    member.user.send("Дошло је до грешке при тражењу улоге. Молимо Вас контактирајте администратора.");
                    return;
                }

                member.roles.add(role);
            }
        }
    }

    member.roles.add(role);
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

function CapitalizeWords(argument: string): string {
    return argument.split(" ").map(word => word[0].toUpperCase() + word.substr(1).toLowerCase()).join(" ");
}

function sanitize(argument: string): string {
    return replaceCyrillic(argument).replace("č", "c")
        .replace("ć", "c")
        .replace("š", "s")
        .replace("ž", "z")
        .replace("đ", "dj")
        .toLowerCase()
        .trim();
}


function replaceCyrillic(argument: string): string {
    let result = "";
    for (const character of argument) {
        result += CyrillicsToLathin(character) ?? character;
    }

    return result;
}

function validateGodina(argument: string): string {
    let godina = replaceCyrillic(argument);

    if (godina.endsWith(".")) {
        godina = sanitize(godina.slice(-1));
    }

    switch (godina) {
        case "1":
        case "prva":
        case "I": {
            return "Prva godina";
        }

        case "2":
        case "druga":
        case "II": {
            return "Druga godina";
        }

        case "3":
        case "treca":
        case "III": {
            return "Treca godina";
        }

        case "4":
        case "cetvrta":
        case "IV": {
            return "Cetvrta godina";
        }
    }

    return "Грешка: Нисте правилно унели годину. Молимо Вас покушајте поново да се верификујете.";
}

function validateSmer(argument: string): string {
    const result = sanitize(argument);
    if (Smer.includes(result.toLowerCase())) {
        return result.toUpperCase();
    }

    return "Грешка: Нисте правилно унели смер. Молимо Вас покушајте поново да се верификујете.";
}

function validateGrupa(argument: string): string {
    if (Grupa.includes(argument)) {
        return argument;
    }

    return "Грешка: Нисте правилно унели групу. Молимо Вас покушајте поново да се верификујете.";
}

function validateNumber(argument: string): string {
    const result = parseInt(sanitize(argument));
    if (!isNaN(result)) {
        return result.toString();
    }

    return "Грешка: Нисте правилно унели број. Молимо Вас покушајте поново да се верификујете.";
}

function CyrillicsToLathin(char: string): string | undefined {
    switch (char) {
        case "а": return "a";
        case "б": return "b";
        case "ц": return "c";
        case "д": return "d";
        case "е": return "e";
        case "ф": return "f";
        case "г": return "g";
        case "х": return "h";
        case "и": return "i";
        case "ј": return "j";
        case "к": return "k";
        case "л": return "l";
        case "м": return "m";
        case "н": return "n";
        case "о": return "o";
        case "п": return "p";
        case "р": return "r";
        case "с": return "s";
        case "т": return "t";
        case "у": return "u";
        case "в": return "v";
        case "з": return "z";

        case "А": return "A";
        case "Б": return "B";
        case "Ц": return "C";
        case "Д": return "D";
        case "Е": return "E";
        case "Ф": return "F";
        case "Г": return "G";
        case "Х": return "H";
        case "И": return "I";
        case "Ј": return "J";
        case "К": return "K";
        case "Л": return "L";
        case "М": return "M";
        case "Н": return "N";
        case "О": return "O";
        case "П": return "P";
        case "Р": return "R";
        case "С": return "S";
        case "Т": return "T";
        case "У": return "U";
        case "В": return "V";
        case "З": return "Z";

        case "ч": return "č";
        case "ћ": return "ć";
        case "ж": return "ž";
        case "ш": return "š";
        case "љ": return "lj";
        case "њ": return "nj";
        case "ђ": return "đ";
        case "џ": return "dž";

        case "Ч": return "Č";
        case "Ћ": return "Ć";
        case "Ж": return "Ž";
        case "Ш": return "Š";
        case "Љ": return "Lj";
        case "Њ": return "Nj";
        case "Ђ": return "Đ";
        case "Џ": return "Dž";
    }

    return;
}
