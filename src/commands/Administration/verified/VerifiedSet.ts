import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class VerifiedSet extends Subcommand {
    public constructor() {
        super("set", "Podesi ulogu za verifikovane clanove");
        this.data.addRoleOption(option =>
            option.setName("uloga")
                .setDescription("Izabrana uloga za verifikaciju")
                .setRequired(true)
        )
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.guild || !interaction.isChatInputCommand()) {
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            interaction.reply({ content: "Дошло је до грешке при приступу бази података.", ephemeral: true });
            return;
        }

        const role = interaction.options.get("uloga", true).role;
        if (!role) {
            interaction.reply({ content: "Дошло је до грешке при приступу аргументу.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.verified": role.id } });
        interaction.reply(`Uloga za verifikaciju je postavljena na **${role.name}**.`);
    }
}
