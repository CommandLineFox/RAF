import Command from "../../../command/Command";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import { PermissionFlagsBits } from "discord-api-types/v10";

export default class Config extends Command {
    public constructor() {
        super("config", "Izbor podesavanja bota", undefined, PermissionFlagsBits.Administrator);
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const group = interaction.options.getSubcommandGroup() ?? "";
        const subcommand = this.subcommands.get(this.data.name + " " + group + " " + interaction.options.getSubcommand()) ?? this.subcommands.get(this.data.name + " " + interaction.options.getSubcommand());
        if (!subcommand) {
            interaction.reply({ content: "I was unable to find the command.", ephemeral: true });
            return;
        }

        subcommand.execute(interaction, client);
    }
}
