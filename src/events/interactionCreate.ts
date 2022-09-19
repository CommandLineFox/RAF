import type { CommandInteraction, Interaction } from "discord.js";
import type { BotClient } from "../BotClient";
import type Command from "../command/Command";
import Event from "../event/Event";

export default class InteractionCreate extends Event {
    public constructor() {
        super("interactionCreate");
    }

    public async callback(client: BotClient, interaction: Interaction): Promise<void> {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return;
            }

            if (!hasUserPermission(command, interaction)) {
                interaction.reply({ content: "You're not allowed to execute this command", ephemeral: true });
                return;
            }
            if (!hasBotPermission(command, interaction)) {
                interaction.reply({ content: "I'm not allowed to execute this command", ephemeral: true });
            }
            try {
                command.execute(interaction, client);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}

function hasUserPermission(command: Command, interaction: CommandInteraction): boolean {
    if (!command.userPermissions) {
        return true;
    }

    if (!interaction.memberPermissions) {
        return false;
    }

    return interaction.memberPermissions.has(command.userPermissions);
}

function hasBotPermission(command: Command, interaction: CommandInteraction): boolean {
    if (!command.botPermissions) {
        return true;
    }

    if (!interaction.guild?.members.me?.permissions) {
        return false;
    }

    return interaction.guild.members.me.permissions.has(command.botPermissions);
}
