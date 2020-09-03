import APIClient from "sc-api-client";
import { logger } from "sc-common";

let apiClient = null;
let apiSettings = null;

const errors = {
    placeBetFailed: {
        errorCode: "SB1900",
        errorMessage: "Đặt cược không thành công.",
    },
    endGameFailed: {
        errorCode: "SB1901",
        errorMessage: "Phiên chơi bị lỗi. Vui lòng liên hệ bộ phận CSKH để được hỗ trợ.",
    },
    getBalanceFailed: {
        errorCode: "SB1902",
        errorMessage: "Không thể cập nhật số tiền trong tài khoản.",
    },
    enterPortalFailed: {
        errorCode: `SB1903`,
        errorMessage: "Đã xảy ra lỗi. Vui lòng liên hệ bộ phận CSKH để đươc hỗ trợ.",
    },
    accountClosed: {
        errorCode: "2002",
        errorMessage: "Tài khoản của bạn đã bị khoá.",
    },
};
const warningErrorCodes = [3003, 3004, 3006, 3007, 3008, 3009, 3014, 2002, 2005, 3010, 3013, 3002];

const isError = (response) => (response?.result?.errorCode ?? 0) !== 0;

const getLogLevel = (response) => {
    if (isError(response)) {
        return warningErrorCodes.includes(response.result.errorCode) ? "warning" : "error";
    }

    return "info";
};

export const init = (settings) => {
    apiSettings = settings;
    apiClient = new APIClient(settings, logger);
    apiClient.autoUpdateToken();
};

export const getBalance = async (getBalanceParams, beforeMessage) => {
    try {
        const response = await apiClient.member.balance(getBalanceParams);

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
        const response = await apiClient.member.placeBet(placeBetParams, {
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
        const response = await apiClient.member.endGame(endGameParams);

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
        const response = await apiClient.member.notifyLogin(notifyLoginParams);

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
    } catch (error) {
        logger.logAfterSendToApi("Error Notify Login", notifyLoginParams, error, beforeMessage, "error", apiSettings.enabledApiLogs);
        logger.logError(error);

        return errors.enterPortalFailed;
    }
};

export const verifyToken = async (verifyTokenParams) => {
    try {
        const result = await apiClient.auth.verifyToken(verifyTokenParams);

        return result;
    } catch (ex) {
        logger.logError(ex);

        return null;
    }
};
