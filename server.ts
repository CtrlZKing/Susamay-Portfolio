import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { initialData } from './server/defaultData.ts';
import { DatabaseState, Project, GalleryImage, Skill, SocialLink, ContactMessage } from './src/types/portfolio.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio.db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory + disk persistent storage
let state: DatabaseState = initialData;

function loadDatabase(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      state = JSON.parse(content);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database, using default state:', err);
    state = initialData;
    saveDatabase();
  }
}

function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

loadDatabase();

// Admin credentials (in real production with Supabase, Supabase Auth handles this)
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin.json');
let adminCreds = {
  email: 'admin@portfolio.local',
  passwordHash: crypto.createHash('sha256').update('admin12345').digest('hex'),
};

if (fs.existsSync(ADMIN_CONFIG_FILE)) {
  try {
    adminCreds = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
  } catch {
    // fallback
  }
} else {
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(adminCreds, null, 2));
}

// Active sessions set
const activeTokens = new Set<string>();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded assets
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext || '.jpg'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per image
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed.'));
    }
  },
});

// Auth helper middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing authentication token' });
    return;
  }
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
    return;
  }
  next();
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Get full public portfolio bundle
app.get('/api/portfolio', (_req: Request, res: Response) => {
  const publishedProjects = state.projects
    .filter((p) => p.is_published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const publishedGallery = state.gallery
    .filter((g) => g.is_published)
    .sort((a, b) => a.display_order - b.display_order);

  const visibleSkills = state.skills
    .filter((s) => s.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  const visibleSocials = state.social_links
    .filter((s) => s.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  res.json({
    profile: state.profile,
    settings: state.settings,
    categories: state.categories,
    projects: publishedProjects,
    gallery: publishedGallery,
    skills: visibleSkills,
    social_links: visibleSocials,
  });
});

// Get single project by slug or ID
app.get('/api/projects/:identifier', (req: Request, res: Response) => {
  const { identifier } = req.params;
  const project = state.projects.find((p) => p.id === identifier || p.slug === identifier);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
});

// Submit contact inquiry
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address provided.' });
    return;
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 100),
    subject: String(subject || 'General Inquiry').trim().slice(0, 150),
    message: String(message).trim().slice(0, 5000),
    created_at: new Date().toISOString(),
    read: false,
  };

  state.messages.unshift(newMessage);
  saveDatabase();

  res.status(201).json({ success: true, message: 'Message sent successfully.' });
});

// Server status & Supabase integration status
app.get('/api/status', (_req: Request, res: Response) => {
  const hasSupabase = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  res.json({
    mode: hasSupabase ? 'supabase_configured' : 'local_database_active',
    hasSupabaseConfig: hasSupabase,
    projectCount: state.projects.length,
    galleryCount: state.gallery.length,
    unreadMessages: state.messages.filter((m) => !m.read).length,
    version: '1.0.0',
  });
});

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  if (email === adminCreds.email && inputHash === adminCreds.passwordHash) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    res.json({
      success: true,
      token,
      user: {
        email: adminCreds.email,
        role: 'admin',
      },
    });
    return;
  }

  res.status(401).json({ error: 'Invalid credentials. Default: admin@portfolio.local / admin12345' });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeTokens.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: {
      email: adminCreds.email,
      role: 'admin',
    },
  });
});

app.post('/api/auth/update-credentials', requireAdmin, (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body;
  const currentHash = crypto.createHash('sha256').update(currentPassword || '').digest('hex');

  if (currentHash !== adminCreds.passwordHash) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  if (newPassword && newPassword.length >= 6) {
    adminCreds.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  }
  if (email && email.includes('@')) {
    adminCreds.email = email;
  }

  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(adminCreds, null, 2));
  res.json({ success: true, message: 'Admin credentials updated successfully.' });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT ROUTES (Protected by requireAdmin)
// -------------------------------------------------------------

// Full administrative data
app.get('/api/admin/data', requireAdmin, (_req: Request, res: Response) => {
  res.json(state);
});

// File upload
app.post('/api/upload', requireAdmin, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or invalid file format' });
    return;
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Update Profile
app.put('/api/profile', requireAdmin, (req: Request, res: Response) => {
  state.profile = {
    ...state.profile,
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  saveDatabase();
  res.json(state.profile);
});

// Update Settings
app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  state.settings = {
    ...state.settings,
    ...req.body,
  };
  saveDatabase();
  res.json(state.settings);
});

// Categories Management
app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Category name required' });
    return;
  }
  const clean = name.trim();
  if (!state.categories.includes(clean)) {
    state.categories.push(clean);
    saveDatabase();
  }
  res.json(state.categories);
});

app.delete('/api/categories/:name', requireAdmin, (req: Request, res: Response) => {
  const { name } = req.params;
  state.categories = state.categories.filter((c) => c !== decodeURIComponent(name));
  saveDatabase();
  res.json(state.categories);
});

