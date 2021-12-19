import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 1000, // 200 RPS, since timeUnit is the default 1s
      duration: '15s',
      preAllocatedVUs: 50,
      maxVUs: 10000,
    },
  },
};

// export default function () {
//   http.get('http://localhost:3000/products');
//   sleep(1);
// }

// export default function () {
//   http.get('http://localhost:3000/products/100');
//   sleep(1);
// }

// export default function () {
//   http.get('http://localhost:3000/products/100/styles');
//   sleep(1);
// }

export default function () {
  http.get('http://localhost:3000/products/100/related');
  sleep(1);
}
