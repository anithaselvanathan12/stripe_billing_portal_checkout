const express = require("express");
const app = express();
const { STRIPE_KEY, CUSTOMER_ID, PLAN_ID  } = require('./constant')
const stripe = require('stripe')(STRIPE_KEY, {
    maxNetworkRetries: 3,
  });
const port = process.env.PORT || "8000";

app.get("/", (req, res) => {
    res.status(200).send("WHATABYTE: Food For Devs");
  });

app.get("/billing_session_url", async (req, res) => {
    try {
        const session = await stripe.billingPortal.sessions.create({
          customer: CUSTOMER_ID,
          return_url: 'http://localhost:4200/payment',
        });
        if (session) {
          res.status(200).json({
            status: 200,
            message: 'stripe billing portal session created successfully.',
            data: session,
          });
        }
      } catch (error) {
        console.log(error)
      }
  });

app.get("/checkout", async (req, res) => {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: CUSTOMER_ID,
          type: 'card',
        });
        const session = await stripe.checkout.sessions.create({
          payment_method_types: [paymentMethods.data.card],
          mode: 'subscription',
          line_items: [
            {
              price: PLAN_ID,
              quantity: 1,
            },
          ],
          customer: CUSTOMER_ID,
          success_url: `http://localhost:4200/plans?customerId=${CUSTOMER_ID}`,
          cancel_url: 'http://localhost:4200/plans',
        });
        res.send({
          status: 200,
          data: session,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send(`checkout Error: ${error.message}`);
      }
  });

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  });

