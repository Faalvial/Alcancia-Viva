import { Transaction, Goal, CollaborativeGroup, UserProfile } from '../../types';
import mockDataRaw from '../../../data/mock_data.json';

const STORAGE_KEYS = {
  TRANSACTIONS: 'alcancia_transactions',
  GOALS: 'alcancia_goals',
  GROUPS: 'alcancia_groups',
  USER_PROFILE: 'alcancia_user_profile',
  OFFLINE_QUEUE: 'alcancia_offline_queue'
};

export class StorageService {
  static initDefaultData(): {
    user: UserProfile;
    goals: Goal[];
    groups: CollaborativeGroup[];
    transactions: Transaction[];
  } {
    const raw = mockDataRaw as any;
    return {
      user: raw.user,
      goals: raw.goals,
      groups: raw.collaborative_groups,
      transactions: raw.transactions_30_days
    };
  }

  static getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      const defaults = this.initDefaultData();
      this.saveTransactions(defaults.transactions);
      return defaults.transactions;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static addTransaction(tx: Transaction): Transaction[] {
    const current = this.getTransactions();
    const updated = [tx, ...current];
    this.saveTransactions(updated);
    return updated;
  }

  static removeTransaction(id: string): Transaction[] {
    const current = this.getTransactions();
    const updated = current.filter(t => t.id !== id);
    this.saveTransactions(updated);
    return updated;
  }

  static getGoals(): Goal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) {
      const defaults = this.initDefaultData();
      this.saveGoals(defaults.goals);
      return defaults.goals;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveGoals(goals: Goal[]) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  static addGoal(goal: Goal): Goal[] {
    const current = this.getGoals();
    const updated = [goal, ...current];
    this.saveGoals(updated);
    return updated;
  }

  static getGroups(): CollaborativeGroup[] {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!data) {
      const defaults = this.initDefaultData();
      this.saveGroups(defaults.groups);
      return defaults.groups;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveGroups(groups: CollaborativeGroup[]) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }

  static getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      const defaults = this.initDefaultData();
      this.saveUserProfile(defaults.user);
      return defaults.user;
    }
    try {
      return JSON.parse(data);
    } catch {
      return this.initDefaultData().user;
    }
  }

  static saveUserProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  static resetToDemoData() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    const defaults = this.initDefaultData();
    this.saveTransactions(defaults.transactions);
    this.saveGoals(defaults.goals);
    this.saveGroups(defaults.groups);
    this.saveUserProfile(defaults.user);
    return defaults;
  }
}
