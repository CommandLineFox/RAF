import Event from "@event/Event";
import BotClient from "~/BotClient";
import { Message } from "discord.js";

export default class MessageEvent extends Event {
    public constructor() {
        super({ name: "message" });
    }

    public async callback(_client: BotClient, message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }
        
        
    }
}
