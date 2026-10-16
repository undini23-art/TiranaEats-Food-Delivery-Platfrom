# TiranaEats Project Requirements Answer

## 1. Business Concept and Model

TiranaEats is a **B2C e-commerce food delivery platform** for customers in Tirana. The platform connects customers with local restaurants and allows them to browse menus, add food items to a cart, complete checkout, and follow the order status.

The value proposition is to make food ordering fast, simple, and reliable. Customers can compare restaurants, search by restaurant or cuisine, view menu items, simulate secure payment, and track orders from checkout to delivery.

The target audience is people living, studying, or working in Tirana who want convenient online food delivery from local restaurants.

The revenue model is a **commission-based model**. TiranaEats earns a simulated **15% commission** from each order. The platform could also grow later with promoted restaurant listings, delivery fees, subscription plans for restaurants, and digital advertising.

## 2. E-Commerce Platform

The project includes a functional website built with **React, Vite, and Tailwind CSS** for the frontend, and **Node.js with Express** for the backend API.

The platform includes:

- A homepage with restaurant listings, search, and cuisine filtering.
- Restaurant detail pages with food/menu products, descriptions, images, calories, prices, reviews, and location map.
- Shopping cart functionality using `localStorage`, so cart items stay available while browsing.
- Cart controls for adding, removing, and updating item quantities.
- Checkout page with delivery details, rewards, promo codes, payment methods, order scheduling, and final total.
- Currency conversion display for Albanian lek, euro, US dollar, and British pound.
- Customer, restaurant manager, and admin areas.

## 3. Transaction Process & Payment System

The customer journey starts on the homepage, where the customer browses restaurants or searches by cuisine/name. After choosing a restaurant, the customer opens the restaurant page, views menu items, and adds products to the cart. In the cart, the customer can change quantities, remove items, apply rewards or promo codes, choose delivery details, select a payment method, and confirm the order.

After checkout, the order appears in the order history page. The order can be `pending`, `scheduled`, `preparing`, `delivering`, `delivered`, or `cancelled`. Restaurant managers or admins can update the order status from the restaurant dashboard. Customers can cancel orders only while they are still pending or scheduled.

The payment methods used in the prototype are:

- Credit / debit card simulation
- PayPal simulation
- Digital wallet simulation
- Cash on delivery

The app supports promo codes and wallet cashback.

A real payment gateway works as a secure middle layer between the customer, the e-commerce website, the bank/card network, and the merchant. It encrypts the payment information, checks that the payment details are valid, asks the bank or payment provider to approve the transaction, and returns a success or failure response to the website. In this project, the payment gateway is simulated for academic purposes, so no real money is charged.

## 4. Security and Legal Considerations

The project includes basic security ideas suitable for a prototype. Authentication is simulated with JWT-based login, and protected routes are used so customers, admins, and restaurant managers only access the pages allowed for their roles. Admin and restaurant manager accounts also require an extra security verification code during login.

Card details are simulated and not connected to a real bank. In a real production system, sensitive card data should never be stored directly by the website. It should be handled by a certified payment provider.

For privacy and data protection, the platform should collect only the information needed to complete orders, such as name, phone number, address, and payment method. User data should be protected, access should be role-based, and customers should be informed about how their personal data is used.

Important legal and ethical considerations include:

- Clear terms and conditions for customers and restaurants.
- Privacy policy explaining how customer data is collected and used.
- Refund and cancellation rules.
- Food safety responsibility and restaurant accountability.
- Honest pricing, delivery fees, discounts, and advertising.
- Secure communication through HTTPS/SSL in a real deployment.

## 5. Digital Marketing Strategy

The customer acquisition strategy for TiranaEats would focus on people in Tirana who regularly order lunch, dinner, or quick meals online. The platform could attract customers through student discounts, first-order promo codes, restaurant partnerships, referral rewards, and local social media campaigns.

SEO can be used by creating pages for popular searches such as "food delivery Tirana", "pizza delivery Tirana", "healthy lunch Tirana", or restaurant-specific pages. Social media marketing on Instagram, TikTok, and Facebook could show food photos, short videos, discount campaigns, and restaurant recommendations.

Paid ads could target users near restaurant areas, universities, offices, and residential neighborhoods. Promo codes such as `FOOD10`, `LUNCH20`, and wallet cashback campaigns can encourage checkout completion.

The sales funnel is:

1. Awareness: customer sees social media content, ad, or search result.
2. Interest: customer opens TiranaEats and browses restaurants.
3. Consideration: customer compares menus, prices, reviews, delivery time, and payment options.
4. Conversion: customer adds items to cart and completes checkout.
5. Retention: customer receives rewards, cashback, notifications, and order history for repeat purchases.

## 6. Analytics and KPIs

The admin dashboard includes simulated analytics for measuring business performance. Important KPIs for TiranaEats include:

- **Number of orders:** Shows how many orders were created on the platform. This helps measure total platform activity.
- **Commission revenue:** Shows the platform revenue from the 15% commission on simulated orders.
- **Conversion rate:** Measures how many website visitors become customers by placing orders.
- **Average order value:** Shows the average money spent per order. This helps evaluate customer spending behavior.
- **Website visitors:** Tracks the number of users browsing the restaurant pages.
- **Checkout starts:** Shows how many users begin the checkout process.
- **Customer retention indicators:** Rewards, cashback balance, and order history can help understand repeat customer behavior.

These KPIs help the business understand whether users are browsing, adding items, completing orders, and generating revenue.

## 7. Innovation and Future Development

TiranaEats could improve by adding emerging technologies such as AI-based restaurant recommendations, personalized offers, chatbot customer support, smart delivery time prediction, and AI menu search based on dietary preferences.

Future improvements could include:

- Real payment gateway integration.
- Real database instead of JSON/in-memory data.
- Live GPS courier tracking.
- Mobile app version for iOS and Android.
- Restaurant self-service tools for menus, prices, availability, and promotions.
- Customer loyalty levels and personalized discounts.
- AI suggestions for meals based on budget, calories, previous orders, and time of day.
- Multi-language support for Albanian and English.

The platform could scale by adding more restaurants, expanding outside Tirana, improving delivery logistics, using cloud hosting, and creating stronger partnerships with local food businesses. To compete, TiranaEats should focus on fast delivery, strong local restaurant coverage, reliable customer service, simple design, and attractive rewards.
