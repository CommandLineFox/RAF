import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class NotificationSet extends Subcommand {
    public constructor() {
        super("set", "Podesi kanal za cuvanje verifikacija");
        this.data.addChannelOption(option =>
            option.setName("kanal")
                .setDescription("Izabran kanal za cuvanje verifikacija")
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

        const channel = interaction.options.getChannel("kanal", true);
        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.log": channel.id } });
        interaction.reply(`Kanal za logovanje je postavljen na <#${channel.id}>.`);
    }
}
