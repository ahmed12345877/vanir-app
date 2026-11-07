import { appConfig } from '../src/config/appConfig';
import { colors } from '../src/theme/colors';

describe('mobile scaffold configuration', () => {
  it('points to the existing production backend', () => {
    expect(appConfig.apiBaseUrl).toBeDefined();
  });

  it('reuses the VANIR Firebase project metadata', () => {
    expect(appConfig.firebase.projectId).toBe('gen-lang-client-0364375301');
    expect(appConfig.firebase.authDomain).toBe('gen-lang-client-0364375301.firebaseapp.com');
  });

  it('keeps the shared mobile theme tokens available', () => {
    expect(colors.primary).toBe('#0084FF');
  });
});
