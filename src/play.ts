import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  buyFromMainShop,
  applyPostVictoryChoice,
  createNewRun,
  runFinalMissionStep,
  simulateDay
} from "./systems/game.js";
import {
  canAttemptFinalMission,
  formatCitySummaryLines,
  formatShopLines,
  formatStateLines,
  parseActiveCommand,
  parseBuyCommand,
  parseFailedCommand,
  parseVictoryCommand
} from "./ui/playHelpers.js";

interface PlayOptions {
  seed: string;
}

function parseArgs(argv: string[]): PlayOptions {
  const options: PlayOptions = { seed: "blaster-seed" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextArg = argv[index + 1];
    if (arg === "--seed" && typeof nextArg === "string") {
      options.seed = nextArg;
      index += 1;
    }
  }
  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const rl = readline.createInterface({ input, output });

  let state = createNewRun(options.seed);
  let playing = true;

  console.log("Blaster Sandbox Adventure - Interactive Terminal");
  console.log(`Seed: ${options.seed}`);

  while (playing) {
    console.log("");
    for (const line of formatStateLines(state)) {
      console.log(line);
    }

    if (state.status === "failed") {
      const answer = await rl.question("Run failed. [r]estart or [q]uit? ");
      const command = parseFailedCommand(answer);
      if (command === "restart_run") {
        state = createNewRun(options.seed);
        continue;
      }
      playing = false;
      continue;
    }

    if (state.status === "city_saved") {
      const answer = await rl.question(
        "City saved. [c]ontinue sandbox, [r]estart, or [q]uit? "
      );
      const command = parseVictoryCommand(answer);
      if (command === "continue_sandbox" || command === "restart_run") {
        state = applyPostVictoryChoice(state, command);
        continue;
      }
      playing = false;
      continue;
    }

    const answer = await rl.question(
      "Choose action: [a]dvance day, [m]ission step, [s]tatus, [c]ity, [shop], [b]uy, [q]uit: "
    );
    const command = parseActiveCommand(answer);

    if (command === "advance_day") {
      simulateDay(state);
      continue;
    }

    if (command === "mission_step") {
      if (!canAttemptFinalMission(state)) {
        console.log("Final mission step unavailable until plane is ready.");
        continue;
      }
      runFinalMissionStep(state);
      continue;
    }

    if (command === "status") {
      continue;
    }

    if (command === "city_view") {
      for (const line of formatCitySummaryLines(state)) {
        console.log(line);
      }
      continue;
    }

    if (command === "shop_view") {
      console.log("Shop inventory:");
      for (const line of formatShopLines(state)) {
        console.log(line);
      }
      continue;
    }

    if (command === "shop_buy") {
      const buyInput = await rl.question("Buy format: buy <food|water|weapon> [quantity]: ");
      const buyCommand = parseBuyCommand(buyInput);
      if (!buyCommand) {
        console.log("Invalid buy command.");
        continue;
      }
      const result = buyFromMainShop(state, buyCommand.kind, buyCommand.quantity);
      console.log(result.message);
      continue;
    }

    if (command === "quit") {
      playing = false;
      continue;
    }

    console.log("Unknown command. Please choose one of the listed options.");
  }

  rl.close();
}

void main();
