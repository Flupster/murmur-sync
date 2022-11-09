# Murmur Sync Client

Murmur Sync is a server client tool to bridge the gap between Mumbles ICE interface and Javasript

ICE currently does not support two way connections in Javasript which prevents javascript from using Mumble features like `Authenticators`, `ContextActions` and `EventCallbacks`

The server written in python gives access to these features via a JSON API and Socket.IO socket

Murmur Sync Server has a built in authenticator that can be modified in the client

If no password is set on the Murmur server then the authenticator is unused

---

## Events

| Event Name                 |
| -------------------------- |
| Ready                      |
| UserConnected              |
| UserStateChanged           |
| UserDisconnected           |
| UserTextMessage            |
| ChannelCreated             |
| ChannelStateChanged        |
| ChannelRemoved             |
| UserChannelChanged         |
| UserMuteChanged            |
| UserDeafChanged            |
| UserSuppressChanged        |
| UserSelfMuteChanged        |
| UserSelfDeafChanged        |
| UserPrioritySpeakerChanged |
| UserRecordingChanged       |
| UserCommentChanged         |
| UserNameChanged            |

Any other event is a context action which is user defined

---

## Examples

### General usage

Setting any User/Channel/Server variable can be awaited

```ts
import MurmurSync, { Events } from "murmur-sync-client";

const sync = new MurmurSync("http://127.0.0.1:8000");

sync.on(Events.Ready, () => {
  console.log("Connected and recieved data!");
});

sync.on(Events.UserConnected, (user) => {
  console.log(user.name, "Connected");
});

sync.on(Events.UserTextMessage, (user, message) => {
  if (message.startsWith("!name ")) {
    const name = message.split("!name ").slice(1).join(" ");
    user.setName(name);
  }
});
```

---

### Context action usage

ContextActionScope is either User, Channel or Server

When a context menu (right click) is opened on that type then additional options become availble to
the user

Use the event emitter on MumbleSync to catch the context menu action

```ts
sync.on(Events.UserConnected, (user) => {
  // When a user connects we add a context action to them
  user.addContextAction("moveme", "Move Me Here", ContextActionScope.ChannelContext);
});

// All context actions are emitted as an event
sync.on("moveme", (data) => {
  // Move the user to the channel the context action was clicked on
  data.issuer.setChannel(data.channel);
});
```

---

### Auth


```ts
const user = {
  username: "admin",
  displayName: "Admin",
  password: "test",
  id: 1,
  roles: ["admin"],
};

sync.auth.getUsers().then((users) => console.log(users));
sync.auth.updateUsers([user]);
sync.auth.deleteUser(user);
```
