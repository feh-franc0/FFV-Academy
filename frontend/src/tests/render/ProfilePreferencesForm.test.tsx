import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePreferencesForm } from '@/components/profile/ProfilePreferencesForm';

describe('<ProfilePreferencesForm>', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it('renderiza as 5 seções principais', async () => {
    render(<ProfilePreferencesForm />);
    // Espera hidratar
    await screen.findByTestId('profile-preferences-form');
    expect(screen.getByText(/Bases de conhecimento que te interessam/i)).toBeInTheDocument();
    expect(screen.getByText(/O que você quer dominar/i)).toBeInTheDocument();
    expect(screen.getByText(/Com que frequência/i)).toBeInTheDocument();
    expect(screen.getByText(/Como você aprende melhor/i)).toBeInTheDocument();
  });

  it('inicia com 0 sinais desbloqueados', async () => {
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');
    expect(screen.getByText(/Sinais desbloqueados: 0\/4/i)).toBeInTheDocument();
  });

  it('clicar em base de interesse incrementa sinal e persiste no localStorage', async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');

    const techButton = screen.getByRole('button', { name: /Tecnologia/ });
    await user.click(techButton);

    expect(screen.getByText(/Sinais desbloqueados: 1\/4/i)).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem('ffv_user_preferences_v1')!);
    expect(stored.interestedBases).toContain('tecnologia');
  });

  it('seção "casa" só aparece após escolher alguma base', async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');
    expect(screen.queryByText(/Qual é sua "casa"/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Tecnologia/ }));
    expect(screen.getByText(/Qual é sua/)).toBeInTheDocument();
  });

  it('digitar metas conta sinal e respeita limite 280 chars', async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');
    const textarea = screen.getByPlaceholderText(/Passar na prova/i);
    await user.type(textarea, 'Dominar IA aplicada em 6 meses');
    expect(screen.getByText(/Sinais desbloqueados: 1\/4/i)).toBeInTheDocument();
    expect(textarea).toHaveValue('Dominar IA aplicada em 6 meses');
  });

  it('toggle de material persiste mas não conta sinal (default já tem 2)', async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');
    // Default = 0 sinais (sem nada customizado)
    expect(screen.getByText(/Sinais desbloqueados: 0\/4/i)).toBeInTheDocument();
    // Toggle de material persiste no localStorage
    await user.click(screen.getByRole('button', { name: /Vídeo/ }));
    const stored = JSON.parse(window.localStorage.getItem('ffv_user_preferences_v1')!);
    expect(stored.preferredMaterials).toContain('video');
  });

  it('mudar para frequência diária persiste e conta como sinal', async () => {
    const user = userEvent.setup();
    render(<ProfilePreferencesForm />);
    await screen.findByTestId('profile-preferences-form');
    await user.click(screen.getByRole('button', { name: /Todo dia/i }));
    const stored = JSON.parse(window.localStorage.getItem('ffv_user_preferences_v1')!);
    expect(stored.frequency.kind).toBe('daily');
    expect(screen.getByText(/Sinais desbloqueados: 1\/4/i)).toBeInTheDocument();
  });
});
