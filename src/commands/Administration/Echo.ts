import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class Echo extends Command {
    public constructor() {
        super({
            name: "Echo",
            triggers: ["echo", "say"],
            description: "Понавља поруку",
            group: Administration
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            await event.message.delete();
            await event.send(event.argument);
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}
