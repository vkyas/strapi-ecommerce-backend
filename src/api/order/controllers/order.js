"use strict";
require("dotenv").config();
/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(params) {
    // @ts-ignore
    const { data, meta } = await super.find(params);
    return { data, meta };
  },

  async create(params) {
    // @ts-ignore
    const result = await super.create(params);

    // @ts-ignore
    const midtransClient = require("midtrans-client");
    // Create Snap API instance
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.SECRET,
      clientKey: process.env.NEXT_PUBLIC_CLIENT,
    });

    let parameter = {
      transaction_details: {
        order_id: result.data.id,
        gross_amount: result.data.attributes.total_price,
      },
      credit_card: {
        secure: true,
      },
    };

    let respone = snap.createTransaction(parameter);
    return respone;
  },
}));
