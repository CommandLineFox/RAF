import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class NotificationSet extends Subcommand {
    public constructor() {
        super("set", "Podesi ulogu za notifikaciju uspesnog verifikovanja");
        this.data.addRoleOption(option =>
            option.setName("uloga")
                .setDescription("Izabrana uloga za verifikaciju")
                .setRequired(true)
        )
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

        const role = interaction.options.get("uloga", true).role;
        if (!role) {
            interaction.reply({ content: "Дошло је до грешке при приступу аргументу.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.notifications": role.id } });
        interaction.reply(`Uloga za notifikacije je postavljena na **${role.name}**.`);
    }
}
