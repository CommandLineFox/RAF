import Command from "../../command/Command";
import type { CommandInteraction, TextChannel } from "discord.js";

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
        const message = interaction.options.get("message", true).value;
        if (!message) {
            interaction.reply({ content: "Дошло је до грешке при приступу поруци.", ephemeral: true });
            return;
        }
        const channel = interaction.channel as TextChannel;
        channel.send({ content: message.toString() });
        interaction.reply({ content: "Послато", ephemeral: true });
    }
}
