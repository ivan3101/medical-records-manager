import { Router } from "express";
import { AuthService } from "../../services/authService";
import { OnHoldController } from "./onHold.controller";

export class OnHoldRoutes {
  private readonly router = Router();
  private readonly authService: AuthService = new AuthService();
  private readonly onHoldController: OnHoldController = new OnHoldController();

  constructor() {
    this.initRoutes();
  }

  public get Router() {
    return this.router;
  }

  private initRoutes(): void {
    this.router
      .get("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read"),        this.onHoldController.getAllOnHolds)

      .post("/",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "create"),
        this.onHoldController.createOnHold)

      .get("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read"),
        this.onHoldController.getOnHoldById)

      .delete("/:id",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "delete"),
        this.onHoldController.deleteOnHold)

      .get("/student/:studentId/onhold",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read yours"),
        this.onHoldController.getOnHoldsByStudent)

      .get("/student/:studentId/onhold/:onholdId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read yours"),
        this.onHoldController.getOnHoldByStudent)

      .patch("/student/:studentId/onhold/:onholdId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "modify"),
        this.onHoldController.modifyOnHold)

      .get("/professor/:professorId/onhold",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read on hold"),
        this.onHoldController.getOnHoldsByProfessor)

      .get("/professor/:professorId/onhold/:onholdId",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "read on hold"),
        this.onHoldController.getOnHoldByProfessor)

      .patch("/professor/:professoId/onhold/:onholdId/approve/new",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "change status"),
        this.onHoldController.approveOnHoldNew)

      .patch("/professor/:professoId/onhold/:onholdId/approve/mod",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "change status"),
        this.onHoldController.approveOnHoldMod)

      .patch("/professor/:professorId/onhold/:onholdId/reject",
        this.authService.isAuthorized(),
        this.authService.hasPermission("onHold", "change status"),
        this.onHoldController.rejectOnHold)
  }
}