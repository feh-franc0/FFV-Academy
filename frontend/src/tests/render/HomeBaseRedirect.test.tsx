import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';

const replaceMock = vi.hoisted(() => vi.fn());
const pathnameMock = vi.hoisted(() => ({ current: '/' }));
const searchParamsMock = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathnameMock.current,
  useSearchParams: () => searchParamsMock.current,
}));

vi.mock('@/lib/preferences-api', () => ({
  fetchPreferences: () => Promise.reject(new Error('not authenticated')),
  updatePreferences: () => Promise.reject(new Error('not authenticated')),
  serverToUserPreferences: (x: unknown) => x,
  userPreferencesToUpdateInput: (x: unknown) => x,
}));

import { HomeBaseRedirect, setSkipHomeRedirect } from '@/components/HomeBaseRedirect';
import { DEFAULT_PREFERENCES, savePreferences } from '@/lib/user-preferences';

beforeEach(() => {
  replaceMock.mockClear();
  pathnameMock.current = '/';
  searchParamsMock.current = new URLSearchParams();
  window.localStorage.clear();
});
afterEach(cleanup);

describe('<HomeBaseRedirect>', () => {
  it('NÃO redireciona quando homeBase é null (default)', async () => {
    savePreferences(DEFAULT_PREFERENCES);
    render(<HomeBaseRedirect />);
    await new Promise(r => setTimeout(r, 50));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redireciona pra basePath quando homeBase é "tecnologia"', async () => {
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'tecnologia' });
    render(<HomeBaseRedirect />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/tecnologia'));
  });

  it('redireciona pra /medicina-veterinaria quando homeBase é medvet', async () => {
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'medicina-veterinaria' });
    render(<HomeBaseRedirect />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/medicina-veterinaria'));
  });

  it('NÃO redireciona quando pathname não é "/"', async () => {
    pathnameMock.current = '/sobre';
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'tecnologia' });
    render(<HomeBaseRedirect />);
    await new Promise(r => setTimeout(r, 50));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('NÃO redireciona quando ?nohome=1 está na URL', async () => {
    searchParamsMock.current = new URLSearchParams('nohome=1');
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'tecnologia' });
    render(<HomeBaseRedirect />);
    await new Promise(r => setTimeout(r, 50));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('NÃO redireciona quando localStorage ffv_skip_home_redirect=1', async () => {
    setSkipHomeRedirect(true);
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'tecnologia' });
    render(<HomeBaseRedirect />);
    await new Promise(r => setTimeout(r, 50));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('NÃO redireciona quando homeBase aponta pra slug inexistente no registry', async () => {
    savePreferences({ ...DEFAULT_PREFERENCES, homeBase: 'base-fantasma' });
    render(<HomeBaseRedirect />);
    await new Promise(r => setTimeout(r, 50));
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('renderiza null (sem markup)', () => {
    savePreferences(DEFAULT_PREFERENCES);
    const { container } = render(<HomeBaseRedirect />);
    expect(container.firstChild).toBeNull();
  });

  it('setSkipHomeRedirect(true) marca localStorage; (false) limpa', () => {
    setSkipHomeRedirect(true);
    expect(window.localStorage.getItem('ffv_skip_home_redirect')).toBe('1');
    setSkipHomeRedirect(false);
    expect(window.localStorage.getItem('ffv_skip_home_redirect')).toBeNull();
  });
});
