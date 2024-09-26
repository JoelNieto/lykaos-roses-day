import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public client: SupabaseClient;
  constructor() {
    this.client = new SupabaseClient(
      'https://hjzvdmxkrlnlmuilzjoe.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqenZkbXhrcmxubG11aWx6am9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyODIzMTIsImV4cCI6MjA0Mjg1ODMxMn0.2MFMrLBeHat1kIAc80ZhF40CeHvRNSKgOBGiZpJ9evM'
    );
  }

  uploadFile(path: string, file: File) {
    return this.client.storage.from('receipts').upload(path, file);
  }
}
