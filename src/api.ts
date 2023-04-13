import axios, { AxiosInstance } from "axios";
import http from "node:http";
import https from "node:https";
import { AuthUser } from "./auth";

export enum ContextActionScope {
  ServerContext = 1,
  ChannelContext = 2,
  UserContext = 4,
}

export default class MumbleApi {
  instance: AxiosInstance;
  constructor(hostname: string) {
    this.instance = this.createInstance(hostname);
  }

  // Server stuff
  async getServer() {
    const response = await this.instance.get("/");
    return response.data as Server;
  }

  async getTree() {
    const response = await this.instance.get("/tree");
    return response.data as Tree;
  }

  async getBans() {
    const response = await this.instance.get("/bans");
    return Object.values(response.data) as MumbleBan[];
  }

  // User stuff
  async getUsers() {
    const response = await this.instance.get("/users");
    return Object.values(response.data) as MumbleUser[];
  }

  async updateUserState(session: number, user: Partial<MumbleUser>) {
    return this.instance.post(`/users/${session}`, user);
  }

  async sendUserMessage(session: number, message: string) {
    return this.instance.postForm(`/message/user`, { session, message });
  }

  async kickUser(session: number, reason: string) {
    return this.instance.delete(`/users/${session}`, { data: { reason } });
  }

  async getCertificateList(session: number) {
    const response = await this.instance.get(`/users/${session}/certificateList`);
    return response.data as string;
  }

  async addUserToGroup(session: number, channel: number, group: string) {
    return this.instance.postForm(`/users/${session}/groups/add`, { channel, group });
  }

  async removeUserFromGroup(session: number, channel: number, group: string) {
    return this.instance.postForm(`/users/${session}/groups/remove`, { channel, group });
  }

  // Channel stuff
  async getChannels() {
    const response = await this.instance.get("/channels");
    return Object.values(response.data) as MumbleChannel[];
  }

  async updateChannelState(id: number, channel: Partial<MumbleChannel>) {
    return this.instance.post(`/channels/${id}`, channel);
  }

  async createChannel(name: string, parent: number) {
    const response = await this.instance.postForm("/channels", { name, parent });
    return response.data as MumbleChannel;
  }

  async removeChannel(id: number) {
    return this.instance.delete(`/channels/${id}`);
  }

  async sendChannelMessage(channel: number, message: string, tree = false) {
    return this.instance.postForm(`/message/channel`, { channel, tree, message });
  }

  async getACL(id: number) {
    const response = await this.instance.get(`/acl/${id}`);
    return response.data as MumbleACL;
  }

  // Auth stuff
  async getAuthUsers() {
    const response = await this.instance.get("/auth");
    return Object.values(response.data) as AuthUser[];
  }

  async updateAuthUser(users: AuthUser[]) {
    return this.instance.post("/auth", users);
  }

  async deleteAuthUser(user: AuthUser) {
    return this.instance.delete(`/auth`, { params: { username: user.username } });
  }

  // Config stuff
  async getConfig() {
    const response = await this.instance.get("/conf");
    return response.data as Partial<Config>;
  }

  async getDefaultConfig() {
    const response = await this.instance.get("/conf/default");
    return response.data as Partial<Config>;
  }

  async getConfKey(key: string) {
    const response = await this.instance.get(`/conf/${key}`);
    return response.data as string;
  }

  async setConfKey(key: string, value: string) {
    return this.instance.postForm(`/conf/${key}`, { value });
  }

  // Other stuff
  async sendWelcomeMessage(sessionids: number[]) {
    return this.instance.post("/sendwelcomemessage", { sessionids }).catch((e) => {
      if (e.response.status === 500) {
        console.error("sendWelcomeMessage is not supported on this server");
      }
    });
  }

  async addContextAction(session: number, action: string, text: string, scope: ContextActionScope) {
    return this.instance.post("/context", { session, action, text, scope });
  }

  async setSuperuserPassword(password: string) {
    return this.instance.postForm(`/setSuperuserPassword`, { password });
  }

  async getListenerVolumeAdjustment(session: number, channel: number) {
    const response = await this.instance.get(`/listenervolumeadjustment/${channel}/${session}`);
    return response.data as number;
  }

  async setListenerVolumeAdjustment(session: number, channel: number, adjustment: number) {
    return this.instance.postForm(`/listenervolumeadjustment/${channel}/${session}`, { adjustment });
  }

  createInstance(hostname: string) {
    return axios.create({
      baseURL: hostname,
      timeout: 1000,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
      ...axios.defaults,
    });
  }
}
