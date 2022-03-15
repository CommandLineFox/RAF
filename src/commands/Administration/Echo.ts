import Command from "../../command/Command";
import type { CommandInteraction } from "discord.js";

export default class Echo extends Command {
    public constructor() {
        super("echo", "Ponavlja poruku xd");
        this.data.addStringOption(option =>
            option.setName("message")
                .setDescription("Message for repeating")
                .setRequired(true)
        )
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        const message = interaction.options.getString("message", true);
        interaction.channel?.send(message);
        interaction.reply({ content: "Послато", ephemeral: true });
    }
}