// Projects CRUD
app.post('/api/projects', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.thumbnail_url) {
    res.status(400).json({ error: 'Title and thumbnail are required.' });
    return;
  }

  const slug = (data.slug || data.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    title: data.title,
    slug: slug || `project-${Date.now()}`,
    description: data.description || '',
    detailed_overview: data.detailed_overview || '',
    thumbnail_url: data.thumbnail_url,
    category: data.category || '3D Modeling',
    software_used: Array.isArray(data.software_used) ? data.software_used : [],
    external_url: data.external_url || '',
    blender_project_url: data.blender_project_url || '',
    video_url: data.video_url || '',
    is_featured: Boolean(data.is_featured),
    is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
    creation_date: data.creation_date || '2026',
    images: Array.isArray(data.images) ? data.images : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  state.projects.unshift(newProject);
  saveDatabase();
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = state.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  state.projects[index] = {
    ...state.projects[index],
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  saveDatabase();
  res.json(state.projects[index]);
});

app.delete('/api/projects/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  state.projects = state.projects.filter((p) => p.id !== id);
  saveDatabase();
  res.json({ success: true, id });
});

// Gallery CRUD
app.post('/api/gallery', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.image_url) {
    res.status(400).json({ error: 'Image URL is required' });
    return;
  }

  const newItem: GalleryImage = {
    id: `gal-${Date.now()}`,
    title: data.title || 'Untitled Artwork',
    description: data.description || '',
    image_url: data.image_url,
    category: data.category || '3D Render',
    software: data.software || 'Blender',
    display_order: data.display_order ?? state.gallery.length + 1,
    is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
    created_at: new Date().toISOString(),
  };

  state.gallery.unshift(newItem);
  saveDatabase();
  res.status(201).json(newItem);
});

app.put('/api/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = state.gallery.findIndex((g) => g.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  state.gallery[index] = {
    ...state.gallery[index],
    ...req.body,
  };
  saveDatabase();
  res.json(state.gallery[index]);
});

app.delete('/api/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  state.gallery = state.gallery.filter((g) => g.id !== id);
  saveDatabase();
  res.json({ success: true, id });
});

// Skills CRUD
app.post('/api/skills', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name) {
    res.status(400).json({ error: 'Skill name required' });
    return;
  }

  const newSkill: Skill = {
    id: `sk-${Date.now()}`,
    name: data.name,
    category: data.category || '3D & CG',
    description: data.description || '',
    proficiency_label: data.proficiency_label || 'Advanced',
    display_order: data.display_order ?? state.skills.length + 1,
    is_visible: data.is_visible !== undefined ? Boolean(data.is_visible) : true,
  };

  state.skills.push(newSkill);
  saveDatabase();
  res.status(201).json(newSkill);
});

app.put('/api/skills/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = state.skills.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }

  state.skills[index] = {
    ...state.skills[index],
    ...req.body,
  };
  saveDatabase();
  res.json(state.skills[index]);
});

app.delete('/api/skills/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  state.skills = state.skills.filter((s) => s.id !== id);
  saveDatabase();
  res.json({ success: true, id });
});

// Social Links CRUD
app.post('/api/social-links', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.platform || !data.url) {
    res.status(400).json({ error: 'Platform and URL required' });
    return;
  }

  const newLink: SocialLink = {
    id: `soc-${Date.now()}`,
    platform: data.platform,
    url: data.url,
    label: data.label || data.url,
    display_order: data.display_order ?? state.social_links.length + 1,
    is_visible: data.is_visible !== undefined ? Boolean(data.is_visible) : true,
  };

  state.social_links.push(newLink);
  saveDatabase();
  res.status(201).json(newLink);
});

app.put('/api/social-links/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = state.social_links.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Social link not found' });
    return;
  }

  state.social_links[index] = {
    ...state.social_links[index],
    ...req.body,
  };
  saveDatabase();
  res.json(state.social_links[index]);
});

app.delete('/api/social-links/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  state.social_links = state.social_links.filter((s) => s.id !== id);
  saveDatabase();
  res.json({ success: true, id });
});

// Messages management
app.get('/api/messages', requireAdmin, (_req: Request, res: Response) => {
  res.json(state.messages);
});

app.put('/api/messages/:id/read', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const msg = state.messages.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    saveDatabase();
  }
  res.json({ success: true });
});

app.delete('/api/messages/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  state.messages = state.messages.filter((m) => m.id !== id);
  saveDatabase();
  res.json({ success: true, id });
});

// Reset database to initial clean state
app.post('/api/admin/reset-demo', requireAdmin, (_req: Request, res: Response) => {
  state = JSON.parse(JSON.stringify(initialData));
  saveDatabase();
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PROD SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA Portfolio CMS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
