// Types for Minyan API

export interface Minyan {
  id: string;
  prayer_type: 'shacharit' | 'mincha' | 'maariv' | 'levaya';
  location: string;
  latitude: number;
  longitude: number;
  time: string;
  notes?: string;
  created_by: string;
  created_at: string;
  participants: string[];
  is_funeral?: boolean;
}

export interface MinyanRequest {
  prayer_type: 'shacharit' | 'mincha' | 'maariv' | 'levaya';
  location: string;
  latitude: number;
  longitude: number;
  time: string;
  notes?: string;
}

export interface Synagogue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  denomination: 'ashkenazi' | 'sephardi' | 'mixed';
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferred_language: 'fr' | 'en' | 'he';
  location?: {
    latitude: number;
    longitude: number;
  };
}
