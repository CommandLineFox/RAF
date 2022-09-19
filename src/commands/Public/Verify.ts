import Command from "../../command/Command";
import { CommandInteraction, EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import type { BotClient } from "../../BotClient";

const groups = ["101", "102", "103", "201", "202", "203", "204", "205", "301a", "301b", "302", "303", "304", "305", "306", "307", "308", "401", "402", "403", "404", "405", "406",
    "121", "122", "123", "124", "125", "126", "127", "128", "221", "222", "223", "321", "322", "323", "324", "421", "422", "423",
    "1d1", "1d2", "1d3", "1d4", "2d1", "2d2", "2d3", "2d4", "3d1", "3d2", "3d3", "3d4", "3d5", "4d1", "4d2",
    "1s1", "1s2", "1s3", "1s4", "2s1", "2s2", "2s3", "3s1", "3s2"];

export default class Verify extends Command {
    public constructor() {
        super("verify", "Verifikacija u server", undefined, undefined);
        this.data.addStringOption(option =>
            option.setName("ime")
                .setDescription("Vase ime")
                .setRequired(true)
        )
        this.data.addStringOption(option =>
            option.setName("prezime")
                .setDescription("Vase prezime")
                .setRequired(true)
        )
        this.data.addStringOption(option =>
            option.setName("smer")
                .setDescription("Vas smer")
                .setRequired(true)
                .addChoices({ name: "RN", value: "RN" },
                    { name: "RI", value: "RI" },
                    { name: "RD", value: "RD" },
                    { name: "IT", value: "IT" }
                )
        )
        this.data.addStringOption(option =>
            option.setName("godina")
                .setDescription("Vasa godina studija")
                .addChoices({ name: "Prva godina", value: "Prva godina" },
                    { name: "Druga godina", value: "Druga godina" },
                    { name: "Treća godina", value: "Treća godina" },
                    { name: "Četvrta godina", value: "Četvrta godina" }
                )
        )
        this.data.addNumberOption(option =>
            option.setName("grupa")
                .setDescription("Izbor grupe")
        )
        this.data.addNumberOption(option =>
            option.setName("broj")
                .setDescription("Broj na spisku studenata")
                .setMinValue(1)
                .setMaxValue(3000)
        )
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

        const member = interaction.member as GuildMember;
        if (!member.manageable) {
            interaction.reply({ content: "Не могу да променим Ваше улоге.", ephemeral: true });
            return;
        }

        let ponovac = false;
        const ime = interaction.options.getString("ime", true);
        const prezime = interaction.options.getString("prezime", true);

        member.setNickname(ime + " " + prezime);

        const smer = interaction.options.getString("smer", true);
        const roleSmer = guild.roles.cache.find(role => role.name === smer);
        if (!roleSmer) {
            interaction.reply({ content: "Дошло је до грешке при тражењу улоге за смер, молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        member.roles.add(roleSmer);

        const godina = interaction.options.getString("godina")
        if (!godina) {
            ponovac = true;
        } else {
            const roleGodina = guild.roles.cache.find(role => role.name === godina);
            if (!roleGodina) {
                interaction.reply({ content: "Дошло је до грешке при тражењу улоге за годину, молимо Вас контактирајте администратора.", ephemeral: true });
                return;
            }

            member.roles.add(roleGodina);
        }

        const grupa = interaction.options.getNumber("grupa");
        if (!grupa) {
            ponovac = true;

        } else if (!ponovac) {
            if (!groups.includes(grupa.toString())) {
                interaction.reply({ content: "Унета група не постоји, молимо Вас покушајте поново, уколико је ово грешка контактирајте администратора.", ephemeral: true });
                return;
            }

            const roleGrupa = guild.roles.cache.find(role => role.name === grupa?.toString());
            if (!roleGrupa) {
                interaction.reply({ content: "Дошло је до грешке при тражењу улоге за групу, молимо Вас контактирајте администратора.", ephemeral: true });
                return;
            }

            member.roles.add(roleGrupa);
        }

        const broj = interaction.options.getNumber("broj");
        if (!broj) {
            ponovac = true;
        }

        member.roles.add(verified);

        if (!guildDb?.config.channels?.log) {
            interaction.reply({ content: "Дошло је до грешке при логовању. Молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        const channel = guild.channels.cache.get(guildDb.config.channels.log);
        if (!channel) {
            interaction.reply({ content: "Дошло је до грешке при логовању. Молимо Вас контактирајте администратора.", ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Нови верификовани корисник")
            .addFields({ name: "Discord налог:", value: `${member.user.tag} (${member.id})` },
                { name: "Име и презиме:", value: ime + " " + prezime },
                { name: "Смер:", value: smer },
                { name: "Година:", value: godina ?? "-" },
                { name: "Група:", value: `${grupa ?? "-"}` },
                { name: "Број на сајту:", value: `${broj ?? "-"}` }
            )

        if (ponovac) {
            embed.addFields({ name: "Поновац:", value: "Ponovac" });
        }

        let role;
        if (guildDb.config.roles?.notifications) {
            role = guild.roles.cache.get(guildDb.config.roles?.notifications);
        }

        const content = role ? `<@&${role.id}>` : "";
        (channel as TextChannel).send({ content: content, embeds: [embed] });
        interaction.reply({ content: "Успешно сте се верификовали", ephemeral: true });
    }
}
