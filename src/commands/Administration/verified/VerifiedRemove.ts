import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class VerifiedRemove extends Subcommand {
    public constructor() {
        super("remove", "Ukloni ulogu za verifikovane clanove");
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            interaction.reply({ content: "Дошло је до грешке при приступу бази података.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.verified": "" } });
        interaction.reply(`Улога за верификацију је уклоњена.`);
    }
}
