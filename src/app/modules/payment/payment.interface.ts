export type TCreatePaymentPayload = {
  amount: number;
  organizationId: string;
};

export type TBkashCreatePaymentResponse = {
  paymentID: string;
  bkashURL?: string;
  callbackURL?: string;
  successCallbackURL?: string;
  failureCallbackURL?: string;
  cancelledCallbackURL?: string;
  statusCode?: string;
  statusMessage?: string;
};

export type TBkashExecutePaymentResponse = {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  paymentExecuteTime?: string;
  statusCode?: string;
  statusMessage?: string;
};

export type TPaymentQuery = {
  page?: string;
  limit?: string;

  organizationId?: string;
  payerId?: string;

  status?: string;
  gateway?: string;

  transactionId?: string;

  sortBy?: string;
  sortOrder?: string;
};
