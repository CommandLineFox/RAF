import Command from "../../command/Command";
import type { CommandInteraction } from "discord.js";

export default class Echo extends Command {
    public constructor() {
        super("echo", "Ponavlja poruku xd");
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        interaction.reply("Pong xd");
    }
}
