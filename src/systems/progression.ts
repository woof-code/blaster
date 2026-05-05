import type { PlaneProgress } from "../domain/models.js";

export const PLANE_PARTS_TO_ASSEMBLE = 12;
export const PLANE_ASSEMBLY_TO_READY = 20;

export function advancePlaneProgress(
  plane: PlaneProgress,
  dailyPartGain: number
): PlaneProgress {
  if (plane.phase === "base_destroyed") {
    return plane;
  }

  const nextPoints = plane.partPoints + dailyPartGain;

  if (plane.phase === "collecting_parts" && nextPoints >= PLANE_PARTS_TO_ASSEMBLE) {
    return {
      phase: "assembling",
      partPoints: nextPoints
    };
  }

  if (plane.phase === "assembling" && nextPoints >= PLANE_ASSEMBLY_TO_READY) {
    return {
      phase: "ready_to_launch",
      partPoints: nextPoints
    };
  }

  return {
    phase: plane.phase,
    partPoints: nextPoints
  };
}

export function progressFinalMission(plane: PlaneProgress): PlaneProgress {
  switch (plane.phase) {
    case "ready_to_launch":
      return { ...plane, phase: "tracking_villains" };
    case "tracking_villains":
      return { ...plane, phase: "at_base" };
    case "at_base":
      return { ...plane, phase: "base_destroyed" };
    default:
      return plane;
  }
}
