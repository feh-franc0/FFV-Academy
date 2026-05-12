import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-devtools-productivity')!;

export const metadata: Metadata = {
  title: 'DevTools & Productivity Sênior — FFV Academy',
  description:
    'O setup que separa sênior de júnior em 2026: Neovim com LazyVim/Mason/Treesitter, Zed editor (Rust GPU), Cursor pro com rules e agent mode, dotfiles managed (chezmoi), terminal multiplex (tmux/Zellij), shells (fish/zsh/nushell), CLI essentials (fzf/zoxide/atuin/eza/ripgrep), AI no terminal (Warp, Claude Code, fabric).',
  keywords: 'neovim 2026, lazyvim, zed editor, cursor rules, chezmoi dotfiles, tmux zellij, fish zsh nushell, fzf zoxide atuin, warp terminal',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
