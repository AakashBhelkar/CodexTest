import { calculateReturnFraudRisk } from '../../src/services/risk-scoring.service';

describe('calculateReturnFraudRisk', () => {
  it('adds +30 for high frequency returns', () => {
    const result = calculateReturnFraudRisk({
      returnCountLast90Days: 4,
      paymentType: 'prepaid',
      reason: 'Size issue',
      isNewUser: false,
    });

    expect(result.risk_score).toBe(30);
    expect(result.triggered_rules).toContain('high_frequency_returns');
  });

  it('adds +20 for COD orders', () => {
    const result = calculateReturnFraudRisk({
      returnCountLast90Days: 0,
      paymentType: 'COD',
      reason: 'Size issue',
      isNewUser: false,
    });

    expect(result.risk_score).toBe(20);
    expect(result.triggered_rules).toContain('cod_order');
  });

  it('adds +25 for suspicious reason keyword', () => {
    const result = calculateReturnFraudRisk({
      returnCountLast90Days: 0,
      paymentType: 'prepaid',
      reason: 'Customer said empty box was delivered',
      isNewUser: false,
    });

    expect(result.risk_score).toBe(25);
    expect(result.triggered_rules).toContain('suspicious_reason_keyword');
  });

  it('adds +15 for new user', () => {
    const result = calculateReturnFraudRisk({
      returnCountLast90Days: 0,
      paymentType: 'prepaid',
      reason: 'Size issue',
      isNewUser: true,
    });

    expect(result.risk_score).toBe(15);
    expect(result.triggered_rules).toContain('new_user');
  });

  it('returns reject decision for high combined score', () => {
    const result = calculateReturnFraudRisk({
      returnCountLast90Days: 8,
      paymentType: 'COD',
      reason: 'Empty box and damaged seal',
      isNewUser: true,
    });

    expect(result.risk_score).toBe(90);
    expect(result.decision).toBe('reject');
  });
});
