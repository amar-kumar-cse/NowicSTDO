import fs from 'fs';
import { servicePricing, generalTiers, deliveryLifecycle } from './src/data/pricingData.js';

const data = {
  servicePricing,
  generalTiers,
  deliveryLifecycle
};

fs.writeFileSync('pricing_export.json', JSON.stringify(data, null, 2));
console.log("Successfully exported pricing data to pricing_export.json");
