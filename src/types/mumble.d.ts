declare type MumbleUser = {
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
  channel: MumbleChannel["id"];
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
};

declare type MumbleChannel = {
  /** Channel ID. This is unique per channel, and the root channel is always id 0. */
  id: number;
  /** Name of the channel. There can not be two channels with the same parent that has the same name. */
  name: string;
  /** ID of parent channel, or -1 if this is the root channel. */
  parent: number;
  /** List of id of linked channels. */
  links: MumbleChannel["id"][];
  /** Description of channel. Shown as tooltip for this channel. */
  description: string;
  /** Channel is temporary, and will be removed when the last user leaves it. */
  temporary: boolean;
  /** Position of the channel which is used in Client for sorting. */
  position: number;
};

declare type TextMessage = {
  /** Sessions (connected users) who were sent this message. */
  sessions: MumbleUser["session"][];
  /** Channels who were sent this message. */
  channels: MumbleChannel["id"][];
  /** Trees of channels who were sent this message. */
  tree: Tree;
  /** The contents of the message. */
  text: string;
};

declare type MumbleACL = {
  /** List of ACLs on the channel. This will include inherited ACLs. */
  "0": MumbleACLList;
  /** List of groups on the channel. This will include inherited groups. */
  "1": MumbleGroupList;
  /** Does this channel inherit ACLs from the parent channel? */
  "2": boolean;
};

declare type MumbleACLList = {
  /** Does the ACL apply to this channel? */
  applyHere: boolean;
  /** Does the ACL apply to subchannels? */
  applySubs: boolean;
  /** Is this ACL inherited from a parent channel? Read-only. */
  inherited: boolean;
  /** ID of user this ACL applies to. -1 if using a group name. */
  userid: MumbleUser["userid"];
  /** Group this ACL applies to. Blank if using userid. */
  group: string;
  /** Binary mask of privileges to allow. */
  allow: number;
  /** Binary mask of privileges to deny. */
  deny: number;
};

declare type MumbleGroupList = {
  /** Group name */
  name: string;
  /** Is this group inherited from a parent channel? Read-only. */
  inherited: boolean;
  /** Does this group inherit members from parent channels? */
  inherit: boolean;
  /** Can subchannels inherit members from this group? */
  inheritable: boolean;
  /** List of users to add to the group. */
  add: MumbleUser["userid"];
  /** List of inherited users to remove from the group. */
  remove: MumbleUser["userid"];
  /** Current members of the group, including inherited members. Read-only. */
  members: MumbleUser["userid"];
};

declare type MumbleBan = {
  /** Address to ban. */
  address: number[];
  /** Number of bits in ban to apply. */
  bits: number;
  /** Username associated with ban. */
  name: string;
  /** Hash of banned user. */
  hash: string;
  /** Reason for ban. */
  reason: string;
  /** Date ban was applied in unix time format. */
  start: number;
  /** Duration of ban. */
  duration: number;
};

declare type MumbleLogEntry = {
  /** Timestamp in UNIX time_t */
  timestamp: number;
  /** The log message. */
  txt: string;
};

declare type EventMessage = {
  /** Event type from the ServerCallback  */
  type: string;
  /** New state of the object */
  state: object;
  /** The message sent */
  message: string | null;
};

declare interface Server {
  /** is the server is running */
  running: boolean;
  /** total connected clients */
  users: number;
  /** total uptime in seconds */
  uptime_seconds: number;
  /** length of the log */
  log_length: number;
  /** version */
  version: string;
}

declare interface Tree {
  c: MumbleChannel;
  children: Tree[];
  users: MumbleUser[];
}

declare interface ContextAction {
  /** Action to be performed */
  action: string;
  /** User which initiated the action */
  user: MumbleUser;
  /** If nonzero, session of target user */
  session: MumbleUser["session"];
  /** If not -1, id of target channel */
  channel: MumbleChannel["id"];
}

declare interface Config {
  [key: string]: string;
  allowhtml: string;
  bandwidth: string;
  bonjour: string;
  certificate: string;
  certrequired: string;
  certrequired: string;
  channelcountlimit: string;
  channelname: string;
  channelnestinglimit: string;
  defaultchannel: string;
  forceExternalAuth: string;
  host: string;
  kdfiterations: string;
  legacypasswordhash: string;
  obfuscate: string;
  opusthreshold: string;
  password: string;
  port: string;
  registerhostname: string;
  registerlocation: string;
  registername: string;
  registerpassword: string;
  registerurl: string;
  rememberchannel: string;
  rememberchannelduration: string;
  sslCiphers: string;
  sslDHParams: string;
  suggestpositional: string;
  suggestpushtotalk: string;
  suggestversion: string;
  textmessagelength: string;
  timeout: string;
  username: string;
  users: string;
  welcometext: string;
  welcometextfile: string;
}

declare interface UserInfo {
  UserName: string;
  UserLastActive: string;
  UserEmail?: string;
  UserComment?: string;
  UserHash?: string;
  UserPassword?: string;
  UserKDFIterations?: string;
}
