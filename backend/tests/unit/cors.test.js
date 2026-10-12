const { isAllowedOrigin, normalizeOrigin } = require('../../src/config/cors');

describe('cors origin matching', () => {
  test('normalizes trailing slashes', () => {
    expect(normalizeOrigin('https://bu-papers-ready-jlgx.vercel.app/')).toBe(
      'https://bu-papers-ready-jlgx.vercel.app'
    );
  });

  test('allows exact frontend origin', () => {
    const allowed = ['https://bu-papers-ready-jlgx.vercel.app', 'https://*.vercel.app'];
    expect(isAllowedOrigin('https://bu-papers-ready-jlgx.vercel.app', allowed)).toBe(true);
  });

  test('allows vercel preview hosts via wildcard', () => {
    const allowed = ['https://*.vercel.app'];
    expect(
      isAllowedOrigin('https://bu-papers-ready-jlgx-git-main-cse-bu.vercel.app', allowed)
    ).toBe(true);
  });

  test('allows Amplify Hosting domains even when they are not listed', () => {
    expect(isAllowedOrigin('https://main.d1tyeqr6zyxtxk.amplifyapp.com', [])).toBe(true);
    expect(isAllowedOrigin('https://evil.example.com', [])).toBe(false);
  });

  test('allows Amplify Hosting domains via wildcard', () => {
    const allowed = ['https://*.amplifyapp.com'];
    expect(isAllowedOrigin('https://main.dh014mymg99rf.amplifyapp.com', allowed)).toBe(true);
    expect(isAllowedOrigin('https://evil.example.com', allowed)).toBe(false);
  });

  test('blocks unknown origins', () => {
    const allowed = ['https://bu-papers-ready-jlgx.vercel.app'];
    expect(isAllowedOrigin('https://evil.example.com', allowed)).toBe(false);
  });
});
