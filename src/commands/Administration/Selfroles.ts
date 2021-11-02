import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageActionRow, MessageSelectMenu } from "discord.js";

export default class Config extends Command {
    public constructor() {
        super({
            name: "Selfroles",
            triggers: ["sr", "selfroles", "rr", "reactionroles"],
            description: "Слање поруке за бирање улога",
            group: Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }

    protected async run(event: CommandEvent): Promise<void> {
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId("select")
                    .setPlaceholder("Изаберите улоге за мејл листу")
                    .setMinValues(0)
                    .setMaxValues(4)
                    .addOptions([
                        {
                            label: "Прва година",
                            description: "Приступ каналу у којем се шаљу мејлови за прву годину",
                            value: "prva godina",
                        },
                        {
                            label: "Друга година",
                            description: "Приступ каналу у којем се шаљу мејлови за другу годину",
                            value: "druga godina",
                        },
                        {
                            label: "Трећа година",
                            description: "Приступ каналу у којем се шаљу мејлови за трећу годину",
                            value: "treca godina",
                        },
                        {
                            label: "Четврта година",
                            description: "Приступ каналу у којем се шаљу мејлови за четврту годину",
                            value: "cetvrta godina",
                        },
                    ])
            );
        event.send("lol", { components: [row] });
    }
}
