import EventEmitter from "events";
import { io, Socket } from "socket.io-client";
import MumbleEventManager, { Events as ManagerEvents } from "./events";
import MumbleApi from "./api";
import User from "./models/user";
import Channel from "./models/channel";
import MumbleAuth from "./auth";
import Server from "./models/server";

type ContextActionData = {
  action: string;
  issuer: User;
  user: User | undefined;
  channel: Channel | undefined;
};

export const enum Events {
  UserConnected = "userConnected",
  UserStateChanged = "userStateChanged",
  UserDisconnected = "userDisconnected",
  UserTextMessage = "userTextMessage",
  ChannelCreated = "channelCreated",
  ChannelStateChanged = "channelStateChanged",
  ChannelRemoved = "channelRemoved",

  UserChannelChanged = "userChannelChanged",
  UserMuteChanged = "userMuteChanged",
  UserDeafChanged = "userDeafChanged",
  UserSuppressChanged = "userSuppressChanged",
  UserSelfMuteChanged = "userSelfMuteChanged",
  UserSelfDeafChanged = "userSelfDeafChanged",
  UserPrioritySpeakerChanged = "userPrioritySpeakerChanged",
  UserRecordingChanged = "userRecordingChanged",
  UserCommentChanged = "userCommentChanged",
  UserNameChanged = "userNameChanged",

  Ready = "ready",
}

export default interface MumbleSync {
  socket: Socket;
  manager: MumbleEventManager;
  server: Server;
  users: Map<number, User>;
  channels: Map<number, Channel>;
  api: MumbleApi;
  auth: MumbleAuth;
  recievedUpdate: boolean;

  /** User connected to the server */
  on(event: Events.UserConnected, listener: (user: User) => void): this;
  /** User disconnected to the server */
  on(event: Events.UserDisconnected, listener: (user: User) => void): this;
  /** User state changed, example: channel changed, name changed, muted, deafened... etc etc */
  on(event: Events.UserStateChanged, listener: (user: User, oldUser: User) => void): this;
  /** User sent a message */
  on(event: Events.UserTextMessage, listener: (user: User, message: string) => void): this;
  /** A channel was created */
  on(event: Events.ChannelCreated, listener: (channel: Channel) => void): this;
  /** A channel was removed */
  on(event: Events.ChannelRemoved, listener: (channel: Channel) => void): this;
  /** A channel state changed, example: name changed, description changed... etc etc */
  on(event: Events.ChannelStateChanged, listener: (channel: Channel, oldChannel: Channel) => void): this;
  /** User changed channel */
  on(event: Events.UserChannelChanged, listener: (user: User, newChannel: Channel, oldChannel: Channel) => void): this;
  /** User was muted */
  on(event: Events.UserMuteChanged, listener: (user: User) => void): this;
  /** User was deafened */
  on(event: Events.UserDeafChanged, listener: (user: User) => void): this;
  /** User became suppressed */
  on(event: Events.UserSuppressChanged, listener: (user: User) => void): this;
  /** User muted themselves */
  on(event: Events.UserSelfMuteChanged, listener: (user: User) => void): this;
  /** User deafened themselves */
  on(event: Events.UserSelfDeafChanged, listener: (user: User) => void): this;
  /** User became a priority speaker */
  on(event: Events.UserPrioritySpeakerChanged, listener: (user: User) => void): this;
  /** User started recording */
  on(event: Events.UserRecordingChanged, listener: (user: User) => void): this;
  /** User changed their comment */
  on(event: Events.UserCommentChanged, listener: (user: User) => void): this;
  /** User changed their name */
  on(event: Events.UserNameChanged, listener: (user: User) => void): this;

  /** The sync is ready to use and has data */
  on(event: Events.Ready, listener: () => void): this;

  /** Context action event */
  on(event: string, listener: (date: ContextActionData) => void): this;
}

export default class MumbleSync extends EventEmitter {
  constructor(hostname: string) {
    super();
    this.socket = io(hostname, { path: "/ws/socket.io" });
    this.manager = new MumbleEventManager(this.socket);
    this.api = new MumbleApi(hostname);
    this.auth = new MumbleAuth(this);
    this.recievedUpdate = false;

    this.server = new Server(this);
    this.users = new Map<number, User>();
    this.channels = new Map<number, Channel>();

    this.handleEvents();
    this.on(Events.UserStateChanged, this.stateChangeHandler.bind(this));
  }

