// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const stripe = require("stripe")(process.env.SECRET_STRIPE);

export default async (req, res) => {
  if (req.method === "POST") {
    const { subscriptionId, priceId, customer } = req.body;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription) {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const newPlan = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }], // new offer's price_id
    });

    res.json({ id: newPlan.id });
  }
};
