// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const stripe = require("stripe")(process.env.SECRET_STRIPE);

export default async (req, res) => {
  const { new_payment_method_id, customer_id } = req.body;
  if (req.method === "POST") {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      new_payment_method_id,
    );

    if (!paymentMethod) {
      return res.json({ message: "error" });
    }

    await stripe.paymentMethods.attach(new_payment_method_id, {
      customer: customer_id,
    });

    res.json({ message: "successs" });
  }

  if (req.method === "GET") {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      "pm_1Jbl3EGfE0DcZfhrDtwiuKkL",
    );
    res.json({ paymentMethod });
  }
};
