import * as apiClient from './api-client.js';
import { endGame, init as initEndGame } from './end-game.js';
import { getBalance, init as initGetBalance } from './get-balance.js';
import { init as initPlaceBet, placeBet } from './place-bet.js';

const init = (settings) => {
    apiClient.init(settings);
    initGetBalance(settings);
    initPlaceBet(settings);
    initEndGame(settings);
};

export { init, getBalance, placeBet, endGame };
