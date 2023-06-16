import EventEmitter from "events";
import { Socket } from "socket.io-client";

export enum Events {
  AuthAttempt = "authAttempt",
  Update = "update",
  Context = "context",
  UserConnected = "userConnected",
  UserStateChanged = "userStateChanged",
  UserDisconnected = "userDisconnected",
  UserTextMessage = "userTextMessage",
  ChannelCreated = "channelCreated",
  ChannelStateChanged = "channelStateChanged",
  ChannelRemoved = "channelRemoved",
}

export default interface MumbleEventManager {
  socket: Socket;
  on(event: Events.AuthAttempt, listener: (username: string, password: string) => void): this;
  on(event: Events.Update, listener: (update: MumbleUpdate) => void): this;
  on(event: Events.Context, listener: (event: ContextAction) => void): this;
  on(event: Events.UserConnected, listener: (user: MumbleUser) => void): this;
  on(event: Events.UserDisconnected, listener: (user: MumbleUser) => void): this;
  on(event: Events.UserStateChanged, listener: (user: MumbleUser) => void): this;
  on(event: Events.UserTextMessage, listener: (user: MumbleUser, message: string) => void): this;
  on(event: Events.ChannelCreated, listener: (channel: MumbleChannel) => void): this;
  on(event: Events.ChannelRemoved, listener: (channel: MumbleChannel) => void): this;
  on(event: Events.ChannelStateChanged, listener: (channel: MumbleChannel) => void): this;
}

declare interface MumbleUpdate {
  users: MumbleUser[];
  channels: MumbleChannel[];
}

declare interface MumbleEvent {
  state: MumbleUser | MumbleChannel;
  message?: string;
}

export default class MumbleEventManager extends EventEmitter {
  constructor(socket: Socket) {
    super();
    socket.on(Events.AuthAttempt, this.authAttempt.bind(this));
    socket.on(Events.Update, this.update.bind(this));
    socket.on(Events.Context, this.context.bind(this));

    socket.on(Events.UserConnected, this.userConnected.bind(this));
    socket.on(Events.UserStateChanged, this.userStateChanged.bind(this));
    socket.on(Events.UserDisconnected, this.userDisconnected.bind(this));
    socket.on(Events.UserTextMessage, this.userTextMessage.bind(this));
    socket.on(Events.ChannelCreated, this.channelCreated.bind(this));
    socket.on(Events.ChannelRemoved, this.channelRemoved.bind(this));
    socket.on(Events.ChannelStateChanged, this.channelStateChanged.bind(this));
  }

  private authAttempt(username: string, password: string) {
    this.emit(Events.AuthAttempt, username, password);
  }

  private update(event: MumbleUpdate) {
    this.emit(Events.Update, event);
  }

  private context(event: ContextAction) {
    this.emit(Events.Context, event);
  }

  private userConnected(event: MumbleEvent) {
    this.emit(Events.UserConnected, event.state as MumbleUser);
  }

  private userStateChanged(event: MumbleEvent) {
    this.emit(Events.UserStateChanged, event.state as MumbleUser);
  }

  private userDisconnected(event: MumbleEvent) {
    this.emit(Events.UserDisconnected, event.state as MumbleUser);
  }

  private userTextMessage(event: MumbleEvent) {
    this.emit(Events.UserTextMessage, event.state as MumbleUser, event.message);
  }

  private channelCreated(event: MumbleEvent) {
    this.emit(Events.ChannelCreated, event.state as MumbleChannel);
  }

  private channelRemoved(event: MumbleEvent) {
    this.emit(Events.ChannelRemoved, event.state as MumbleChannel);
  }

  private channelStateChanged(event: MumbleEvent) {
    this.emit(Events.ChannelStateChanged, event.state as MumbleChannel);
  }
}
