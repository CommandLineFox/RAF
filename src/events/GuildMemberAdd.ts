import Event from "@event/Event";
import BotClient from "~/BotClient";
import { GuildMember } from "discord.js";

export default class GuildMemberAdd extends Event {
    public constructor() {
        super({ name: "guildMemberAdd" });
    }

    public async callback(client: BotClient, member: GuildMember): Promise<void> {
        if (member.user.bot) {
            return;
        }

        await member.send("------------------------------------------------------------------------------------------------------------------");
        await member.send(client.config.welcome);
        await member.send("------------------------------------------------------------------------------------------------------------------");
    }
}
