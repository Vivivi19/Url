const COGNITO_DOMAIN = "https://us-east-117frq41ty.auth.us-east-1.amazoncognito.com";

const CLIENT_ID = "3mo3d1ebm7e3e7jdsqltsf8iao";

const REDIRECT_URI =
    "http://127.0.0.1:5500/Dashboard.html";

const LOGOUT_URI =
    "http://127.0.0.1:5500/Login.html";

const REGION = "us-east-1";


async function signUpUser(name, email, password) {

    const response = await fetch(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "X-Amz-Target":
                    "AWSCognitoIdentityProviderService.SignUp"
            },

            body: JSON.stringify({
                ClientId: CLIENT_ID,

                Username: email,

                Password: password,

                UserAttributes: [
                    {
                        Name: "email",
                        Value: email
                    },
                    {
                        Name: "name",
                        Value: name
                    }
                ]
            })
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to create account."
        );
    }


    return data;
}
async function confirmUserSignUp(email, confirmationCode) {

    const response = await fetch(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "X-Amz-Target":
                    "AWSCognitoIdentityProviderService.ConfirmSignUp"
            },

            body: JSON.stringify({
                ClientId: CLIENT_ID,
                Username: email,
                ConfirmationCode: confirmationCode
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to verify your account."
        );
    }

    return data;
}
async function resendVerificationCode(email) {

    const response = await fetch(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "X-Amz-Target":
                    "AWSCognitoIdentityProviderService.ResendConfirmationCode"
            },

            body: JSON.stringify({
                ClientId: CLIENT_ID,
                Username: email
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to resend verification code."
        );
    }

    return data;
}
async function loginUser(email, password) {
    const response = await fetch(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "X-Amz-Target":
                    "AWSCognitoIdentityProviderService.InitiateAuth"
            },
            body: JSON.stringify({
                AuthFlow: "USER_PASSWORD_AUTH",
                ClientId: CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to log in."
        );
    }

    // Save authentication tokens
    localStorage.setItem(
        "accessToken",
        data.AuthenticationResult.AccessToken
    );

    localStorage.setItem(
        "idToken",
        data.AuthenticationResult.IdToken
    );

    localStorage.setItem(
        "refreshToken",
        data.AuthenticationResult.RefreshToken
    );

    return data;
}