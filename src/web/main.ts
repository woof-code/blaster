import { type BuildingType, type GameState, type ShopItemKind } from "../domain/models.js";
import {
  applyPostVictoryChoice,
  buyFromMainShop,
  createNewRun,
  runFinalMissionStep,
  simulateDay
} from "../systems/game.js";
import "./styles.css";

const app = document.getElementById("app");
if (!app) {
  throw new Error("App root not found");
}
const appRoot: HTMLElement = app;

let state = createNewRun("web-seed");

function countBuildings(buildings: GameState["city"]["buildings"]): Record<BuildingType, number> {
  const counts: Record<BuildingType, number> = {
    house: 0,
    skyscraper: 0,
    storage: 0,
    school: 0,
    amusement_park: 0
  };
  for (const building of buildings) {
    counts[building.type] += 1;
  }
  return counts;
}

function buyItem(kind: ShopItemKind): void {
  const result = buyFromMainShop(state, kind, 1);
  render(result.message);
}

function onAdvanceDay(): void {
  simulateDay(state);
  const attack = state.latestAttack;
  if (!attack) {
    render("Day advanced.");
    return;
  }
  render(
    `Day ${attack.day}: E.V.O attacked ${attack.targetKind}, severity ${attack.severity}. Helicopter escaped=${attack.helicopterEscaped}.`
  );
}

function onMissionStep(): void {
  runFinalMissionStep(state);
  render(`Mission progressed. Plane phase is now ${state.plane.phase}.`);
}

function onContinue(): void {
  state = applyPostVictoryChoice(state, "continue_sandbox");
  render("Continuing sandbox mode.");
}

function onRestart(): void {
  state = createNewRun("web-seed-restart");
  render("Run restarted.");
}

function render(message = "Welcome to Blaster Web UI."): void {
  const counts = countBuildings(state.city.buildings);
  const shop = state.city.shops[0];
  const disableActions = state.status !== "active";
  const missionDisabled = disableActions || state.plane.phase === "collecting_parts" || state.plane.phase === "assembling";

  const shopItems =
    shop?.inventory
      .slice()
      .sort((a, b) => a.kind.localeCompare(b.kind))
      .map(
        (item) => `
        <div class="shop-item">
          <div>${item.kind} - stock ${item.stock} - $${item.price}</div>
          <button data-buy="${item.kind}" ${disableActions ? "disabled" : ""}>Buy 1</button>
        </div>
      `
      )
      .join("") ?? "<div>No shop available.</div>";

  appRoot.innerHTML = `
    <aside class="panel">
      <h1>Blaster Web UI</h1>
      <div class="stats">
        <div>Day: <strong>${state.day}</strong></div>
        <div>Status: <strong>${state.status}${state.failReason ? ` (${state.failReason})` : ""}</strong></div>
        <div>Money: <strong>$${state.resources.money}</strong></div>
        <div>Food: <strong>${state.resources.food}</strong></div>
        <div>Water: <strong>${state.resources.water}</strong></div>
        <div>Spare weapons: <strong>${state.inventory.spareWeapons}</strong></div>
        <div>City damage: <strong>${state.city.damage}</strong></div>
        <div>Plane: <strong>${state.plane.phase}</strong></div>
      </div>
      <div class="controls">
        <button id="advanceDay" ${disableActions ? "disabled" : ""}>Advance Day</button>
        <button id="missionStep" ${missionDisabled ? "disabled" : ""}>Mission Step</button>
        <button id="continueRun" ${state.status === "city_saved" ? "" : "disabled"}>Continue Sandbox</button>
        <button id="restartRun">Restart</button>
      </div>
      <div class="log">${message}</div>
    </aside>
    <main class="world">
      <section class="character-card">
        <div class="character">
          <div class="character-head"></div>
          <div class="character-body">
            <div class="blaster left"></div>
            <div class="blaster right"></div>
          </div>
        </div>
      </section>
      <section class="city-grid">
        <h2>City Overview</h2>
        <div class="blocks">
          <div class="block">plots ${state.city.usedPlots}/${state.city.maxPlots}</div>
          <div class="block">house ${counts.house}</div>
          <div class="block">skyscraper ${counts.skyscraper}</div>
          <div class="block">storage ${counts.storage}</div>
          <div class="block">school ${counts.school}</div>
          <div class="block">amusement park ${counts.amusement_park}</div>
        </div>
      </section>
      <section class="shop-card">
        <h2>Shop</h2>
        ${shopItems}
      </section>
    </main>
  `;

  document.getElementById("advanceDay")?.addEventListener("click", onAdvanceDay);
  document.getElementById("missionStep")?.addEventListener("click", onMissionStep);
  document.getElementById("continueRun")?.addEventListener("click", onContinue);
  document.getElementById("restartRun")?.addEventListener("click", onRestart);

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-buy]")) {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-buy");
      if (value === "food" || value === "water" || value === "weapon") {
        buyItem(value);
      }
    });
  }
}

render();
