# sc-base-apis

Saba API client wrapper for Node.js game services.

## Installation

```sh
npm install sc-base-apis
```

## How to use

- Import `init` into your app's startup code, then call it to initialize the APIClient.

```js
import { init } from "sc-base-apis";

init({
  enabledApi: true,
  apiUrl: "http://api.lumigame.com",
  authUrl: "http://auth.lumigame.com",
  client: {
    id: "game-server",
    secret: "gameserver@20luminet&",
  },
  useAuthenticate: true,
  requestTimeout: 10000,
  placeBetTimeout: 4500,
  enabledApiLogs: true,
});
```

- Import any of APIClient's API, and use it

```js
import { getBalance } from "sc-base-apis";

const balance = getBalance(user).red;
```
