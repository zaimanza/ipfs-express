/**
 * Arguments:
 *     homeserverUrl: the base url of the homeserver (e.g. "https://matrix.org")
 *
 *     apiEndpoint: the API endpoint being used (e.g.
 *        "/_matrix/client/v3/account/password")
 *
 *     loginType: the loginType being attempted (e.g. "m.login.recaptcha")
 *
 *     sessionID: the session ID given by the homeserver in earlier requests
 *
 *     onComplete: a callback which will be called with the results of the request
 */
const unknownLoginType = ({ homeserverUrl, apiEndpoint, loginType, sessionID, onComplete }) => {
    var popupWindow;

    var eventListener = function (ev) {
        // check it's the right message from the right place.
        if (ev.data !== "authDone" || ev.origin !== homeserverUrl) {
            return;
        }

        // close the popup
        popupWindow.close();
        window.removeEventListener("message", eventListener);

        // repeat the request
        var requestBody = {
            auth: {
                session: sessionID,
            },
        };

        request({
            method: 'POST', url: apiEndpoint, json: requestBody,
        }, onComplete);
    };

    window.addEventListener("message", eventListener);

    var url = homeserverUrl +
        "/_matrix/client/v3/auth/" +
        encodeURIComponent(loginType) +
        "/fallback/web?session=" +
        encodeURIComponent(sessionID);

    popupWindow = window.open(url);
}