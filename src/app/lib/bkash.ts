import config from "../config/index.js";

type TBkashGrantTokenResponse = {
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  statusCode?: string;
  statusMessage?: string;
};

type TBkashCreatePaymentPayload = {
  amount: number;
  merchantInvoiceNumber: string;
};

type TBkashCreatePaymentResponse = {
  paymentID?: string;
  bkashURL?: string;

  callbackURL?: string;
  successCallbackURL?: string;
  failureCallbackURL?: string;
  cancelledCallbackURL?: string;

  amount?: string;
  currency?: string;
  intent?: string;

  statusCode?: string;
  statusMessage?: string;
};

type TBkashExecutePaymentResponse = {
  paymentID?: string;
  trxID?: string;

  transactionStatus?: string;

  amount?: string;
  currency?: string;

  paymentExecuteTime?: string;

  statusCode?: string;
  statusMessage?: string;
};

let cachedToken: {
  token: string;
  expiresAt: number;
} | null = null;

const grantToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/token/grant`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        username: config.bkash_username,

        password: config.bkash_password,
      },

      body: JSON.stringify({
        app_key: config.bkash_app_key,

        app_secret: config.bkash_app_secret,
      }),
    },
  );

  const data = (await response.json()) as TBkashGrantTokenResponse;

  if (!response.ok || !data.id_token) {
    throw new Error(data.statusMessage || "Failed to generate bKash token");
  }

  const expiresIn = Number(data.expires_in) || 3600;

  cachedToken = {
    token: data.id_token,

    // refresh a little before actual expiry
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  };

  return data.id_token;
};

const createPayment = async (
  payload: TBkashCreatePaymentPayload,
): Promise<TBkashCreatePaymentResponse> => {
  const token = await grantToken();

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",

        Authorization: token,

        "X-APP-Key": config.bkash_app_key,
      },

      body: JSON.stringify({
        mode: "0011",

        payerReference: payload.merchantInvoiceNumber,

        callbackURL: config.bkash_callback_url,

        amount: payload.amount.toFixed(2),

        currency: "BDT",

        intent: "sale",

        merchantInvoiceNumber: payload.merchantInvoiceNumber,
      }),
    },
  );

  const data = (await response.json()) as TBkashCreatePaymentResponse;

  if (!response.ok || !data.paymentID) {
    throw new Error(data.statusMessage || "Failed to create bKash payment");
  }

  return data;
};

const executePayment = async (
  paymentId: string,
): Promise<TBkashExecutePaymentResponse> => {
  const token = await grantToken();

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",

        Authorization: token,

        "X-APP-Key": config.bkash_app_key,
      },

      body: JSON.stringify({
        paymentID: paymentId,
      }),
    },
  );

  const data = (await response.json()) as TBkashExecutePaymentResponse;

  if (!response.ok) {
    throw new Error(data.statusMessage || "Failed to execute bKash payment");
  }

  return data;
};

const clearTokenCache = () => {
  cachedToken = null;
};

export const BkashUtils = {
  grantToken,
  createPayment,
  executePayment,
  clearTokenCache,
};
