# brainstorm: blaster sandbox adventure game

## Goal

Define an MVP for a sandbox/adventure game where the player lives in a city, survives daily E.V.O attacks, and progresses toward building a plane to track villains to their base and destroy it, then continues in post-victory sandbox mode or restarts.

## What I already know

* Player role: city citizen with two blasters (combat + item movement).
* World: city with random building generation and weighted building types/sizes.
* Economy start: player starts with $100.
* Always-available shop includes food, water, and weapons with spawn/availability weights.
* Daily loop: E.V.O villains attack city targets (rob stores, vandalize houses, low-to-moderate severity).
* Villains escape by helicopter; long-term objective is to build a plane over a long duration, follow them, destroy base, save city.
* Post-win loop: continue building in city or replay.
* Repo context: no existing game code or engine setup detected yet; currently planning requirements only.

## Assumptions (temporary)

* Initial implementation target is likely a single-player offline prototype.
* Building percentages provided are intended as relative spawn weights, not strict probability sums.
* "Long time to build plane" implies multi-day progression with gated resources/components.
* Daily attacks should create pressure but not hard-fail the run quickly.

## Open Questions

* None currently.

## Requirements (evolving)

* MVP scope is the core story arc, not only a survival sandbox slice.
* Initial implementation target is desktop-first.
* City generation uses a finite seeded map with fixed plot capacity per run.
* MVP fail states include both:
  * Resource-collapse fail (bankruptcy or critical food/water depletion).
  * City-damage fail (city destruction threshold exceeded from repeated attacks).
* Difficulty target is hard:
  * Tight resource economy and strong daily pressure.
  * Lower city-damage threshold to create high-stakes defense urgency.
* Two-blaster system with distinct mechanics:
  * Combat blaster for enemy interaction.
  * Utility blaster for moving/manipulating items.
* Procedural city generation that includes these building categories and plot sizes:
  * School (4 plots), skyscraper (1), house (1), storage place (3), amusement park (4+).
* Weighted appearance model for building types based on provided percentages.
* Building/shop percentage tables are interpreted as relative weights and normalized at runtime.
* Player starts each run with $100.
* City includes at least one guaranteed shop that can provide food, water, and weapons.
* Daily E.V.O attack event system that targets city entities and then triggers helicopter escape.
* Long-horizon progression system to build a plane over many in-game days.
* Final mission flow:
  * Track returning villains by plane.
  * Reach E.V.O base.
  * Destroy base.
  * Trigger city-saved outcome.
* Post-victory mode allows free sandbox continuation or replay/new run.
* MVP includes a terminal-playable interactive UI shell for the core loop.
* Terminal UI includes city summary viewing and shop inventory/purchase interactions.
* MVP includes a browser webpage UI for core actions and state display.

## Acceptance Criteria (evolving)

* [ ] New run starts with $100 and a functioning two-blaster loadout.
* [ ] City generation produces valid building footprints and includes all required building categories.
* [ ] Shop is always present and can provide required consumables/items.
* [ ] At least one E.V.O attack event occurs per in-game day and resolves with enemy escape behavior.
* [ ] Plane construction requires multi-step progression over multiple days before final mission unlocks.
* [ ] Final mission and post-victory options are reachable in normal play.
* [ ] The v1 build includes both the day-to-day city loop and end-to-end victory arc.
* [ ] A run ends if either sustained resource collapse occurs or city damage passes the defined threshold.
* [ ] Hard-mode tuning is reflected in economy rates and city-damage pacing.
* [ ] Terminal UI shell allows interactive turn-by-turn play of the MVP loop.
* [ ] Player can view city/shop details and buy food/water/weapons while the run is active.
* [ ] Webpage UI allows day progression, mission progression, and shop purchasing with visible state updates.

## Decision (ADR-lite)

**Context**: Early scoping needed to decide whether v1 should be a narrow survival prototype or include the full game objective loop.
**Decision**: v1 will include the core story arc (daily city loop + plane-building + final base-destruction mission).
**Consequences**: More systems are required in the first milestone, but design risk is reduced because the main fantasy and end-state are validated earlier.

**Context**: Platform target impacts engine choice, controls, packaging, and iteration speed.
**Decision**: Build the first implementation for desktop.
**Consequences**: Desktop APIs and packaging can be leveraged early, but browser-playable deployment is deferred.

**Context**: City topology determines content pacing, balancing, and save-state complexity.
**Decision**: Use a finite seeded city model for MVP.
**Consequences**: Progression balancing is simpler and more predictable, but unlimited expansion sandbox behavior is deferred.

**Context**: Failure design determines tension level and replay cadence.
**Decision**: Use both fail-state categories in MVP: resource-collapse and city-damage threshold.
**Consequences**: Core loop has meaningful stakes from both economy and defense, but balancing becomes more sensitive and must be tuned carefully.

**Context**: Difficulty target determines balancing defaults for progression and survivability.
**Decision**: MVP baseline is hard difficulty.
**Consequences**: Players face stronger failure risk and must optimize strategy early; onboarding/tutorial clarity becomes more important.

## Definition of Done (team quality bar)

* Tests added/updated (unit/integration where appropriate)
* Lint / typecheck / CI green
* Docs/notes updated if behavior changes
* Rollout/rollback considered if risky

## Out of Scope (explicit)

* Multiplayer and online persistence.
* High-fidelity graphics or cinematic cutscenes.
* Deep faction diplomacy/story branching in initial MVP.
* Complex city-level politics/simulation beyond the core loop.

## Technical Notes

* Inspected `README.md` (minimal, no stack guidance).
* Current repo appears to be Trellis scaffolding only; no game framework configured yet.
* Building percentage values in prompt exceed 100% total, so normalization/interpretation needs explicit rule.
* Normalization rule confirmed by user: treat percentages as relative weights, not literal absolute probabilities.
