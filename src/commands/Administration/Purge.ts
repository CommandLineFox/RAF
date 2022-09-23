import Command from "../../command/Command";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import type { BotClient } from "../../BotClient";

const search = ["101", "102", "103", "201", "202", "203", "204", "205", "301a", "301b", "302", "303", "304", "305", "306", "307", "308", "401", "402", "403", "404", "405", "406",
    "121", "122", "123", "124", "125", "126", "127", "128", "221", "222", "223", "321", "322", "323", "324", "421", "422", "423",
    "1d1", "1d2", "1d3", "1d4", "2d1", "2d2", "2d3", "2d4", "3d1", "3d2", "3d3", "3d4", "3d5", "4d1", "4d2",
    "1s1", "1s2", "1s3", "1s4", "2s1", "2s2", "2s3", "3s1", "3s2",
    "RN", "RI", "RD", "IT",
    "Prva godina", "Druga godina", "Treća godina", "Četvrta godina"
];

export default class Purge extends Command {
    public constructor() {
        super("purge", "Uklanjanje uloga sa svih clasnova", undefined, PermissionFlagsBits.Administrator);
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.guild || !interaction.isChatInputCommand()) {
            return;
        }

        const guild = interaction.guild;
        const guildDb = await client.database.getGuild(guild.id);
        if (!guildDb) {
            interaction.reply({ content: "Дошло је до грешке при приступу бази података, молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        if (!guildDb.config.roles?.verified) {
            interaction.reply({ content: "Дошло је до грешке при приступу бази података, молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        const verified = guild.roles.cache.get(guildDb.config.roles.verified);
        if (!verified) {
            interaction.reply({ content: "Дошло је до грешке при тражењу улоге за чланове, молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        const all = guild.roles.cache.get("759774306565226506");
        if (!all) {
            interaction.reply({ content: "Дошло је до грешке при тражењу улоге око соколово, молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        const members = await interaction.guild.members.fetch();

        await interaction.reply("Уклањам улоге са корисника...");

        for (const [_, member] of members) {
            interaction.deferReply();
            if (member.user.bot) {
                await interaction.editReply(`Прескачем ${member.user.tag} јер је бот.`);
                continue;
            }

            if (!member.manageable) {
                await interaction.editReply(`Прескачем ${member.user.tag} јер том кориснику не могу да приступим.`);
                continue;
            }

            const roles = [verified, all]
            const found = member.roles.cache.filter(role => search.includes(role.name)).toJSON();
            for (const role of found) {
                roles.push(role);
            }

            if (roles.length == 2) {
                await interaction.editReply(`Прескачем ${member.user.tag} јер нема ни једну улогу.`);
                continue;
            }

            await member.roles.remove(roles);
            await interaction.editReply(`Успешно уклоњене ${roles.length} улоге од ${member.user.tag}`);
            await sleep(5000);
        }

        interaction.reply("Готов.");
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