  /** Forces an update of the user/channel cache */
  async update() {
    const users = await this.api.getUsers();
    const channels = await this.api.getChannels();

    for (const user of users) {
      this.users.set(user.userid, new User(user, this));
    }

    for (const channel of channels) {
      this.channels.set(channel.id, new Channel(channel, this));
    }
  }

  private async handleEvents() {
    // users
    this.manager.on(ManagerEvents.UserConnected, (state) => {
      const user = new User(state, this);
      this.users.set(state.userid, user);
      this.emit(Events.UserConnected, user);
    });

    this.manager.on(ManagerEvents.UserDisconnected, (state) => {
      const user = this.users.get(state.userid);
      this.users.delete(state.userid);
      this.emit(Events.UserDisconnected, user);
    });

    this.manager.on(ManagerEvents.UserStateChanged, (state) => {
      const oldUser = this.users.get(state.userid);
      const user = new User(state, this);
      this.users.set(state.userid, user);
      this.emit(Events.UserStateChanged, user, oldUser);
    });

    this.manager.on(ManagerEvents.UserTextMessage, (state, message) => {
      const user = this.users.get(state.userid);
      this.emit(Events.UserTextMessage, user, message);
    });

    // Channels
    this.manager.on(ManagerEvents.ChannelCreated, (state) => {
      const channel = new Channel(state, this);
      this.channels.set(state.id, channel);
      this.emit(Events.ChannelCreated, channel);
    });

    this.manager.on(ManagerEvents.ChannelRemoved, (state) => {
      const channel = this.channels.get(state.id);
      this.channels.delete(state.id);
      this.emit(Events.ChannelRemoved, channel);
    });

    this.manager.on(ManagerEvents.ChannelStateChanged, (state) => {
      const oldChannel = this.channels.get(state.id);
      const channel = new Channel(state, this);
      this.channels.set(state.id, channel);
      this.emit(Events.ChannelStateChanged, channel, oldChannel);
    });

    // Misc
    this.manager.on(ManagerEvents.Context, (context) => {
      const action = context.action;
      const issuer = this.users.get(context.user.userid);
      const channel = this.channels.get(context.channel);
      const user = [...this.users.values()].find((u) => u.session === context.session);
      this.emit(action, { action, issuer, user, channel });
    });

    this.manager.on(ManagerEvents.Update, (update) => {
      for (const user of update.users) {
        this.users.set(user.userid, new User(user, this));
      }

      for (const channel of update.channels) {
        this.channels.set(channel.id, new Channel(channel, this));
      }

      if (!this.recievedUpdate) {
        this.recievedUpdate = true;
        this.emit(Events.Ready);
      }
    });
  }

  private stateChangeHandler(user: User, oldUser: User) {
    if (user.channel !== oldUser.channel) {
      this.emit(Events.UserChannelChanged, user, user.getChannel(), oldUser.getChannel());
    }

    if (user.mute !== oldUser.mute) {
      this.emit(Events.UserMuteChanged, user);
    }

    if (user.deaf !== oldUser.deaf) {
      this.emit(Events.UserDeafChanged, user);
    }

    if (user.suppress !== oldUser.suppress) {
      this.emit(Events.UserSuppressChanged, user);
    }

    if (user.selfMute !== oldUser.selfMute) {
      this.emit(Events.UserSelfMuteChanged, user);
    }

    if (user.selfDeaf !== oldUser.selfDeaf) {
      this.emit(Events.UserSelfDeafChanged, user);
    }

    if (user.prioritySpeaker !== oldUser.prioritySpeaker) {
      this.emit(Events.UserPrioritySpeakerChanged, user);
    }

    if (user.recording !== oldUser.recording) {
      this.emit(Events.UserRecordingChanged, user);
    }

    if (user.comment !== oldUser.comment) {
      this.emit(Events.UserCommentChanged, user);
    }

    if (user.name !== oldUser.name) {
      this.emit(Events.UserNameChanged, user);
    }
  }
}
