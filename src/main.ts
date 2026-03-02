import { GameController } from "@/controller/GameController";
import "./style.css";

/**
 * Application entry point.
 */
const bootstrap = async (): Promise<void> => {
  const controller: GameController = new GameController();
  await controller.start();
};

document.addEventListener("DOMContentLoaded", async () => await bootstrap());
