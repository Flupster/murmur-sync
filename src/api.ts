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
  async getServer(): Promise<Server> {
    const response = await this.instance.get("/");
    return response.data;
  }

  async getTree(): Promise<Tree> {
    const response = await this.instance.get("/tree");
    return response.data;
  }

  async getBans(): Promise<MumbleBan[]> {
    const response = await this.instance.get("/bans");
    return Object.values(response.data);
  }

  // User stuff
  async getUsers(): Promise<MumbleUser[]> {
    const response = await this.instance.get("/users");
    return Object.values(response.data);
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
    return response.data;
  }

  async addUserToGroup(session: number, channel: number, group: string) {
    return this.instance.postForm(`/users/${session}/groups/app`, { channel, group });
  }

  async removeUserFromGroup(session: number, channel: number, group: string) {
    return this.instance.postForm(`/users/${session}/groups/remove`, { channel, group });
  }

  // Channel stuff
  async getChannels(): Promise<MumbleChannel[]> {
    const response = await this.instance.get("/channels");
    return Object.values(response.data);
  }

  async updateChannelState(id: number, channel: Partial<MumbleChannel>) {
    return this.instance.post(`/channels/${id}`, channel);
  }

  async createChannel(name: string, parent: number): Promise<MumbleChannel> {
    const response = await this.instance.postForm("/channels", { name, parent });
    return response.data;
  }

  async removeChannel(id: number) {
    return this.instance.delete(`/channels/${id}`);
  }

  async sendChannelMessage(channel: number, message: string, tree = false) {
    return this.instance.postForm(`/message/channel`, { channel, tree, message });
  }

  async getACL(id: number): Promise<MumbleACL> {
    const response = await this.instance.get(`/acl/${id}`);
    return response.data;
  }

  // Auth stuff
  async getAuthUsers(): Promise<AuthUser[]> {
    const response = await this.instance.get("/auth");
    return Object.values(response.data);
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
    return response.data;
  }

  async getDefaultConfig() {
    const response = await this.instance.get("/conf/default");
    return response.data;
  }

  async getConfKey(key: string) {
    const response = await this.instance.get(`/conf/${key}`);
    return response.data;
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
