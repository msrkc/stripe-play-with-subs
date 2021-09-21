import * as React from "react";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);
const cardElementOpts = {
  iconStyle: "solid",
  // style: someStyles
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "36px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};
function Checkout() {
  const elements = useElements();
  const stripe = useStripe();

  const [priceId, setPriceId] = React.useState(
    "price_1JbkWqGfE0DcZfhrmh0EKqbi",
  );

  const [customer, setCustomer] = React.useState(
    () => JSON.parse(localStorage.getItem("customer")) || null,
  );
  const [subscriptionId, setSubscriptionId] = React.useState(
    () => localStorage.getItem("subscriptionId") || null,
  );

  const handleSubmit = async e => {
    e.preventDefault();

    const billingDetails = {
      email: e.target.email.value,
    };

    const cardElement = elements.getElement("card");

    let payload;

    if (!customer) {
      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: billingDetails,
      });

      if (paymentMethodReq.error) {
        return;
      }
      payload = {
        payment_method: paymentMethodReq.paymentMethod.id,
        email: billingDetails.email,
        name: "Murat S.",
      };
    } else {
      payload = {
        customer,
      };
    }

    const { data } = await axios.post("/api/sub", {
      ...payload,
      priceID: priceId,
    });
    const { client_secret, status, customerId, subscriptionId } = data;

    // persist data for testing purposes
    localStorage.setItem("customer", JSON.stringify({ id: customerId }));
    setCustomer({ id: customerId });
    localStorage.setItem("subscriptionId", subscriptionId);
    setSubscriptionId(subscriptionId);

    if (status === "requires_action") {
      try {
        await stripe.confirmCardPayment(client_secret);
        alert("Got the money! you have now subscription");
      } catch (error) {
        console.log("errorrr");
      }
    } else {
      console.log("Got the money! you have now subscription");
    }
  };

  const handleChangePlan = async () => {
    const { data } = await axios.post("/api/change", {
      subscriptionId: subscriptionId,
      priceId: priceId,
      customer: customer,
    });
    localStorage.setItem("subscriptionId", subscriptionId);
    setSubscriptionId(data.id);
  };
  return (
    <div className="container mx-auto font-black mt-10">
      <form onSubmit={handleSubmit}>
        <input
          id="email"
          name="email"
          placeholder="email"
          className="w-full text-2xl"
        />
        <br />
        {customer && "customerID: " + customer.id}
        <br />
        {subscriptionId && "subscriptionId: " + subscriptionId}
        <input
          id="priceId"
          name="priceId"
          placeholder="price id (bundle id)"
          value={priceId}
          onChange={e => setPriceId(e.target.value)}
          className="w-full text-2xl"
        />
        <h3 className="text-xl text-red-400 mt-6">
          create customer || subscription
        </h3>
        <hr className="mb-4" />
        <CardElement options={cardElementOpts} onChange={() => {}} />
        <br />
        test card: 4242 4242 4242 4242 0424 242
        <button className="px-4 py-2 block mx-auto bg-red-600 text-white rounded-xl text-2xl">
          subscribe
        </button>
      </form>

      <h3 className="text-xl text-red-400 mt-4">update subscription</h3>
      <hr className="mb-4" />

      <ul className="flex w-full justify-center">
        <li
          className="cursor-pointer border-2 border-red-300 px-4 py-2 rounded-full mr-2"
          onClick={() => setPriceId("price_1JbkWqGfE0DcZfhrmh0EKqbi")}
        >
          bundle #1
        </li>
        <li
          className="cursor-pointer border-2 border-red-300 px-4 py-2 rounded-full mr-2"
          onClick={() => setPriceId("price_1JblksGfE0DcZfhrb2tYFWpW")}
        >
          bundle #2
        </li>
        <li
          className="cursor-pointer border-2 border-red-300 px-4 py-2 rounded-full"
          onClick={() => setPriceId("price_1Jbll1GfE0DcZfhrKiyp5HhU")}
        >
          bundle #3
        </li>
      </ul>
      <button
        className={`px-4 py-2 block mx-auto bg-red-600 text-white rounded-xl text-2xl mt-4 ${
          !subscriptionId && "opacity-50"
        } `}
        onClick={handleChangePlan}
        disabled={!subscriptionId}
      >
        change plan
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
}
