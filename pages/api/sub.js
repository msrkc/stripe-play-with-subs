// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const stripe = require("stripe")(process.env.SECRET_STRIPE);

export default async (req, res) => {
  if (req.method === "POST") {
    const { email, name, payment_method, customer, priceID } = req.body;

    let existingCustomer = customer;

    if (!existingCustomer) {
      existingCustomer = await stripe.customers.create({
        payment_method: payment_method,
        email: email,
        name: name,
        invoice_settings: {
          default_payment_method: payment_method,
        },
      });
      // save customer to user (paymentMethodId and customerId is needed)
    }

    const subscription = await stripe.subscriptions.create({
      customer: existingCustomer.id,
      items: [{ price: priceID }],
      expand: ["latest_invoice.payment_intent"],
    });

    // save subscription.id to users subscriptions

    const status = subscription["latest_invoice"]["payment_intent"]["status"];
    const client_secret =
      subscription["latest_invoice"]["payment_intent"]["client_secret"];

    res.json({
      client_secret: client_secret,
      status: status,
      customerId: existingCustomer.id,
      subscriptionId: subscription.id,
    });
  }

  if (req.method === "GET") {
    res.status(200).send("hii");
  }
};
