import type { Metadata } from 'next';
import { CheatsheetLayout } from '@/components/CheatsheetLayout';

export const metadata: Metadata = {
  title: 'Cheatsheet Git avançado — FFV Academy',
  description: 'Git além do basic: rebase, reflog, bisect, worktree, cherry-pick, submodules, hooks.',
  keywords: 'cheatsheet git, git rebase interactive, git reflog, git bisect, git worktree, git hooks',
};

export default function Page() {
  return (
    <CheatsheetLayout
      title="Git avançado"
      subtitle="Os comandos que salvam carreira quando o branch quebrou."
      accent="#f05032"
      emoji="🌿"
    >
      <section>
        <h2>Rebase interativo</h2>
        <pre><code>{`git rebase -i HEAD~5        # pega últimos 5 commits
# ações: pick / reword / edit / squash / fixup / drop / exec

# Rebase preservando merges
git rebase -i --rebase-merges main

# Autosquash: usar fixup! / squash! com SHA
git commit --fixup=ABC123
git rebase -i --autosquash main`}</code></pre>
      </section>

      <section>
        <h2>Reflog — recuperar commit "perdido"</h2>
        <pre><code>{`git reflog                    # mostra TODAS as refs que HEAD teve
git reset --hard HEAD@{5}     # volta 5 movimentos atrás
git reflog expire --expire=now --all  # limpa (cuidado)

# Caso real: deletei branch por engano
git reflog | grep branch-name  # acha o SHA
git checkout -b branch-recovered SHA`}</code></pre>
      </section>

      <section>
        <h2>Bisect — find the bad commit</h2>
        <pre><code>{`git bisect start
git bisect bad HEAD
git bisect good v2.0

# git checkout automaticamente num commit do meio
# Testa:
git bisect good   # ou: git bisect bad

# Automatizado
git bisect run npm test

git bisect reset  # volta`}</code></pre>
      </section>

      <section>
        <h2>Worktree — múltiplos branches em paralelo</h2>
        <pre><code>{`# Check out outro branch sem sair do atual
git worktree add ../project-hotfix hotfix-123
git worktree list
git worktree remove ../project-hotfix

# Útil: revisar PR enquanto mantém WIP intocado no dir principal`}</code></pre>
      </section>

      <section>
        <h2>Cherry-pick cirúrgico</h2>
        <pre><code>{`git cherry-pick ABC123        # traz commit individual
git cherry-pick A..B          # range (sem A, com B)
git cherry-pick -n ABC123     # aplica mas não commita (--no-commit)
git cherry-pick -x ABC123     # anota SHA original na mensagem`}</code></pre>
      </section>

      <section>
        <h2>Stash avançado</h2>
        <pre><code>{`git stash push -m "WIP login fix" -- src/auth/
git stash list
git stash show -p stash@{1}
git stash apply stash@{1}     # aplica sem remover
git stash pop                 # aplica e remove
git stash drop stash@{1}`}</code></pre>
      </section>

      <section>
        <h2>Hooks (client-side e server-side)</h2>
        <pre><code>{`# .git/hooks/pre-commit (client)
#!/bin/bash
npm run lint && npm test || exit 1

# Compartilhar hooks no repo (usando husky ou manual)
git config core.hooksPath .githooks
chmod +x .githooks/*

# Skip hook quando preciso (emergência)
git commit --no-verify -m "hotfix"`}</code></pre>
      </section>

      <section>
        <h2>Submodules (quando necessário)</h2>
        <pre><code>{`git submodule add https://github.com/org/repo libs/repo
git submodule update --init --recursive
git submodule foreach git pull
# Para novos clones do repo pai:
git clone --recurse-submodules URL`}</code></pre>
      </section>

      <section>
        <h2>Config úteis</h2>
        <pre><code>{`git config --global pull.rebase true         # rebase em vez de merge ao pull
git config --global rebase.autoStash true    # stash automático no rebase
git config --global diff.algorithm histogram # diffs mais úteis
git config --global core.editor "code --wait"
git config --global push.autoSetupRemote true # sem --set-upstream toda vez`}</code></pre>
      </section>
    </CheatsheetLayout>
  );
}
