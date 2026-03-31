import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    return_requests_10k: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '30m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const ORGANIZATION_ID = __ENV.ORGANIZATION_ID || 'org_demo';

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function payloadFor(iteration) {
  const reasons = ['Size issue', 'Damaged item', 'Wrong item delivered', 'Not as described'];
  const categories = ['Footwear', 'Electronics', 'Fashion', 'Home'];
  const paymentTypes = ['COD', 'prepaid'];

  return JSON.stringify({
    order_id: `ORD-${iteration + 1}`,
    user_id: `USR-${(iteration % 2000) + 1}`,
    reason: randomItem(reasons),
    product_category: randomItem(categories),
    payment_type: randomItem(paymentTypes),
  });
}

export default function () {
  const url = `${BASE_URL}/api/returns?organization_id=${ORGANIZATION_ID}`;
  const body = payloadFor(__ITER);

  const res = http.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'has request_id': (r) => !!r.json('request_id'),
  });

  sleep(0.1);
}
