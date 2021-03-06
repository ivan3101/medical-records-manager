import { Router } from "express";
import { AuthService } from "../../services/authService";
import { PersonalController } from "./personal.controller";

export class PersonalRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly personalController: PersonalController = new PersonalController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes() {
    this.router
      .get("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "read"),
        this.personalController.getAllPersonals)

      .post("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "create"),
        this.personalController.addPersonal)

      .get("/filter",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "read"),
        this.personalController.filterPersonal)

      .get("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "read"),
        this.personalController.getPersonalById)

      .patch("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "modify"),
        this.personalController.modifyPersonal)

      .delete("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("personal", "delete"),
        this.personalController.deletePersonal);

  }
}