import * as fs from "fs";
import configTemplate from "~/Config";
import { generateConfig, getConfig } from "~/ConfigHandler";
import BotClient from "~/BotClient";
import { Database } from "@database/Database";

async function main() {
    const configFile = "config.json";

    if (!fs.existsSync(configFile)) {
        generateConfig(configFile, configTemplate);
        console.warn("Generated config");
        console.info("Please edit the config before restarting the bot");
        return;
    }

    const config = getConfig(configFile, configTemplate);

    if (!config) {
        console.warn("Failed to read config");
        console.info("Please use the above errors to fix your config before restarting the bot");
        return;
    }

    const database = new Database(config.db);
    await database.connect();
    const client = new BotClient(config, database, config.options);
    await client.login(config.token);
}

main().catch((error) => {
    console.log(error);
});
