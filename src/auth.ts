import MumbleSync from "./sync";

export interface AuthUser {
  id: number;
  username: string;
  password: string | null;
  roles: string[];
  displayName: string;
}

export default class MumbleAuth {
  sync: MumbleSync;
  constructor(sync: MumbleSync) {
    this.sync = sync;
  }

  /** Gets the auth cache */
  async getUsers() {
    return await this.sync.api.getAuthUsers();
  }

  /** Update a users auth cache */
  async updateUsers(users: AuthUser[]) {
    await this.sync.api.updateAuthUser(users);
  }

  /** Deletes a user from the auth cache */
  async deleteUser(user: AuthUser) {
    await this.sync.api.deleteAuthUser(user);
  }

  /** Flushes the cache, this deletes all users */
  async flushCache() {
    await this.sync.api.flushAuthCache();
  }
}
