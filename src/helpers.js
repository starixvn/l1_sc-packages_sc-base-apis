import { helpers } from "sc-common";

export const isDisabledAccountResult = (result) => result.errorCode === 2002;

export const isErrorResult = (result) => result.errorCode !== 0;

export const getFailedResponse = (response, extraInfo) => {
    const isKickedOut = isDisabledAccountResult(response);
    const kickOutResponse = {
        kickedOut: {
            message: helpers.noticeHelper.closeAccount,
            isDisabledAccount: true,
        },
    };
    const otherResponse = {
        apiError: {
            message: `${response.errorMessage} (${response.errorCode})`,
            ...extraInfo,
        },
    };

    return apiResult({ isOk: false, response: isKickedOut ? kickOutResponse : otherResponse });
};

export const apiResult = ({ isOk, response }) => ({ isOk, response });
