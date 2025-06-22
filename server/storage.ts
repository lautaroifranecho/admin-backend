import { type User, type InsertUser, type Admin, type InsertAdmin, type AuditLog, type UserSecurity } from "@shared/schema";
import { supabase } from "./db";
import { generateSecureToken, generateTokenExpiry } from "./services/security";

export interface IStorage {
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminCount(): Promise<number>;
  
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: number, data: Partial<User>): Promise<User>;
  getUsers(params: { page: number; limit: number; status?: string; search?: string }): Promise<{ users: User[]; total: number }>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByClientNumber(clientNumber: string): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateAllUsersToPending(): Promise<{ updatedCount: number; users: User[] }>;
  
  getDashboardStats(): Promise<{
    totalUsers: number;
    confirmed: number;
    updated: number;
    pending: number;
    confirmationRate: number;
    todayUpdates: number;
    recentUpdateCount: number;
  }>;
  getRecentUpdates(): Promise<User[]>;
  
  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;

  getAllUsers(): Promise<User[]>;

  getUserSecurity(adminId: number): Promise<UserSecurity | null>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const { data, error } = await supabase
      .from('admins')
      .select()
      .eq('email', email)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .insert(insertAdmin)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getAdminCount(): Promise<number> {
    const { count, error } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', username)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async getUserByToken(token: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('verification_token', token)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateUserVerification(id: number, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await supabase
      .from('users')
      .update({ ...data, last_updated: new Date() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  }

  async getUsers(params: { page: number; limit: number; status?: string; search?: string }): Promise<{ users: User[]; total: number }> {
    const { page, limit, status, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(
        `first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},client_number.ilike.${searchPattern},email.ilike.${searchPattern},phone_number.ilike.${searchPattern}`
      );
    }

    const { data, count, error } = await query
      .order('last_updated', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { users: data || [], total: count || 0 };
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    confirmed: number;
    updated: number;
    pending: number;
    confirmationRate: number;
    todayUpdates: number;
    recentUpdateCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalUsers },
      { count: confirmed },
      { count: updated },
      { count: pending },
      { count: todayUpdates },
      { count: recentUpdates }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'updated'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .eq('status', 'updated')
        .gte('last_updated', today.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .eq('status', 'updated')
        .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    const confirmationRate = totalUsers ? Math.round(((confirmed || 0) + (updated || 0)) / totalUsers * 100) : 0;

    return {
      totalUsers: totalUsers || 0,
      confirmed: confirmed || 0,
      updated: updated || 0,
      pending: pending || 0,
      confirmationRate,
      todayUpdates: todayUpdates || 0,
      recentUpdateCount: recentUpdates || 0,
    };
  }

  async getRecentUpdates(): Promise<User[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('status', 'updated')
      .gte('last_updated', oneDayAgo.toISOString())
      .order('last_updated', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_log')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async getUserByClientNumber(clientNumber: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('client_number', clientNumber)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      throw error;
    }
    return data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  }

  async getUserSecurity(adminId: number): Promise<UserSecurity | null> {
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', adminId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async updateAllUsersToPending(): Promise<{ updatedCount: number; users: User[] }> {
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) throw fetchError;
    
    if (!allUsers || allUsers.length === 0) {
      return { updatedCount: 0, users: [] };
    }

    const updatedUsers = allUsers.map(user => {
      return {
        ...user,
        status: 'pending' as const,
        verification_token: generateSecureToken(),
        token_expiry: generateTokenExpiry().toISOString(),
        last_updated: new Date().toISOString()
      };
    });

    const batchSize = 100;
    const updatedUsersList: User[] = [];
    
    for (let i = 0; i < updatedUsers.length; i += batchSize) {
      const batch = updatedUsers.slice(i, i + batchSize);
      
      const { data: batchResults, error: batchError } = await supabase
        .from('users')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (batchError) throw batchError;
      
      if (batchResults) {
        updatedUsersList.push(...batchResults);
      }
    }

    return { 
      updatedCount: updatedUsersList.length, 
      users: updatedUsersList 
    };
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const storage = new DatabaseStorage();
