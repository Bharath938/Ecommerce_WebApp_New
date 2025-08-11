const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID || "Your-PayPal-Client-Id";
  let clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || "Your-PayPal-Client-Secret";

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
