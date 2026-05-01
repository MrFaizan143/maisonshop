// Shiprocket integration — payload-only stub.
// Builds the request payload Shiprocket's "Adhoc Order" / "Create Order" endpoint expects.
// When you're ready to go live: store SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD as secrets,
// call the auth endpoint to get a token, then POST this payload to:
//   https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
//
// Docs: https://apidocs.shiprocket.in/

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email?: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  shipping_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface OrderForLabel {
  order_number: string;
  placed_at: string;
  ship_full_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
}

interface OrderItemForLabel {
  product_title: string;
  product_id: string | null;
  unit_price: number;
  quantity: number;
}

const PICKUP_LOCATION_NICKNAME = "Primary"; // configure in Shiprocket dashboard

export function buildShiprocketPayload(
  order: OrderForLabel,
  items: OrderItemForLabel[],
): ShiprocketOrderPayload {
  const [firstName, ...rest] = order.ship_full_name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "-";

  return {
    order_id: order.order_number,
    order_date: new Date(order.placed_at).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: PICKUP_LOCATION_NICKNAME,
    comment: "Order placed via Maison",
    billing_customer_name: firstName || order.ship_full_name,
    billing_last_name: lastName,
    billing_address: order.ship_line1,
    billing_address_2: order.ship_line2 ?? undefined,
    billing_city: order.ship_city,
    billing_pincode: order.ship_pincode,
    billing_state: order.ship_state,
    billing_country: order.ship_country || "India",
    billing_phone: order.ship_phone,
    shipping_is_billing: true,
    order_items: items.map((i) => ({
      name: i.product_title.slice(0, 100),
      sku: i.product_id?.slice(0, 8) ?? "SKU",
      units: i.quantity,
      selling_price: Number(i.unit_price),
    })),
    payment_method: order.payment_method.toLowerCase() === "cod" ? "COD" : "Prepaid",
    shipping_charges: Number(order.shipping_fee) || 0,
    total_discount: 0,
    sub_total: Number(order.subtotal),
    // Default parcel dimensions — tune per product type later
    length: 15,
    breadth: 15,
    height: 10,
    weight: 0.5,
  };
}
