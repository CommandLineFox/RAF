import Event from "@event/Event";
import { GuildMember, Interaction } from "discord.js";
import BotClient from "~/BotClient";
import { sanitize } from "~/utils/Utils";

export default class interactionCreate extends Event {
    public constructor() {
        super({ name: "interactionCreate" });
    }

    public async callback(_client: BotClient, interaction: Interaction): Promise<void> {
        if (!interaction.isSelectMenu()) {
            return;
        }
        
        for (const value of interaction.values) {
            const role = interaction.guild?.roles.cache.find((role) => sanitize(role.name) === value);
            if (!role) {
                return;
            }

            const member = interaction.member;
            await (member as GuildMember).roles.add(role);
        }

        await interaction.deferUpdate();
    }
}
