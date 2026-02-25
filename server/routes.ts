import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  getAllRaces, getRace, createRace, updateRace, deleteRace,
  getEntriesByRace, createRaceEntry, updateRaceEntry, deleteRaceEntry,
  getAllNotifications, createNotification, deleteNotification, markNotificationRead, getUnreadNotificationCount,
  getAllContactMessages, createContactMessage, markMessageRead, deleteContactMessage,
  getAllScheduleEntries, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry,
  getAdmin, seedAdmin, seedSchedule, deleteAllRaces,
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
  await seedSchedule();

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
    
    const hasAnyTime = results.some((r: any) => r.resultTime);
    
    for (const r of results) {
      await updateRaceEntry(r.id, { resultTime: r.resultTime, position: r.position, status: r.status || "FIN" });
    }
    
    if (hasAnyTime) {
      const race = await getRace(req.params.id);
      if (race) {
        await createNotification({
          title: `Resultados - Prova #${race.raceNumber}`,
          message: `Resultados disponíveis para ${race.category} ${race.gender} ${race.boatType} (${race.phase})`,
          type: "info",
        });
      }
    }
    
    res.json({ success: true });
  });

  app.post("/api/import", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { races: importRaces, clearExisting } = req.body;
      if (!Array.isArray(importRaces)) {
        return res.status(400).json({ message: "Formato inválido: 'races' deve ser um array" });
      }

      if (clearExisting) {
        await deleteAllRaces();
      }

      let racesCreated = 0;
      let entriesCreated = 0;

      for (const r of importRaces) {
        const race = await createRace({
          raceNumber: r.raceNumber,
          time: r.time || "00:00",
          category: r.category || "Absoluto",
          gender: r.gender || "Masculino",
          boatType: r.boatType || "1x",
          distance: r.distance || 500,
          phase: r.phase || "Série",
          lanes: r.lanes ? String(r.lanes) : null,
        });
        racesCreated++;

        if (Array.isArray(r.entries)) {
          for (const e of r.entries) {
            await createRaceEntry({
              raceId: race.id,
              lane: e.lane,
              clubName: e.clubName,
              crewNames: e.crewNames || null,
              resultTime: e.resultTime || null,
              position: e.position || null,
              status: e.status || null,
            });
            entriesCreated++;
          }
        }
      }

      res.json({ success: true, racesCreated, entriesCreated });
    } catch (err: any) {
      console.error("Import error:", err);
      res.status(500).json({ message: `Erro na importação: ${err.message}` });
    }
  });

  app.get("/api/notifications/unread-count", async (_req: Request, res: Response) => {
    const count = await getUnreadNotificationCount();
    res.json({ count });
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

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const { id } = req.params;
    await markNotificationRead(id);
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

  app.get("/api/schedule", async (_req: Request, res: Response) => {
    const entries = await getAllScheduleEntries();
    res.json(entries);
  });

  app.post("/api/schedule", requireAdmin, async (req: Request, res: Response) => {
    const entry = await createScheduleEntry(req.body);
    res.status(201).json(entry);
  });

  app.put("/api/schedule/:id", requireAdmin, async (req: Request, res: Response) => {
    const entry = await updateScheduleEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ message: "Entrada não encontrada" });
    res.json(entry);
  });

  app.delete("/api/schedule/:id", requireAdmin, async (req: Request, res: Response) => {
    await deleteScheduleEntry(req.params.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
