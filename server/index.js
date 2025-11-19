import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, service: 'skillbridge-api' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- Auth utils ----------
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
// In-memory admin notes for internship approvals (prototype)
const approvalNotes = new Map(); // key: internship_id -> note string
// In-memory reset code store: identifier -> { code, expiresAt }
const resetStore = new Map();

// Ensure messages table exists (prototype safety if migrations not run)
async function ensureMessagesTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT NOT NULL AUTO_INCREMENT,
        from_roll VARCHAR(50) NOT NULL,
        to_roll VARCHAR(50) NOT NULL,
        body TEXT NOT NULL,
        context VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    console.error('ensureMessagesTable failed:', e);
  }
}
ensureMessagesTable();

// ---------- Messaging APIs ----------

const messageSchema = z.object({
  to_roll: z.string().min(3).max(50),
  body: z.string().min(1).max(2000),
  context: z.string().max(50).optional(),
});

// Send a message from current user to another roll number
app.post('/api/messages', authRequired, async (req, res) => {
  const parse = messageSchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { to_roll, body, context } = parse.data;
  const from_roll = req.user.roll_number;
  if (!from_roll) return res.status(400).json({ error: 'Missing sender roll' });
  try {
    const msg = await prisma.messages.create({
      data: {
        from_roll,
        to_roll,
        body,
        context: context || null,
      },
    });
    res.json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Thread between current user and another roll
app.get('/api/messages/with/:roll', authRequired, async (req, res) => {
  const me = req.user.roll_number;
  const other = String(req.params.roll);
  if (!me || !other) return res.status(400).json({ error: 'Invalid roll' });
  try {
    const rows = await prisma.messages.findMany({
      where: {
        OR: [
          { from_roll: me, to_roll: other },
          { from_roll: other, to_roll: me },
        ],
      },
      orderBy: { created_at: 'asc' },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Inbox for current user: flat list of messages involving them (used by AdminOverview)
app.get('/api/messages/inbox', authRequired, async (req, res) => {
  const me = req.user.roll_number;
  if (!me) return res.status(400).json({ error: 'Invalid user' });
  try {
    const rows = await prisma.messages.findMany({
      where: {
        OR: [
          { to_roll: me },
          { from_roll: me },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load inbox' });
  }
});

// Mark a single message as read (only if it was sent to current user)
app.put('/api/messages/:id/read', authRequired, async (req, res) => {
  const me = req.user.roll_number;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const msg = await prisma.messages.findUnique({ where: { id } });
    if (!msg || msg.to_roll !== me) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.messages.update({
      where: { id },
      data: { read_at: new Date() },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Ensure notifications table exists
async function ensureNotificationsTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT NOT NULL AUTO_INCREMENT,
        roll_number VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        body VARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    console.error('ensureNotificationsTable failed:', e);
  }
}
ensureNotificationsTable();

// ---------- Interests CRUD ----------
const interestSchema = z.object({ name: z.string().min(1).max(100) });

// List current user's interests
app.get('/api/interests', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const rows = await prisma.interests.findMany({ where: { roll_number } });
    res.json(rows.map(r => r.interest_name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load interests' });
  }
});

// Add interest
app.post('/api/interests', authRequired, async (req, res) => {
  const parse = interestSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const roll_number = req.user.roll_number;
  const interest_name = parse.data.name.trim();
  try {
    const row = await prisma.interests.upsert({
      where: { roll_number_interest_name: { roll_number, interest_name } },
      update: {},
      create: { roll_number, interest_name },
    });
    res.json({ ok: true, name: row.interest_name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add interest' });
  }
});

// Remove interest
app.delete('/api/interests', authRequired, async (req, res) => {
  const parse = interestSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const roll_number = req.user.roll_number;
  const interest_name = parse.data.name.trim();
  try {
    await prisma.interests.delete({ where: { roll_number_interest_name: { roll_number, interest_name } } }).catch(()=>{});
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to remove interest' });
  }
});

// ---------- Achievements CRUD ----------
const achievementSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.string().min(1).max(80),
  date: z.string().optional(), // ISO date
});

// List current user's achievements
app.get('/api/achievements', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const rows = await prisma.achievements.findMany({ where: { roll_number }, orderBy: { achievement_id: 'desc' } });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load achievements' });
  }
});

// Create achievement
app.post('/api/achievements', authRequired, async (req, res) => {
  const parse = achievementSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { title, type, date } = parse.data;
  const roll_number = req.user.roll_number;
  try {
    const row = await prisma.achievements.create({
      data: { roll_number, title, type, date: date ? new Date(date) : null },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

// Update achievement
app.put('/api/achievements/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = achievementSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const data = parse.data;
  try {
    const existing = await prisma.achievements.findUnique({ where: { achievement_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    const row = await prisma.achievements.update({
      where: { achievement_id: id },
      data: { ...data, date: data.date ? new Date(data.date) : existing.date },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

// Delete achievement
app.delete('/api/achievements/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const existing = await prisma.achievements.findUnique({ where: { achievement_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    await prisma.achievements.delete({ where: { achievement_id: id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// ---------- Internships CRUD (student scope) ----------
const internshipSchema = z.object({
  company_name: z.string().min(1).max(150),
  role: z.string().min(1).max(100).optional(),
  domain: z.string().min(1).max(100).optional(),
  duration: z.string().min(1).max(50).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  internship_type: z.enum(['PS1','PS2']),
});

// List current user's internships
app.get('/api/internships', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const rows = await prisma.internships.findMany({ where: { roll_number }, orderBy: { internship_id: 'desc' } });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load internships' });
  }
});

// Create internship (status defaults to Pending)
app.post('/api/internships', authRequired, async (req, res) => {
  const parse = internshipSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const d = parse.data;
  const roll_number = req.user.roll_number;
  try {
    const row = await prisma.internships.create({
      data: {
        roll_number,
        company_name: d.company_name,
        role: d.role || null,
        domain: d.domain || null,
        duration: d.duration || null,
        start_date: d.start_date ? new Date(d.start_date) : null,
        end_date: d.end_date ? new Date(d.end_date) : null,
        internship_type: d.internship_type,
        status: 'Pending',
      },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create internship' });
  }
});

// Update internship (student can edit details; status remains as-is)
app.put('/api/internships/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = internshipSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const d = parse.data;
  try {
    const existing = await prisma.internships.findUnique({ where: { internship_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    const row = await prisma.internships.update({
      where: { internship_id: id },
      data: {
        company_name: d.company_name ?? existing.company_name,
        role: d.role ?? existing.role,
        domain: d.domain ?? existing.domain,
        duration: d.duration ?? existing.duration,
        start_date: d.start_date ? new Date(d.start_date) : existing.start_date,
        end_date: d.end_date ? new Date(d.end_date) : existing.end_date,
        internship_type: d.internship_type ?? existing.internship_type,
      },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update internship' });
  }
});

// Delete internship (student scope)
app.delete('/api/internships/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const existing = await prisma.internships.findUnique({ where: { internship_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    await prisma.internships.delete({ where: { internship_id: id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete internship' });
  }
});

// ---------- Student Dashboard Overview ----------
app.get('/api/dashboard/overview', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const [user, profile, technical, soft, achievements, internships, research] = await Promise.all([
      prisma.users.findUnique({ where: { roll_number }, select: { roll_number: true, full_name: true, email: true, role: true } }),
      prisma.profile.findUnique({ where: { roll_number } }),
      prisma.technicalskills.findMany({ where: { roll_number } }),
      prisma.softskills.findMany({ where: { roll_number } }),
      prisma.achievements.findMany({ where: { roll_number }, orderBy: { achievement_id: 'desc' }, take: 5 }),
      prisma.internships.findMany({ where: { roll_number }, orderBy: { internship_id: 'desc' } }),
      prisma.researchhighlights.findMany({ where: { roll_number }, orderBy: { highlight_id: 'desc' }, take: 5 }),
    ]);

    const skills = {
      technical: technical.map(s => s.skill_name),
      soft: soft.map(s => s.skill_name),
    };

    const now = new Date();
    const activeInternships = internships.filter(it => {
      if (it.status !== 'Approved') return false;
      if (!it.start_date && !it.end_date) return true;
      const startOk = it.start_date ? new Date(it.start_date) <= now : true;
      const endOk = it.end_date ? new Date(it.end_date) >= now : true;
      return startOk && endOk;
    });

    const counts = {
      achievements: await prisma.achievements.count({ where: { roll_number } }),
      internships: await prisma.internships.count({ where: { roll_number } }),
      technicalSkills: skills.technical.length,
      softSkills: skills.soft.length,
    };

    res.json({ user, profile, skills, achievements, internships, research, activeInternships, counts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

// ---------- Research Highlights CRUD ----------
const researchSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  published_link: z.string().url().optional(),
  date: z.string().optional(),
});

app.get('/api/research', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const rows = await prisma.researchhighlights.findMany({ where: { roll_number }, orderBy: { highlight_id: 'desc' } });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load research highlights' });
  }
});

app.post('/api/research', authRequired, async (req, res) => {
  const parse = researchSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const d = parse.data;
  const roll_number = req.user.roll_number;
  try {
    const row = await prisma.researchhighlights.create({
      data: {
        roll_number,
        title: d.title,
        description: d.description || null,
        published_link: d.published_link || null,
        date: d.date ? new Date(d.date) : null,
      },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create research highlight' });
  }
});

app.put('/api/research/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = researchSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const d = parse.data;
  try {
    const existing = await prisma.researchhighlights.findUnique({ where: { highlight_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    const row = await prisma.researchhighlights.update({
      where: { highlight_id: id },
      data: {
        title: d.title ?? existing.title,
        description: d.description ?? existing.description,
        published_link: d.published_link ?? existing.published_link,
        date: d.date ? new Date(d.date) : existing.date,
      },
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update research highlight' });
  }
});

app.delete('/api/research/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const existing = await prisma.researchhighlights.findUnique({ where: { highlight_id: id } });
    if (!existing || existing.roll_number !== req.user.roll_number) return res.status(404).json({ error: 'Not found' });
    await prisma.researchhighlights.delete({ where: { highlight_id: id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete research highlight' });
  }
});

// ---------- Guidance Hub: Seniors listing ----------
app.get('/api/guidance/seniors', authRequired, async (req, res) => {
  try {
    const q = req.query || {};
    const batch = q.batch ? Number(q.batch) : undefined;
    const degree = q.degree ? String(q.degree) : undefined;
    const search = q.search ? String(q.search) : undefined;
    const skillsFilter = q.skills ? String(q.skills).split(',').map(s=>s.trim()).filter(Boolean) : [];

    const profileWhere = {};
    if (batch && Number.isInteger(batch)) profileWhere.batch_year = batch;
    if (degree) profileWhere.degree = degree;

    const profiles = await prisma.profile.findMany({ where: profileWhere });
    const rollNumbers = profiles.map(p => p.roll_number);
    if (rollNumbers.length === 0) return res.json([]);

    const userWhere = { roll_number: { in: rollNumbers } };
    if (search) userWhere.full_name = { contains: search, mode: 'insensitive' };
    const users = await prisma.users.findMany({ where: userWhere });
    const userMap = new Map(users.map(u => [u.roll_number, u]));
    // Filter profiles to those with a corresponding user match (after search)
    const filteredProfiles = profiles.filter(p => userMap.has(p.roll_number));
    const filteredRolls = filteredProfiles.map(p => p.roll_number);

    const [tech, ach, ints] = await Promise.all([
      prisma.technicalskills.findMany({ where: { roll_number: { in: filteredRolls } } }),
      prisma.achievements.findMany({ where: { roll_number: { in: filteredRolls } }, orderBy: { achievement_id: 'desc' } }),
      prisma.internships.findMany({ where: { roll_number: { in: filteredRolls } } }),
    ]);
    const techByRoll = new Map();
    for (const t of tech) {
      if (!techByRoll.has(t.roll_number)) techByRoll.set(t.roll_number, []);
      techByRoll.get(t.roll_number).push(t.skill_name);
    }
    const achByRoll = new Map();
    for (const a of ach) {
      if (!achByRoll.has(a.roll_number)) achByRoll.set(a.roll_number, []);
      achByRoll.get(a.roll_number).push({ title: a.title, date: a.date });
    }
    const intByRoll = new Map();
    for (const it of ints) {
      if (!intByRoll.has(it.roll_number)) intByRoll.set(it.roll_number, []);
      intByRoll.get(it.roll_number).push({ company: it.company_name, domain: it.domain, type: it.internship_type });
    }

    let seniors = filteredProfiles.map(p => {
      const u = userMap.get(p.roll_number) || {};
      const skills = techByRoll.get(p.roll_number) || [];
      return {
        roll_number: p.roll_number,
        name: u.full_name,
        degree: p.degree,
        department: p.department,
        batch: p.batch_year,
        cgpa: p.cgpa,
        linkedin: p.linkedin_url,
        github: p.github_url,
        skills,
        achievements: achByRoll.get(p.roll_number) || [],
        internships: intByRoll.get(p.roll_number) || [],
      };
    });

    if (skillsFilter.length) {
      seniors = seniors.filter(s => skillsFilter.every(sf => (s.skills || []).includes(sf)));
    }

    // Sort by batch desc then name asc
    seniors.sort((a,b)=> (b.batch||0) - (a.batch||0) || String(a.name||'').localeCompare(String(b.name||'')));
    res.json(seniors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load seniors' });
  }
});

// ---------- Mentor Matching (Admin / Seniors) ----------

function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

function jaccardSimilarity(a, b) {
  const setA = new Set((a || []).map(x => String(x).toLowerCase()));
  const setB = new Set((b || []).map(x => String(x).toLowerCase()));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const v of setA) {
    if (setB.has(v)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
}

async function computeMentorMatches(seniorRoll) {
  // Load senior baseline data
  const [seniorProfile, seniorUser] = await Promise.all([
    prisma.profile.findUnique({ where: { roll_number: seniorRoll } }),
    prisma.users.findUnique({ where: { roll_number: seniorRoll } }),
  ]);
  if (!seniorProfile || !seniorUser) return [];

  const juniorsProfiles = await prisma.profile.findMany({
    where: { batch_year: { gte: 2024 } },
  });
  if (!juniorsProfiles.length) return [];

  const juniorRolls = juniorsProfiles.map(p => p.roll_number);
  const juniorUsers = await prisma.users.findMany({
    where: { roll_number: { in: juniorRolls }, role: 'student' },
  });
  const juniorUserMap = new Map(juniorUsers.map(u => [u.roll_number, u]));
  const effectiveProfiles = juniorsProfiles.filter(p => juniorUserMap.has(p.roll_number));
  const effectiveRolls = effectiveProfiles.map(p => p.roll_number);

  if (!effectiveRolls.length) return [];

  const rollsForLookups = [seniorRoll, ...effectiveRolls];

  const [tech, interestRows, ach, ints] = await Promise.all([
    prisma.technicalskills.findMany({ where: { roll_number: { in: rollsForLookups } } }),
    prisma.interests.findMany({ where: { roll_number: { in: rollsForLookups } } }),
    prisma.achievements.findMany({ where: { roll_number: { in: rollsForLookups } } }),
    prisma.internships.findMany({ where: { roll_number: { in: rollsForLookups } } }),
  ]);

  const skillsByRoll = new Map();
  for (const t of tech) {
    if (!skillsByRoll.has(t.roll_number)) skillsByRoll.set(t.roll_number, []);
    skillsByRoll.get(t.roll_number).push(t.skill_name);
  }

  const interestsByRoll = new Map();
  for (const r of interestRows) {
    if (!interestsByRoll.has(r.roll_number)) interestsByRoll.set(r.roll_number, []);
    interestsByRoll.get(r.roll_number).push(r.interest_name);
  }

  const achTypesByRoll = new Map();
  for (const a of ach) {
    if (!achTypesByRoll.has(a.roll_number)) achTypesByRoll.set(a.roll_number, []);
    if (a.type) achTypesByRoll.get(a.roll_number).push(a.type);
  }

  const domainsByRoll = new Map();
  for (const it of ints) {
    if (!domainsByRoll.has(it.roll_number)) domainsByRoll.set(it.roll_number, []);
    if (it.domain) domainsByRoll.get(it.roll_number).push(it.domain);
  }

  const seniorSkills = skillsByRoll.get(seniorRoll) || [];
  const seniorInterests = interestsByRoll.get(seniorRoll) || [];
  const seniorAchTypes = achTypesByRoll.get(seniorRoll) || [];
  const seniorDomains = domainsByRoll.get(seniorRoll) || [];

  const results = effectiveProfiles.map(p => {
    const u = juniorUserMap.get(p.roll_number);
    const jrSkills = skillsByRoll.get(p.roll_number) || [];
    const jrInterests = interestsByRoll.get(p.roll_number) || [];
    const jrAchTypes = achTypesByRoll.get(p.roll_number) || [];
    const jrDomains = domainsByRoll.get(p.roll_number) || [];

    const skillsScore = jaccardSimilarity(seniorSkills, jrSkills);
    const interestsScore = jaccardSimilarity(seniorInterests, jrInterests);
    const domainsScore = jaccardSimilarity(seniorDomains, jrDomains);
    const achScore = jaccardSimilarity(seniorAchTypes, jrAchTypes);

    const matchScore = Math.round(
      skillsScore * 40 +
      interestsScore * 30 +
      domainsScore * 20 +
      achScore * 10
    );

    return {
      roll_number: p.roll_number,
      name: u?.full_name,
      batch: p.batch_year,
      degree: p.degree,
      department: p.department,
      skills: jrSkills,
      interests: jrInterests,
      domains: jrDomains,
      matchScore,
    };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

app.get('/api/mentor-matches/:seniorRoll', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  const seniorRoll = String(req.params.seniorRoll);
  if (req.user.roll_number !== seniorRoll && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const matches = await computeMentorMatches(seniorRoll);
    res.json(matches);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute mentor matches' });
  }
});

app.post('/api/mentor-match/filter', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  const body = req.body || {};
  const seniorRoll = String(body.seniorRoll || '').trim();
  if (!seniorRoll) return res.status(400).json({ error: 'seniorRoll required' });
  if (req.user.roll_number !== seniorRoll && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const matches = await computeMentorMatches(seniorRoll);
    let filtered = matches;

    const domain = body.domain ? String(body.domain).trim() : '';
    const batch = body.batch ? Number(body.batch) : undefined;
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const interests = Array.isArray(body.interests) ? body.interests : [];

    if (domain) {
      const dLower = domain.toLowerCase();
      filtered = filtered.filter(m => (m.domains || []).some(x => String(x).toLowerCase() === dLower));
    }
    if (batch && Number.isInteger(batch)) {
      filtered = filtered.filter(m => Number(m.batch) === batch);
    }
    if (skills.length) {
      const skillSet = new Set(skills.map(s => String(s).toLowerCase()));
      filtered = filtered.filter(m => (m.skills || []).some(s => skillSet.has(String(s).toLowerCase())));
    }
    if (interests.length) {
      const interestSet = new Set(interests.map(s => String(s).toLowerCase()));
      filtered = filtered.filter(m => (m.interests || []).some(s => interestSet.has(String(s).toLowerCase())));
    }

    res.json(filtered);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to filter mentor matches' });
  }
});

app.get('/api/mentor-match/details/:juniorRoll', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  const juniorRoll = String(req.params.juniorRoll);
  try {
    const [user, profile] = await Promise.all([
      prisma.users.findUnique({ where: { roll_number: juniorRoll } }),
      prisma.profile.findUnique({ where: { roll_number: juniorRoll } }),
    ]);
    if (!user || !profile) return res.status(404).json({ error: 'Not found' });
    const [tech, soft, interests, ach, ints] = await Promise.all([
      prisma.technicalskills.findMany({ where: { roll_number: juniorRoll } }),
      prisma.softskills.findMany({ where: { roll_number: juniorRoll } }),
      prisma.interests.findMany({ where: { roll_number: juniorRoll } }),
      prisma.achievements.findMany({ where: { roll_number: juniorRoll }, orderBy: { achievement_id: 'desc' } }),
      prisma.internships.findMany({ where: { roll_number: juniorRoll } }),
    ]);
    res.json({
      user,
      profile,
      skills: {
        technical: tech.map(s => s.skill_name),
        soft: soft.map(s => s.skill_name),
      },
      interests: interests.map(i => i.interest_name),
      achievements: ach,
      internships: ints,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load mentor match details' });
  }
});

// ---------- Admin Analytics: Skills & Achievements ----------

app.get('/api/admin/analytics/skills-achievements', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const [skillsRows, achievementRows] = await Promise.all([
      prisma.technicalskills.findMany(),
      prisma.achievements.findMany(),
    ]);

    const skillCounts = new Map();
    for (const row of skillsRows) {
      const key = (row.skill_name || '').trim();
      if (!key) continue;
      skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
    }
    const topSkills = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const achievementCounts = new Map();
    for (const row of achievementRows) {
      const key = (row.type || 'Other').trim() || 'Other';
      achievementCounts.set(key, (achievementCounts.get(key) || 0) + 1);
    }
    const achievementsByType = Array.from(achievementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    res.json({ topSkills, achievementsByType });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load skills & achievements analytics' });
  }
});

// ---------- Admin Reports & CSV Exports ----------

function sendCsv(res, filename, headers, rows) {
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const csvLines = [headers.join(',')];
  for (const row of rows) {
    csvLines.push(headers.map((h) => escape(row[h])).join(','));
  }

  const csv = csvLines.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// Export basic student list
app.get('/api/admin/exports/students.csv', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const users = await prisma.users.findMany({
      orderBy: { roll_number: 'asc' },
    });
    const profiles = await prisma.profile.findMany();
    const profileByRoll = new Map(profiles.map((p) => [p.roll_number, p]));

    const headers = [
      'roll_number',
      'full_name',
      'email',
      'degree',
      'department',
      'batch_year',
      'cgpa',
    ];

    const rows = users.map((u) => {
      const p = profileByRoll.get(u.roll_number) || {};
      return {
        roll_number: u.roll_number,
        full_name: u.full_name,
        email: u.email,
        degree: p.degree || '',
        department: p.department || '',
        batch_year: p.batch_year || '',
        cgpa: p.cgpa ?? '',
      };
    });

    sendCsv(res, 'students.csv', headers, rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to export students' });
  }
});

// Export skills (technical + soft)
app.get('/api/admin/exports/skills.csv', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const [technical, soft] = await Promise.all([
      prisma.technicalskills.findMany(),
      prisma.softskills.findMany(),
    ]);

    const headers = ['roll_number', 'type', 'skill_name'];
    const rows = [];

    for (const row of technical) {
      rows.push({ roll_number: row.roll_number, type: 'technical', skill_name: row.skill_name });
    }
    for (const row of soft) {
      rows.push({ roll_number: row.roll_number, type: 'soft', skill_name: row.skill_name });
    }

    rows.sort((a, b) => String(a.roll_number).localeCompare(String(b.roll_number)));
    sendCsv(res, 'skills.csv', headers, rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to export skills' });
  }
});

// Export internships
app.get('/api/admin/exports/internships.csv', authRequired, async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const internships = await prisma.internships.findMany({
      orderBy: { internship_id: 'asc' },
    });

    const headers = [
      'internship_id',
      'roll_number',
      'company_name',
      'role',
      'domain',
      'duration',
      'start_date',
      'end_date',
      'internship_type',
      'status',
    ];

    const rows = internships.map((it) => ({
      internship_id: it.internship_id,
      roll_number: it.roll_number,
      company_name: it.company_name,
      role: it.role || '',
      domain: it.domain || '',
      duration: it.duration || '',
      start_date: it.start_date ? it.start_date.toISOString().slice(0, 10) : '',
      end_date: it.end_date ? it.end_date.toISOString().slice(0, 10) : '',
      internship_type: it.internship_type,
      status: it.status,
    }));

    sendCsv(res, 'internships.csv', headers, rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to export internships' });
  }
});

// ---------- Skills CRUD ----------
const skillSchema = z.object({ type: z.enum(['technical','soft']), name: z.string().min(1).max(100) });

// List current user's skills
app.get('/api/skills', authRequired, async (req, res) => {
  const roll_number = req.user.roll_number;
  try {
    const technical = await prisma.technicalskills.findMany({ where: { roll_number } });
    const soft = await prisma.softskills.findMany({ where: { roll_number } });
    res.json({ technical: technical.map(s=>s.skill_name), soft: soft.map(s=>s.skill_name) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load skills' });
  }
});

// Add a skill
app.post('/api/skills', authRequired, async (req, res) => {
  const parse = skillSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { type, name } = parse.data;
  const roll_number = req.user.roll_number;
  const skill_name = name.trim();
  try {
    if (type === 'technical') {
      await prisma.technicalskills.upsert({
        where: { roll_number_skill_name: { roll_number, skill_name } },
        update: {},
        create: { roll_number, skill_name },
      });
    } else {
      await prisma.softskills.upsert({
        where: { roll_number_skill_name: { roll_number, skill_name } },
        update: {},
        create: { roll_number, skill_name },
      });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Remove a skill
app.delete('/api/skills', authRequired, async (req, res) => {
  const parse = skillSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { type, name } = parse.data;
  const roll_number = req.user.roll_number;
  const skill_name = name.trim();
  try {
    if (type === 'technical') {
      await prisma.technicalskills.delete({ where: { roll_number_skill_name: { roll_number, skill_name } } }).catch(()=>{});
    } else {
      await prisma.softskills.delete({ where: { roll_number_skill_name: { roll_number, skill_name } } }).catch(()=>{});
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

const roleFromRoll = (roll_number) => {
  if (!roll_number) return 'student';
  const m = String(roll_number).match(/^(\d{4})/);
  if (!m) return 'student';
  const admissionYear = parseInt(m[1], 10);
  const currentYear = new Date().getFullYear();
  let yearOfStudy = currentYear - admissionYear + 1; // 1..4
  if (yearOfStudy < 1) yearOfStudy = 1; // future/admission not started
  if (yearOfStudy > 4) yearOfStudy = 4; // capped for 4-year program
  return yearOfStudy >= 3 ? 'admin' : 'student';
};

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// Force-hash password for a given roll number (dev only)
app.post('/api/dev/fix-hash', async (req, res) => {
  const roll_number = (req.body?.rollno || '2023btech001').toString();
  const password = (req.body?.password || 'dev_only_hash').toString();
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.users.update({
      where: { roll_number },
      data: { password_hash: hashed },
    });
    res.json({ ok: true, roll_number: user.roll_number });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fix hash failed' });
  }
});

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { roll_number, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------- Auth routes ----------
const signupSchema = z.object({
  rollno: z.string().regex(/^\d{4}[a-z]+\d{3,}$/i, 'Invalid roll number format (e.g., 2024btech053)'),
  full_name: z.string().min(2),
  email: z.string().email().refine(v => v.toLowerCase().endsWith('@jklu.edu.in'), {
    message: 'Email must be a jklu.edu.in address',
  }),
  password: z.string().min(6),
});

app.post('/auth/signup', async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
  const { rollno, full_name, email, password } = parse.data;
  const roll_number = rollno;
  try {
    const exists = await prisma.users.findUnique({ where: { roll_number } });
    const emailExists = await prisma.users.findUnique({ where: { email } }).catch(() => null);
    if (exists) return res.status(409).json({ error: 'Roll number already exists' });
    if (emailExists) return res.status(409).json({ error: 'Email already exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const computedRole = roleFromRoll(roll_number);
    const user = await prisma.users.create({
      data: { roll_number, full_name, email, password_hash, role: computedRole },
    });
    await prisma.profile.create({ data: { roll_number } }).catch(() => null);
    const token = signToken({ roll_number, role: computedRole });
    res.json({ token, user: { ...user, role: computedRole } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

const loginSchema = z.object({
  identifier: z.string().min(3), // email or rollno
  password: z.string().min(6),
});

app.post('/auth/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
  const { identifier, password } = parse.data;
  try {
    const where = identifier.includes('@') ? { email: identifier } : { roll_number: identifier };
    const user = await prisma.users.findUnique({ where });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const computedRole = roleFromRoll(user.roll_number);
    if (user.role !== computedRole) {
      await prisma.users.update({ where: { roll_number: user.roll_number }, data: { role: computedRole } }).catch(() => {});
    }
    const token = signToken({ roll_number: user.roll_number, role: computedRole });
    res.json({ token, user: { ...user, role: computedRole } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Current user
app.get('/api/me', authRequired, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({ where: { roll_number: req.user.roll_number } });
    const profile = await prisma.profile.findUnique({ where: { roll_number: req.user.roll_number } });
    res.json({ ...user, profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Quick seed route (dev only): creates a sample user+profile if not present
app.post('/api/dev/seed', async (req, res) => {
  const roll_number = (req.body?.rollno || '2023btech001').toString();
  try {
    const hashed = await bcrypt.hash('dev_only_hash', 10);
    // Upsert user in `users` table (introspected model name)
    const user = await prisma.users.upsert({
      where: { roll_number },
      update: { password_hash: hashed, email: `sample+${roll_number}@jklu.edu.in` },
      create: {
        roll_number,
        full_name: 'Sample User',
        email: `sample+${roll_number}@jklu.edu.in`,
        password_hash: hashed,
        role: 'student',
      },
    });

    // Upsert profile separately (no relation defined in schema)
    await prisma.profile.upsert({
      where: { roll_number },
      update: {
        degree: 'B.Tech',
        department: 'CSE',
        batch_year: 2023,
        cgpa: 8.50,
        bio: 'Seeded profile for testing',
      },
      create: {
        roll_number,
        degree: 'B.Tech',
        department: 'CSE',
        batch_year: 2023,
        cgpa: 8.50,
        bio: 'Seeded profile for testing',
      },
    });

    // Combine payload
    const prof = await prisma.profile.findUnique({ where: { roll_number } });
    res.json({ ok: true, user: { ...user, profile: prof } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Seed failed' });
  }
});

// Get profile by rollno (protected)
app.get('/api/profiles/:rollno', authRequired, async (req, res) => {
  const { rollno } = req.params;
  const roll_number = rollno;
  try {
    const user = await prisma.users.findUnique({ where: { roll_number } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const prof = await prisma.profile.findUnique({ where: { roll_number } });
    res.json({ ...user, profile: prof || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile (protected). Only self or admin.
const profileUpdateSchema = z.object({
  dob: z.string().optional(),
  gender: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  degree: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  batch_year: z.number().int().optional(),
  passout_year: z.number().int().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  phone: z.string().max(20).optional(),
  linkedin_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
});

app.put('/api/profiles/:rollno', authRequired, async (req, res) => {
  const rollno = req.params.rollno;
  if (req.user.roll_number !== rollno && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const data = req.body || {};
    const update = {
      dob: data.dob ? new Date(data.dob) : undefined,
      gender: data.gender,
      bio: data.bio,
      degree: data.degree,
      department: data.department,
      batch_year: typeof data.batch_year === 'number' ? data.batch_year : undefined,
      passout_year: typeof data.passout_year === 'number' ? data.passout_year : undefined,
      cgpa: typeof data.cgpa === 'number' ? data.cgpa : undefined,
      phone: data.phone,
      linkedin_url: data.linkedin_url,
      github_url: data.github_url,
      portfolio_url: data.portfolio_url,
    };
    const profile = await prisma.profile.upsert({
      where: { roll_number: rollno },
      update,
      create: { roll_number: rollno, ...update },
    });
    // Optionally update user's full name if provided
    if (typeof data.full_name === 'string' && data.full_name.trim().length > 1) {
      await prisma.users.update({ where: { roll_number: rollno }, data: { full_name: data.full_name.trim() } }).catch(()=>{});
    }
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
