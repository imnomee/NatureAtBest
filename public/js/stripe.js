import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_2VoZBnt4T9Iy4zzC7oA4ZZ4u001rKpn1vl');

export const bookTour = async (tourId) => {
  try {
    //Get incomplete session from server
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);
    //create checkout form + charge the card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
