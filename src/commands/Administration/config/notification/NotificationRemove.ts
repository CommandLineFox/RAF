import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class NotificationRemove extends Subcommand {
    public constructor() {
        super("remove", "Ukloni ulogu za notifikaciju uspesnog verifikovanja");
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

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.notifications": "" } });
        interaction.reply(`Uloga za notifikacije je uklonjena.`);
    }
}
