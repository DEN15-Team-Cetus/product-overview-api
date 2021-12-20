import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 11000, // 200 RPS, since timeUnit is the default 1s
      duration: '15s',
      preAllocatedVUs: 50,
      maxVUs: 100000,
    },
  },
};

// Get a list of products
// export default function () {
//   http.get('http://localhost:3000/products');
//   sleep(1);
// }

// Get info for selected product
// export default function () {
//   http.get('http://localhost:3000/products/info?productId=3');
//   sleep(1);
// }

// Get all styles for selected product
// export default function () {
//   http.get('http://localhost:3000/products/styles?productId=3');
//   sleep(1);
// }

// Get all items related to selected product
// export default function () {
//   http.get('http://localhost:3000/products/related?productId=3');
//   sleep(1);
// }
