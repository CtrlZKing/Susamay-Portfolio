export interface Profile {
  id: string;
  display_name: string;
  professional_title: string;
  biography: string;
  profile_image: string;
  introduction: string;
  contact_email: string;
  resume_url: string;
  location: string;
  available_for_freelance: boolean;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string;
  display_order: number;
  image_type?: 'render' | 'wireframe' | 'viewport' | 'wip' | 'detail';
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_overview: string;
  thumbnail_url: string;
  category: string;
  software_used: string[];
  external_url: string;
  blender_project_url: string;
  video_url: string;
  is_featured: boolean;
  is_published: boolean;
  creation_date: string;
  images: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  software?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  proficiency_label: string;
  display_order: number;
  is_visible: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  display_order: number;
  is_visible: boolean;
}

export interface SiteSettings {
  site_title: string;
  artist_name: string;
  hero_headline: string;
  hero_subheadline: string;
  featured_project_id: string;
  contact_email: string;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  accent_color: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface DatabaseState {
  profile: Profile;
  projects: Project[];
  gallery: GalleryImage[];
  skills: Skill[];
  social_links: SocialLink[];
  settings: SiteSettings;
  categories: string[];
  messages: ContactMessage[];
}
