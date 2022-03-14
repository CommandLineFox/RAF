import Command from "../../command/Command";
import { CommandInteraction, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import type { BotClient } from "../../BotClient";

const groups = ["101", "102", "103", "120", "121", "122", "123", "124", "125", "1d1", "1d2", "1d3", "1d4", "1d5", "1d6", "1s1", "1s2", "1s3", "1s4", "201", "202", "203", "204", "205", "220", "221", "2d1", "2d2", "2d3", "2d4", "2d5", "2d6", "2s1", "2s2", "301a", "301b", "302", "303", "304", "305", "306", "307", "320", "321", "322", "323", "324", "3d1", "3d2", "3s1", "3s2", "401", "402", "403", "404", "405", "406", "407", "408", "409", "420", "421", "422", "423", "4d1", "4d2", "4d3", "4d4", "4d5", "4d6", "4d7"];

export default class Verify extends Command {
    public constructor() {
        super("verify", "Verifikacija u server");
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
                .addChoice("RN", "RN")
                .addChoice("RI", "RI")
                .addChoice("RD", "RD")
                .addChoice("IT", "IT")
        )
        this.data.addStringOption(option =>
            option.setName("godina")
                .setDescription("Vasa godina studija")
                .addChoice("Prva godina", "Prva godina")
                .addChoice("Druga godina", "Druga godina")
                .addChoice("Treca godina", "Treća godina")
                .addChoice("Cetvrta godina", "Četvrta godina")
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
        const guild = interaction.guild;
        if (!guild) {
            interaction.deferReply();
            return;
        }
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

        const godina = interaction.options.getString("godina");
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
            const stringGrupa = grupa.toString();
            if (!groups.includes(stringGrupa)) {
                interaction.reply({ content: "Унета група не постоји, молимо Вас покушајте поново, уколико је ово грешка контактирајте администратора.", ephemeral: true });
                return;
            }

            const roleGrupa = guild.roles.cache.find(role => role.name === stringGrupa);
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
            interaction.deferReply();
            return;
        }

        const channel = guild.channels.cache.get(guildDb.config.channels.log);
        if (!channel) {
            interaction.deferReply();
            return;
        }

        const embed = new MessageEmbed()
            .setTitle("Нови верификовани корисник")
            .addField("Discord налог:", `${member.user.tag} (${member.id})`)
            .addField("Име и презиме:", ime + " " + prezime)
            .addField("Смер:", smer)
            .addField("Година:", godina ?? "-")
            .addField("Група:", `${grupa ?? "-"}`)
            .addField("Број на сајту:", `${broj ?? "-"}`);

        if (ponovac) {
            embed.addField("Поновац:", "Ponovac");
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
