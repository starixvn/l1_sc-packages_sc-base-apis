import APIClient from "sc-api-client";
import { logger } from "sc-common";

let apiClient = null;
let apiSettings = null;

const errors = {
    placeBetFailed: {
        errorCode: "SB1900",
    },
    endGameFailed: {
        errorCode: "SB1901",
    },
    getBalanceFailed: {
        errorCode: "SB1902",
    },
    enterPortalFailed: {
        errorCode: `SB1903`,
    },
    hitJackpotFailed: {
        errorCode: "SB1904",
    },
    accountClosed: {
        errorCode: "2002",
    },
};
const warningErrorCodes = [3003, 3004, 3006, 3007, 3008, 3009, 3014, 2002, 2005, 3010, 3013, 3002];
const successfulResponse = {
    errorCode: "0",
    errorMessage: "",
};

const isError = (response) => (response?.result?.errorCode ?? 0) !== 0;

const getLogLevel = (response) => {
    if (isError(response)) {
        return warningErrorCodes.includes(response.result.errorCode) ? "warning" : "error";
    }

    return "info";
};

export const init = async (settings) => {
    apiSettings = settings;
    apiClient = new APIClient(settings, logger);

    await apiClient.autoUpdateToken();
};

export const getBalance = async (getBalanceParams, beforeMessage) => {
    try {
        const response = await apiClient.player.balance(getBalanceParams);

        if (isError(response)) {
            logger.logAfterSendToApi(
                "Get Balance",
                getBalanceParams,
                response,
                beforeMessage,
                getLogLevel(response),
                apiSettings.enabledApiLogs
            );
        }

        const result = response.result;

        result.red = result.balance;

        return result;
    } catch (error) {
        logger.logAfterSendToApi("Error Get Balance", getBalanceParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);

        return errors.getBalanceFailed;
    }
};

export const placeBet = async (placeBetParams = "", beforeMessage = "") => {
    try {
        const response = await apiClient.player.placeBet(placeBetParams, {
            requestTimeout: apiSettings.placeBetTimeout,
        });

        if (isError(response)) {
            logger.logAfterSendToApi(
                "Place Bet",
                placeBetParams,
                response,
                beforeMessage,
                getLogLevel(response),
                apiSettings.enabledApiLogs
            );
        }

        return response.result;
    } catch (error) {
        logger.logAfterSendToApi("Error Place Bet", placeBetParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);
        return errors.placeBetFailed;
    }
};

export const endGame = async (endGameParams, beforeMessage) => {
    try {
        const response = await apiClient.player.endGame(endGameParams);

        if (isError(response)) {
            logger.logAfterSendToApi("End Game", endGameParams, response, beforeMessage, getLogLevel(response), apiSettings.enabledApiLogs);
        }

        return response.result;
    } catch (error) {
        logger.logAfterSendToApi("Error End Game", endGameParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);

        return errors.endGameFailed;
    }
};

export const notifyLogin = async (notifyLoginParams, beforeMessage) => {
    try {
        const response = await apiClient.player.notifyLogin(notifyLoginParams);

        if (isError(response)) {
            logger.logAfterSendToApi(
                "Notify Login",
                notifyLoginParams,
                response,
                beforeMessage,
                getLogLevel(response),
                apiSettings.enabledApiLogs
            );
        }

        return response.result;
    } catch (error) {
        logger.logAfterSendToApi("Error Notify Login", notifyLoginParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);

        return errors.enterPortalFailed;
    }
};

export const verifyToken = async (verifyTokenParams) => {
    try {
        return await apiClient.auth.verifyToken(verifyTokenParams);
    } catch (ex) {
        logger.logError(ex);

        return errors.enterPortalFailed;
    }
};

export const hitJackpot = async (hitJackpotParams = "", beforeMessage = "") => {
    try {
        const response = await apiClient.player.hitJackpot(hitJackpotParams, {
            requestTimeout: apiSettings.hitJackpotTimeout,
        });

        if (isError(response)) {
            logger.logAfterSendToApi(
                "Hit Jackpot",
                hitJackpotParams,
                response,
                beforeMessage,
                getLogLevel(response),
                apiSettings.enabledApiLogs
            );

            return errors.hitJackpotFailed;
        }

        return response.result;
    } catch (error) {
        logger.logAfterSendToApi("Error Hit Jackpot", hitJackpotParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logCritical(error);

        return errors.hitJackpotFailed;
    }
};

export const getBetLimit = async (getbetLimitParams, beforeMessage) => {
    try {
        const response = await apiClient.player.getBetLimit(getbetLimitParams);

        if (isError(response)) {
            logger.logAfterSendToApi(
                "Get Bet Limit",
                getbetLimitParams,
                response,
                beforeMessage,
                getLogLevel(response),
                apiSettings.enabledApiLogs
            );
        }

        return response.result;
    } catch (error) {
        logger.logAfterSendToApi("Error Get Bet Limit ", getbetLimitParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);

        return errors.enterPortalFailed;
    }
};
