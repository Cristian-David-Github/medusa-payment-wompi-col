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

  

}
