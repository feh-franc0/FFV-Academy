// Vitest setup — limpa localStorage entre testes + jest-dom matchers
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  localStorage.clear();
});
