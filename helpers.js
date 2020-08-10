import { helpers } from 'sc-common';

export const isSSOAccount = (session) => {
    return !!session.siteId;
};

export const isDisabledAccountResult = (result) => {
    return result.errorCode == 2002;
};

export const isErrorResult = (result) => {
    return result.errorCode != 0;
};

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

    return apiResult({ isOk: false, responseData: isKickedOut ? kickOutResponse : otherResponse });
};

export const apiResult = ({ isOk, responseData }) => {
    return { isOk, response: responseData };
};
