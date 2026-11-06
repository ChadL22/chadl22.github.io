import file from "../../content/game.json";
import { tidy } from "./content";

/** Names and messages shown in the dog game. Edit in Pages CMS or content/game.json. */
export interface GameText {
  labName: string;
  springerName: string;
  aussieName: string;
  squirrelName: string;
  duckName: string;
  title: string; // "{dog}" and "{quarry}" are filled in with the names above
  squirrelEscaped: string;
  duckEscaped: string;
  nextTurnTouch: string;
  nextTurnKeys: string;
  landHintTouch: string;
  landHintKeys: string;
  waterHintTouch: string;
  waterHintKeys: string;
  playPromptTouch: string;
  playPromptKeys: string;
}

// Used for any field left blank in the content file
const defaults: GameText = {
  labName: "Lab",
  springerName: "Springer",
  aussieName: "Aussie",
  squirrelName: "Squirrel",
  duckName: "Duck",
  title: "{dog} & {quarry}",
  squirrelEscaped: "The squirrel got away!",
  duckEscaped: "The duck got away!",
  nextTurnTouch: "Tap to give the next dog a turn",
  nextTurnKeys: "Space to give the next dog a turn · Esc to exit",
  landHintTouch: "Tap right to jump · tap left to crouch",
  landHintKeys: "Space or ↑ to jump · ↓ to crawl · Esc to exit",
  waterHintTouch: "Underwater! Tap right to swim up · tap left to dive",
  waterHintKeys: "Underwater! Space or ↑ to swim up · ↓ to dive",
  playPromptTouch: "Tap the dogs to play",
  playPromptKeys: "Press Space to play",
};

export const gameText: GameText = { ...defaults, ...(tidy(file) as Partial<GameText>) };
