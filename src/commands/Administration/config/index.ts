import Command from "../../../command/Command";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";

export default class Config extends Command {
    public constructor() {
        super("config", "Izbor podesavanja bota", [], ["ADMINISTRATOR"]);
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        const subcommand = this.subcommands.get(interaction.options.getSubcommand());
        if (!subcommand) {
            interaction.reply({ content: "Није било могуће пронаћи подкоманду.", ephemeral: true });
            return;
        }

        subcommand.execute(interaction, client);
    }
}
