import MumbleSync from "../sync";

export default interface Server {
  sync: MumbleSync;
}

export default class Server {
  constructor(sync: MumbleSync) {
    this.sync = sync;
  }

  /** Gets the users and channels in tree form */
  async getTree() {
    return await this.sync.api.getTree();
  }

  /** Sets the super user password */
  async setSuperuserPassword(password: string) {
    await this.sync.api.setSuperuserPassword(password);
  }

  /** Gets the server MOTD, aka the "welcome text" */
  async getMotd() {
    return await this.sync.api.getConfKey("welcometext");
  }

  /**
   * Sets the server MOTD, aka the "welcome text"
   * @param motd The new MOTD
   * @param sendNewMotd  should broadcast the new MOTD to all users
   *
   * Warning: sendNewMotd is forced true on server version 1.3 and below
   */
  async setMotd(motd: string, sendNewMotd = false) {
    await this.sync.api.setConfKey("welcometext", motd);
    if (sendNewMotd) {
      await this.sync.api.sendWelcomeMessage([...this.sync.users.keys()]);
    }
  }
}
