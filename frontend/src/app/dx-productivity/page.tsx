import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail40')!;

export const metadata: Metadata = {
  title: 'DX & Developer Productivity — FFV Academy',
  description:
    'Chão invisível da produtividade em PT-BR: shell zsh/bash sério com Starship, dotfiles reproduzíveis via chezmoi/Stow, devcontainers + Codespaces pra ambiente efêmero, Makefiles/just/task como runners, VS Code + Neovim em nível poder, tmux/zellij pra sessões persistentes. Capstone: setup de máquina do zero em 20 minutos.',
  keywords:
    'dx developer experience, developer productivity, zsh bash starship, chezmoi gnu stow dotfiles, devcontainer codespaces, makefile just task runner, neovim lazyvim, tmux zellij multiplexer',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
