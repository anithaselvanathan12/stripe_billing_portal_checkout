const express = require("express");
const app = express();
const stripe = require('stripe')('sk_test_51HH8CjBqbRJuVF9Mxhq7Sd01CZKTkfOOtzpkMQdhd59OwG1YMBlpLBrwZfB0yLpPDr10geaAjSIblUR3FemTuCNm00bHtTri8k', {
    maxNetworkRetries: 3,
  });
const port = process.env.PORT || "8000";

app.get("/", (req, res) => {
    res.status(200).send("WHATABYTE: Food For Devs");
  });

app.get("/billing_session_url", async (req, res) => {
    try {
        const session = await stripe.billingPortal.sessions.create({
          customer: 'cus_HxAD5GEYwf8VJL',
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
          customer: 'cus_HxAD5GEYwf8VJL',
          type: 'card',
        });
        const session = await stripe.checkout.sessions.create({
          payment_method_types: [paymentMethods.data.card],
          mode: 'subscription',
          line_items: [
            {
              price: 'plan_HwlLiitCcP2osC',
              quantity: 1,
            },
          ],
          customer: 'cus_HxAD5GEYwf8VJL',
          success_url: 'http://localhost:4200/plans?customerId=cus_HxAD5GEYwf8VJL',
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

