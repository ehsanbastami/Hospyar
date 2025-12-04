import { supabase } from './supabaseClient';
import { Patient, CalendarEvent, FinancialRecord } from '../types';

export const db = {
  // --- Patients ---
  async getPatients() {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    return data.map((d: any) => d.content as Patient);
  },

  async upsertPatient(patient: Patient) {
    const { error } = await supabase
      .from('patients')
      .upsert({ id: patient.id, content: patient }, { onConflict: 'id' });
    if (error) console.error('Error saving patient:', error);
  },

  // --- Events ---
  async getEvents() {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    return data.map((d: any) => d.content as CalendarEvent);
  },

  async upsertEvent(event: CalendarEvent) {
    const { error } = await supabase
      .from('events')
      .upsert({ id: event.id, content: event }, { onConflict: 'id' });
    if (error) console.error('Error saving event:', error);
  },

  async deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error('Error deleting event:', error);
  },

  // --- Financials ---
  async getFinancials() {
    const { data, error } = await supabase.from('financials').select('*');
    if (error) throw error;
    return data.map((d: any) => d.content as FinancialRecord);
  },
  
  async seedFinancials(records: FinancialRecord[]) {
     const rows = records.map(r => ({ id: r.id, content: r }));
     const { error } = await supabase.from('financials').upsert(rows);
     if (error) console.error('Error seeding financials:', error);
  }
};