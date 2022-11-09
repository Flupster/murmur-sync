import { ContextActionScope } from "../api";
import MumbleSync from "../sync";
import Channel from "./channel";

export default interface User {
  /** Session ID. This identifies the connection to the server. */
  session: number;
  /** User ID. -1 if the user is anonymous. */
  userid: number;
  /** Is user muted by the server? */
  mute: boolean;
  /** Is user deafened by the server? If true, this implies mute. */
  deaf: boolean;
  /** Is the user suppressed by the server? This means the user is not muted, but does not have speech privileges in the current channel. */
  suppress: boolean;
  /** Is the user a priority speaker? */
  prioritySpeaker: boolean;
  /** Is the user self-muted? */
  selfMute: boolean;
  /** Is the user self-deafened? If true, this implies mute. */
  selfDeaf: boolean;
  /** Is the User recording? (This flag is read-only and cannot be changed using save().) **/
  recording: boolean;
  /** Channel ID the user is in. Matches MumbleChannel.id. */
  channel: number;
  /** The name of the user. */
  name: string;
  /** Seconds user has been online. */
  onlinesecs: number;
  /** Average transmission rate in bytes per second over the last few seconds. */
  bytespersec: number;
  /** Client version. Major version in upper 16 bits, followed by 8 bits of minor version and 8 bits of patchlevel. Version 1.2.3 = 0x010203. */
  version: number;
  release: string;
  /** Client OS. */
  os: string;
  /** Client OS Version. */
  osversion: string;
  /** Plugin Identity. This will be the user's unique ID inside the current game. */
  identity: string;
  context: string;
  /** User comment. Shown as tooltip for this user. */
  comment: string;
  /** Client address. */
  address: number[];
  /** TCP only. True until UDP connectivity is established. */
  tcponly: boolean;
  /** Idle time. This is how many seconds it is since the user last spoke. Other activity is not counted. */
  idlesecs: number;
  /** UDP Ping Average. This is the average ping for the user via UDP over the duration of the connection. */
  udpPing: number;
  /** TCP Ping Average. This is the average ping for the user via TCP over the duration of the connection. */
  tcpPing: number;

  getChannel(): Channel;
}

export default class User {
  constructor(data: MumbleUser, private sync: MumbleSync) {
    this.sync = sync;
    Object.assign(this, data);
  }

  getChannel() {
    return this.sync.channels.get(this.channel);
  }

  // State Updates

  async setName(name: string) {
    return this.sync.api.updateUserState(this.session, { name });
  }

  async setMute(mute: boolean) {
    return this.sync.api.updateUserState(this.session, { mute });
  }

  async setDeaf(deaf: boolean) {
    return this.sync.api.updateUserState(this.session, { deaf });
  }

  async setSuppress(suppress: boolean) {
    return this.sync.api.updateUserState(this.session, { suppress });
  }

  async setPrioritySpeaker(prioritySpeaker: boolean) {
    return this.sync.api.updateUserState(this.session, { prioritySpeaker });
  }

  async setChannel(channel: Channel) {
    return this.sync.api.updateUserState(this.session, { channel: channel.id });
  }

  async setComment(comment: string) {
    return this.sync.api.updateUserState(this.session, { comment });
  }

  async getCertificateList() {
    return this.sync.api.getCertificateList(this.session);
  }

  // Other stuff
  async sendMessage(message: string) {
    return this.sync.api.sendUserMessage(this.session, message);
  }

  async kick(reason: string) {
    return this.sync.api.kickUser(this.session, reason);
  }

  async addContextAction(action: string, text: string, scope: ContextActionScope) {
    return this.sync.api.addContextAction(this.session, action, text, scope);
  }

  async addToGroup(group: string, channel = 0) {
    return this.sync.api.addUserToGroup(this.session, channel, group);
  }

  async removeFromGroup(group: string, channel = 0) {
    return this.sync.api.removeUserFromGroup(this.session, channel, group);
  }
}
