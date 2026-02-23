// Barrel export for all sample/template data + helper to get templates by ID

import { Trip } from '../types';
import { sampleTrip } from './sampleTrip';
import {
  nycTemplate,
  euroTemplate,
  baliTemplate,
  amalfiTemplate,
  patagoniaTemplate,
  moroccoTemplate,
  icelandTemplate,
  thailandTemplate,
} from './templates';

export {
  sampleTrip,
  nycTemplate,
  euroTemplate,
  baliTemplate,
  amalfiTemplate,
  patagoniaTemplate,
  moroccoTemplate,
  icelandTemplate,
  thailandTemplate,
};

// Map of all template IDs to Trip objects
const TEMPLATE_MAP: Record<string, Trip> = {
  [sampleTrip.id]: sampleTrip,
  [nycTemplate.id]: nycTemplate,
  [euroTemplate.id]: euroTemplate,
  [baliTemplate.id]: baliTemplate,
  [amalfiTemplate.id]: amalfiTemplate,
  [patagoniaTemplate.id]: patagoniaTemplate,
  [moroccoTemplate.id]: moroccoTemplate,
  [icelandTemplate.id]: icelandTemplate,
  [thailandTemplate.id]: thailandTemplate,
};

/**
 * Get a template trip by ID. Returns null if not a known template.
 * Use this in ShareView before querying Supabase.
 */
export function getTemplateById(id: string): Trip | null {
  return TEMPLATE_MAP[id] ?? null;
}
