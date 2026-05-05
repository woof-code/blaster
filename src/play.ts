import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  applyPostVictoryChoice,
  createNewRun,
  runFinalMissionStep,
  simulateDay
} from "./systems/game.js";
import {
  canAttemptFinalMission,
  formatStateLines,
  parseActiveCommand,
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
      "Choose action: [a]dvance day, [m]ission step, [s]tatus, [q]uit: "
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

    if (command === "quit") {
      playing = false;
      continue;
    }

    console.log("Unknown command. Please choose one of the listed options.");
  }

  rl.close();
}

void main();
