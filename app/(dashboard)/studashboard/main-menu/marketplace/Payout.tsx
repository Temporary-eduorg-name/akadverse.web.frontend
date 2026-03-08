// import axios from "axios";
// import { useEffect, useState } from "react";
// import { cartSettings } from "../utils/cartProvider";
// import { useNavigate } from "react-router-dom";
// declare global {
//     interface Window {
//         PaystackPop: any;
//     }
// }
// interface updatedCart {
//     DeliveryTime: string;
//     added_at: string;
//     cart_id: string;
//     id: string;
//     product_id: string;
//     quantity: number;
//     business_id: string;
//     name: string;
//     description: string;
//     price: number;
//     stock: number;
//     public_url: string;
//     secure_url: string;
//     status: "active" | "inactive";
//     created_at: string;
//     updated_at: string;
// }

// function PayoutButton(props: { user: string; cart_id: string; paystack_key: string, email: string, total: number, orderId: string, updated_cart: updatedCart[] }) {
//     const [paystackLoaded, setPaystackLoaded] = useState<boolean>(false)
//     const deliveryfee = 1500
//     const fulltotal = props.total + deliveryfee
//     const settings = cartSettings()
//     if (!settings) throw new Error('no cart settings provided')
//     console.log(props.updated_cart)
//     useEffect(() => {
//         const script = document.createElement("script");
//         script.src = "https://js.paystack.co/v1/inline.js";
//         script.async = true;
//         document.body.appendChild(script);
//         script.onload = () => {
//             console.log(" Paystack script loaded");
//             setPaystackLoaded(true);
//         };
//         script.onerror = () => {
//             console.error(" Failed to load Paystack script");
//             setPaystackLoaded(false);
//         };
//     }, []);

//     function Payout() {
//         console.log(window.PaystackPop as any)
//         console.log(!paystackLoaded)
//         if (!paystackLoaded || !window.PaystackPop) {
//             console.log('hi')
//             alert("Paystack not loaded yet, please wait...");
//             return;
//         }

//         // add the quantity to the post callback function 

//         const handler = window.PaystackPop.setup({
//             key: props.paystack_key,
//             email: props.email,
//             amount: props.total * 100,
//             currency: "NGN",
//             ref: `order_${props.orderId}_${Date.now()}`,
//             callback: (response: any) => {
//                 try {
//                     axios.post("http://localhost:3000/payment/verify_payments", {
//                         reference: response.reference,
//                         orderId: props.orderId,
//                         email: props.email,
//                         cart_id: props.cart_id,
//                         user_id: props.user,
//                         total: props.total * 100,
//                         cart: props.updated_cart
//                     })
//                         .then(() => {
//                             window.location.href = '/'
//                             // alert("Payment successful! Your order is being processed.");
//                         })

//                 } catch (err) {
//                     alert("Payment verification failed!");
//                 }
//             },
//             onClose: function () {
//                 alert("Payment window closed.");
//             },
//         });

//         handler.openIframe();
//     }

//     return (
//         <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
//             <div style={{ backgroundColor: '#181B22', margin: '10px 0px', borderRadius: '10px', width: '100%', padding: '20px', boxSizing: 'border-box', color: '#F5F7FA' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Subtotal: </h3> <span>₦ {props.total}</span></div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Delivery Fee: </h3> <span>₦ {deliveryfee}</span></div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Total: </h3> <span>₦ {fulltotal}</span></div>
//             </div>
//             <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
//                 <button className="AddButton" style={{ fontSize: 'medium', width: '80%', boxSizing: 'border-box', marginBottom: '20px' }} onClick={Payout}>Pay Now</button>
//             </div>
//         </div>
//     )

// }
// export default PayoutButton