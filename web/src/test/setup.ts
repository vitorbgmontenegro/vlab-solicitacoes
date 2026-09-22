/**
 * Preparacao comum de todos os testes de frontend.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Desmonta o que foi renderizado ao fim de cada teste, para que um teste nunca
// enxergue o DOM deixado por outro.
afterEach(() => {
  cleanup();
});
