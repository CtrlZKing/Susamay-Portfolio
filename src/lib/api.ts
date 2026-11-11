import { DatabaseState, Project, GalleryImage, Skill, SocialLink, Profile, SiteSettings } from '../types/portfolio.ts';

const TOKEN_KEY = 'aura_admin_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string, persist = true) {
    if (persist) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = authStorage.getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorBody.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Public Data
  getPortfolio(): Promise<{
    profile: Profile;
    settings: SiteSettings;
    categories: string[];
    projects: Project[];
    gallery: GalleryImage[];
    skills: Skill[];
    social_links: SocialLink[];
  }> {
    return apiFetch('/api/portfolio');
  },

  getProject(identifier: string): Promise<Project> {
    return apiFetch(`/api/projects/${identifier}`);
  },

  sendContactMessage(data: { name: string; email: string; subject?: string; message: string }) {
    return apiFetch<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus(): Promise<{
    mode: string;
    hasSupabaseConfig: boolean;
    projectCount: number;
    galleryCount: number;
    unreadMessages: number;
  }> {
    return apiFetch('/api/status');
  },

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string }> {
    const res = await apiFetch<{ success: boolean; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  checkAuth(): Promise<{ authenticated: boolean; user: { email: string; role: string } }> {
    return apiFetch('/api/auth/me');
  },

  updateCredentials(payload: { email?: string; currentPassword?: string; newPassword?: string }) {
    return apiFetch<{ success: boolean; message: string }>('/api/auth/update-credentials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Admin Data & Management
  getAdminData(): Promise<DatabaseState> {
    return apiFetch('/api/admin/data');
  },

  updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return apiFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Projects
  createProject(project: Partial<Project>): Promise<Project> {
    return apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  deleteProject(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Gallery
  createGalleryImage(image: Partial<GalleryImage>): Promise<GalleryImage> {
    return apiFetch('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(image),
    });
  },

  updateGalleryImage(id: string, image: Partial<GalleryImage>): Promise<GalleryImage> {
    return apiFetch(`/api/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(image),
    });
  },

  deleteGalleryImage(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // Skills
  createSkill(skill: Partial<Skill>): Promise<Skill> {
    return apiFetch('/api/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  },

  updateSkill(id: string, skill: Partial<Skill>): Promise<Skill> {
    return apiFetch(`/api/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    });
  },

  deleteSkill(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/skills/${id}`, {
      method: 'DELETE',
    });
  },

  // Social Links
  createSocialLink(link: Partial<SocialLink>): Promise<SocialLink> {
    return apiFetch('/api/social-links', {
      method: 'POST',
      body: JSON.stringify(link),
    });
  },

  updateSocialLink(id: string, link: Partial<SocialLink>): Promise<SocialLink> {
    return apiFetch(`/api/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link),
    });
  },

  deleteSocialLink(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/social-links/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  addCategory(name: string): Promise<string[]> {
    return apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteCategory(name: string): Promise<string[]> {
    return apiFetch(`/api/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },

  // Messages
  getMessages(): Promise<DatabaseState['messages']> {
    return apiFetch('/api/messages');
  },

  markMessageRead(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/messages/${id}/read`, {
      method: 'PUT',
    });
  },

  deleteMessage(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/messages/${id}`, {
      method: 'DELETE',
    });
  },

  resetDemoData(): Promise<{ success: boolean; message: string }> {
    return apiFetch('/api/admin/reset-demo', {
      method: 'POST',
    });
  }
};
