import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  getAllRaces, getRace, createRace, updateRace, deleteRace,
  getEntriesByRace, createRaceEntry, updateRaceEntry, deleteRaceEntry,
  getAllNotifications, createNotification, deleteNotification,
  getAllContactMessages, createContactMessage, markMessageRead, deleteContactMessage,
  getAdmin, seedAdmin,
} from "./storage";

function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
  const [username, password] = decoded.split(":");
  getAdmin(username).then((admin) => {
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    next();
  }).catch(() => res.status(500).json({ message: "Erro interno" }));
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedAdmin();

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const admin = await getAdmin(username);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    res.json({ success: true, username: admin.username });
  });

  app.get("/api/races", async (_req: Request, res: Response) => {
    const allRaces = await getAllRaces();
    const racesWithEntries = await Promise.all(
      allRaces.map(async (race) => {
        const entries = await getEntriesByRace(race.id);
        return { ...race, entries };
      })
    );
    res.json(racesWithEntries);
  });

  app.get("/api/races/:id", async (req: Request, res: Response) => {
    const race = await getRace(req.params.id);
    if (!race) return res.status(404).json({ message: "Prova não encontrada" });
    const entries = await getEntriesByRace(race.id);
    res.json({ ...race, entries });
  });

  app.post("/api/races", requireAdmin, async (req: Request, res: Response) => {
    const race = await createRace(req.body);
    res.status(201).json(race);
  });

  app.put("/api/races/:id", requireAdmin, async (req: Request, res: Response) => {
    const race = await updateRace(req.params.id, req.body);
    if (!race) return res.status(404).json({ message: "Prova não encontrada" });
    res.json(race);
  });

  app.delete("/api/races/:id", requireAdmin, async (req: Request, res: Response) => {
    await deleteRace(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/races/:id/entries", requireAdmin, async (req: Request, res: Response) => {
    const entry = await createRaceEntry({ ...req.body, raceId: req.params.id });
    res.status(201).json(entry);
  });

  app.put("/api/entries/:id", requireAdmin, async (req: Request, res: Response) => {
    const entry = await updateRaceEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ message: "Entrada não encontrada" });
    res.json(entry);
  });

  app.delete("/api/entries/:id", requireAdmin, async (req: Request, res: Response) => {
    await deleteRaceEntry(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/races/:id/results", requireAdmin, async (req: Request, res: Response) => {
    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ message: "Formato inválido" });
    for (const r of results) {
      await updateRaceEntry(r.id, { resultTime: r.resultTime, position: r.position, status: r.status || "FIN" });
    }
    res.json({ success: true });
  });

  app.get("/api/notifications", async (_req: Request, res: Response) => {
    const all = await getAllNotifications();
    res.json(all);
  });

  app.post("/api/notifications", requireAdmin, async (req: Request, res: Response) => {
    const notif = await createNotification(req.body);
    res.status(201).json(notif);
  });

  app.delete("/api/notifications/:id", requireAdmin, async (req: Request, res: Response) => {
    await deleteNotification(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/contacts", requireAdmin, async (_req: Request, res: Response) => {
    const all = await getAllContactMessages();
    res.json(all);
  });

  app.post("/api/contacts", async (req: Request, res: Response) => {
    const msg = await createContactMessage(req.body);
    res.status(201).json(msg);
  });

  app.put("/api/contacts/:id/read", requireAdmin, async (req: Request, res: Response) => {
    await markMessageRead(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/contacts/:id", requireAdmin, async (req: Request, res: Response) => {
    await deleteContactMessage(req.params.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
