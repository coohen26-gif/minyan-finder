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
  is_permanent: boolean; // true = récurrent, false = ponctuel
  status: 'open' | 'complete' | 'cancelled'; // open = en cours, complete = 10 atteint
  min_required: number; // toujours 10 pour un Minyan
}

export interface MinyanRequest {
  prayer_type: 'shacharit' | 'mincha' | 'maariv' | 'levaya';
  location: string;
  latitude: number;
  longitude: number;
  time: string;
  notes?: string;
  is_permanent: boolean;
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
