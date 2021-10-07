import { Grupa, Smer } from "@utils/Types";

export function splitArguments(argument: string, amount: number): string[] {
    const args = [];
    let element = "";
    let index = 0;

    while (index < argument.length) {
        if (args.length < amount - 1) {
            if (argument[index].match(/\s/)) {
                if (element.trim().length > 0) {
                    args.push(element.trim());
                }

                element = "";
            }
        }
        element += argument[index];
        index++;
    }

    if (element.trim().length > 0) {
        args.push(element.trim());
    }

    return args;
}


export function capitalizeWords(argument: string): string {
    return argument.split(" ").map(word => word[0].toUpperCase() + word.substr(1).toLowerCase()).join(" ");
}

export function sanitize(argument: string): string {
    return replaceCyrillic(argument).toLowerCase().replace("č", "c")
        .replace("ć", "c")
        .replace("š", "s")
        .replace("ž", "z")
        .replace("đ", "dj")
        .trim();
}

export function replaceCyrillic(argument: string): string {
    let result = "";
    for (const character of argument) {
        result += cyrillicsToLatin(character) ?? character;
    }

    return result;
}

export function validateSmer(argument: string): string {
    const result = sanitize(argument);
    if (Smer.includes(result.toLowerCase())) {
        return result.toUpperCase() === "S" ? "IT" : result.toUpperCase();
    }

    return "Грешка: Нисте правилно унели смер. Молимо Вас покушајте поново да се верификујете.";
}

export function validateGrupa(argument: string): string {
    if (argument === "-") {
        return argument;
    }

    if (Grupa.includes(argument.trim().toLowerCase())) {
        return argument;
    }

    return "Грешка: Нисте правилно унели групу. Молимо Вас покушајте поново да се верификујете.";
}

export function validateNumber(argument: string): string {
    if (argument === "-") {
        return argument;
    }

    const result = parseInt(sanitize(argument));
    if (!isNaN(result)) {
        return result.toString();
    }

    return "Грешка: Нисте правилно унели број. Молимо Вас покушајте поново да се верификујете.";
}

function cyrillicsToLatin(char: string): string | undefined {
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
