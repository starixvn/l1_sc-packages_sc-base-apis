import * as apiClient from './api-client.js';
import { endGame } from './end-game.js';
import { getBalance } from './get-balance.js';
import { placeBet } from './place-bet.js';

const init = (settings) => {
    apiClient.init(settings);
};

export { init, getBalance, placeBet, endGame };
