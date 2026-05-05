import {
  applyPostVictoryChoice,
  createNewRun,
  runFinalMissionStep,
  simulateDay
} from "./systems/game.js";

interface CliOptions {
  seed: string;
  maxDays: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    seed: "blaster-seed",
    maxDays: 60
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextArg = argv[index + 1];
    if (arg === "--seed" && typeof nextArg === "string") {
      options.seed = nextArg;
      index += 1;
      continue;
    }

    if (arg === "--days" && typeof nextArg === "string") {
      const parsed = Number.parseInt(nextArg, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        options.maxDays = parsed;
      }
      index += 1;
    }
  }

  return options;
}

function printState(dayLabel: string, stateSummary: string): void {
  console.log(`[${dayLabel}] ${stateSummary}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const state = createNewRun(options.seed);

  console.log("Blaster MVP simulation");
  console.log(`Seed: ${options.seed}`);
  console.log(`Max days: ${options.maxDays}`);
  console.log("");
  printState(
    "start",
    `money=${state.resources.money}, food=${state.resources.food}, water=${state.resources.water}, plane=${state.plane.phase}`
  );

  for (let day = 0; day < options.maxDays; day += 1) {
    simulateDay(state);
    printState(
      `day ${state.day - 1}`,
      `status=${state.status}, money=${state.resources.money}, food=${state.resources.food}, water=${state.resources.water}, cityDamage=${state.city.damage}, plane=${state.plane.phase}`
    );

    if (state.status !== "active") {
      break;
    }

    if (state.plane.phase === "ready_to_launch") {
      runFinalMissionStep(state);
      runFinalMissionStep(state);
      runFinalMissionStep(state);
      printState("final mission", `plane=${state.plane.phase}, status=${state.status}`);
      break;
    }
  }

  if (state.status === "city_saved") {
    const sandbox = applyPostVictoryChoice(state, "continue_sandbox");
    printState("post-victory", `choice=continue_sandbox, status=${sandbox.status}`);
  } else if (state.status === "failed") {
    printState("run ended", `failReason=${state.failReason ?? "unknown"}`);
  } else {
    printState("run ended", "max days reached without terminal state");
  }
}

main();
