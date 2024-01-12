"use strict";

const { find } = require("../../../../config/middlewares");

/**
 * payment-callback controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::payment-callback.payment-callback",
  ({ strapi }) => ({
    async create(params) {
      // Get Data
      let request = params.request.body;
      let tampung = {
        data: {
          history: request,
          order_id: request.order_id,
        },
      };

      // If Get Data
      let dataUpdate = {};
      if (tampung.data.history.transaction_status == "settlement") {
        dataUpdate = {
          data: {
            status_order: "success_payment",
          },
        };
      } else if (tampung.data.history.transaction_status == "pending") {
        dataUpdate = {
          data: {
            status_order: "waiting_payment",
          },
        };
      } else {
        dataUpdate = {
          data: {
            status_order: "error_payment",
          },
        };
      }

      // console.log("order ID :", request.order_id);
      // Check Order ID
      const find_data = await strapi.db
        .query("api::payment-callback.payment-callback")
        .findMany({
          where: {
            order_id: request.order_id,
          },
        });

      // console.log(find_data.length);

      if (find_data.length == 0) {
        console.log("create-data");
        // Create Payment-callback
        await strapi
          .service("api::payment-callback.payment-callback")
          .create(tampung);

        // Update Order Status
        await strapi
          .service("api::order.order")
          .update(tampung.data.history.order_id, dataUpdate);
      } else {
        console.log("update-data");

        // Update callback
        await strapi
          .service("api::payment-callback.payment-callback")
          .update(find_data[0].id, tampung);

        // Update Order Status
        await strapi
          .service("api::order.order")
          .update(tampung.data.history.order_id, dataUpdate);
      }

      // if()

      // const create_data = await strapi
      //   .service("api::payment-callback.payment-callback")
      //   .create(tampung);

      // console.log(create_data);

      // let dataUpdate = {};
      // const check_data = await strapi.entityService.findMany(
      //   "api::payment-callback.payment-callback",
      //   {
      //     filters: { id: 7 },
      //   }
      // );
      // console.log(tampung.data.history.order_id);
      // console.log(check_data);
      // if (check_data.pagination.total == 0) {
      //   console.log("create-data");
      //   await strapi
      //     .service("api::payment-callback.payment-callback")
      //     .create(tampung);
      // } else {
      //   console.log("update-data");
      //   await strapi
      //     .service("api::payment-callback.payment-callback")
      //     .update(check_data.results[0].id, tampung);
      // }

      // if (tampung.data.history.transaction_status == "settlement") {
      //   dataUpdate = {
      //     data: {
      //       status_order: "success_payment",
      //     },
      //   };
      // } else {
      //   dataUpdate = {
      //     data: {
      //       status_order: "error_payment",
      //     },
      //   };
      // }

      // await strapi
      //   .service("api::order.order")
      //   .update(tampung.data.history.order_id, dataUpdate);

      // return tampung;
    },
  })
);
