import axios from "axios"
import _ from "lodash"
import {PaymentService} from "medusa-interfaces"

class WompiProviderService extends PaymentService {
  static identifier = "Wompi"

  constructor({shippingProfileService, totalsService }, options){
    super()
    /** Required Wompi Options
     *  {base_url: "",
     *   public_key: "",
     *   private_key: "",  * 
     * }
     * 
     */
    this.options = options

    /** @private @const {Wompi} */
    this.Wompi = axios.create({
      baseURL: options.base_url,
      public_key: options.public_key,
    })

    /** @private @const {shippingProfileService} */
    this.shippingProfileService = shippingProfileService

    /** @private @const {totalsService} */
    this.totalsService = totalsService

  }

  async lineItemsToOrderLines_(cart){
    let order_lines = []

    for (const item of cart.items){
      const quantity = item.quantity

      const totals = await this.totalsService.getLineItemTotals(item, cart,{
        include_tax: true,
      })

    const tax =
      totals.tax_lines.reduce((acc, next) => acc + next.rate, 0) / 100
    
    order_lines.push({
      name: item.title,
      tax_rate: tax * 10000,
      quantity,
      unit_price: Math.round(totals.original_total / item.quantity),
      total_amount: totals.total - totals.gist_card_total,
      total_tax_amount: totals.tax_total,
      total_discount_amount:
        totals.original_total - totals.total - totals.gift_card_total,
    })
  }

  if (cart.shipping_methods.length) {
    const name = []
    let total = 0
    let tax = 0

    for (const next of cart.shipping_methods) {
      const totals = await this.totalsService_.getShippingMethodTotals(
        next,
        cart,
        {
          include_tax: true,
        }
      )

      name.push(next?.shipping_option.name)
      total += totals.total
      tax += totals.tax_total
    }

    const taxRate = tax / (total - tax)

    order_lines.push({
      name: name?.join(" + ") || "Shipping fee",
      quantity: 1,
      type: "shipping_fee",
      unit_price: total,
      tax_rate: taxRate * 10000,
      total_amount: total,
      total_tax_amount: tax,
    })
  }

  return order_lines
}

/**
 * Creates a Wompi payment session
 * @param {string} cart 
 * @param {number} amount
 * @returns {string} id of payment
 */
  async createPayment(cart){  
    const {data} = await this.Wompi.post("/transactions", {
      amount_in_cents: cart.total,
      currency: "COP",
      payment_method_types: ["CARD"],
      customer_data: {
        name: cart.billing_address.first_name,
        email: cart.email,
        phone_number: cart.billing_address.phone,
      },
      redirect_url: "https://example.com/redirect",
      metadata: {
        cart_id: cart.id,
      },
    })

    return data
  }

  async retrievePayment(data){
    try {
      const {data} = await this.Wompi.get(`/transactions/${data.id}`)
      return data
    }  
    catch (error) {
      return error
    }
  }

  async getStatus(paymentData){
    const {order_id} = paymentData
    const {data: order} = await this.Wompi.get(`/transactions/${paymentData.id}`)
    return data.STATUS
}
  async updatePayment(sessionData, update){
    try {
      return {...sessionData, ...update}
    } catch (error){
      throw error
    }
  }

  async updatePaymentData(sessionData, update){
    try{
      return {...sessionData, ...update}
    } catch (error){
      throw error
    }
  }
  async deletePayment(payment){
    return
}
  async authorizePayment(session, context = {}){
    try {
    const paymentStatus = await this.getStatus(session)
    return {data: session.data, status: paymentStatus}
  } catch (error){
    throw error
  }
}
async getPaymentData(SessionData){
  try {
    return this.WompiretrievePayment(SessionData)
  }
  catch (error){
    throw error
  }
}

async capturePayment(payment){
  return payment

} 

async refundPayment(payment, amount){
  return payment}

async cancelPayment(payment){
  return payment}

}

export default WompiProviderService