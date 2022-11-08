import MumbleSync from "../sync";

export default interface Channel extends MumbleChannel {
  /** Channel ID. This is unique per channel, and the root channel is always id 0. */
  id: number;
  /** Name of the channel. There can not be two channels with the same parent that has the same name. */
  name: string;
  /** ID of parent channel, or -1 if this is the root channel. */
  parent: number;
  /** List of id of linked channels. */
  links: number[];
  /** Description of channel. Shown as tooltip for this channel. */
  description: string;
  /** Channel is temporary, and will be removed when the last user leaves it. */
  temporary: boolean;
  /** Position of the channel which is used in Client for sorting. */
  position: number;
}

export default class Channel implements MumbleChannel {
  constructor(data: MumbleChannel, private sync: MumbleSync) {
    this.sync = sync;
    Object.assign(this, data);
  }

  async setName(name: string) {
    return this.sync.api.updateChannelState(this.id, { name });
  }

  async setDescription(description: string) {
    return this.sync.api.updateChannelState(this.id, { description });
  }

  async setPosition(position: number) {
    return this.sync.api.updateChannelState(this.id, { position });
  }

  async setParent(parent: Channel) {
    return this.sync.api.updateChannelState(this.id, { parent: parent.id });
  }

  // Channel links handling
  async setLinks(links: number[]) {
    return this.sync.api.updateChannelState(this.id, { links });
  }

  async addLink(channel: Channel) {
    this.links.push(channel.id);
    return this.setLinks(this.links);
  }

  async removeLink(channel: Channel) {
    this.links.splice(this.links.indexOf(channel.id), 1);
    return this.setLinks(this.links);
  }

  async createSubChannel(name: string) {
    return this.sync.api.createChannel(name, this.id);
  }

  async delete() {
    return this.sync.api.removeChannel(this.id);
  }
}
