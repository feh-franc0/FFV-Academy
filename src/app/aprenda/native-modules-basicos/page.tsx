import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('native-modules-basicos');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Antes de escrever native module próprio, o que você testa primeiro?',
    options: [
      'Ejetar direto',
      'Buscar lib existente (maintained) + config plugin; maioria dos casos — câmera, BLE, background task, push, file picker, sensors — já tem biblioteca testada em produção. Escrever native só quando lib real não cobre',
      'Pedir no GitHub',
      'Fazer em JS puro',
    ],
    correct: 1,
    explanation: 'Ecosistema RN/Expo em 2026 tem lib madura pra quase tudo: expo-camera, react-native-ble-plx, expo-task-manager, expo-file-system, expo-sensors. Escrever native custom significa carregar maintenance futuro, lidar com upgrade de SDK, testar em vários devices. Só justifica quando SDK nativo de parceiro não tem wrapper, ou requisito único não atendido.',
  },
  {
    question: 'O que é TurboModule Spec e por que importa?',
    options: [
      'Nada',
      'É um arquivo TS que descreve a interface do módulo nativo; o codegen da RN gera bindings C++/Kotlin/Swift automaticamente a partir do spec — você escreve JS types + implementação nativa, sem boilerplate manual de bridge',
      'Só iOS',
      'É um design pattern',
    ],
    correct: 1,
    explanation: 'TurboModule Spec é spec-driven development: você declara MeuModuleSpec.ts com métodos e tipos; o codegen roda no prebuild e gera interface Kotlin/Swift + registry entry. Você só implementa a função nativa. Menos erro (tipos sincronizados JS↔native) e nova arch carrega módulo lazy via JSI sem serialize JSON.',
  },
  {
    question: 'Estratégia certa pra distribuir o módulo nativo pro resto do time?',
    options: [
      'Copiar pasta',
      'Criar Expo config plugin local (ou lib npm separada com plugin) — qualquer dev faz `npx expo prebuild` e os arquivos nativos são aplicados determinísticamente, sem precisar de passo manual de Xcode/Android Studio',
      'Script bash',
      'Nunca compartilhar',
    ],
    correct: 1,
    explanation: 'Config plugin deixa o código nativo reproduzível: `plugins: ["./plugins/meu-native"]` em app.config.ts. No prebuild, Info.plist, AndroidManifest, build.gradle e arquivos Kotlin/Swift são escritos conforme o plugin. Resultado: novo dev clona o repo, `npx expo prebuild`, tudo pronto. Sem isso, vira "funciona na minha máquina" e quebra em CI.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="native-modules-basicos"
      title="Native modules: quando Kotlin/Swift mínimo"
      icon="⚙️"
      xp={55}
      readTime={13}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="build-deploy-ios-android"
      nextTitle="Build + deploy: EAS Build, TestFlight, Play Console"
      quiz={quiz}
    >
      <Section title="Você provavelmente não precisa" accent={accent}>
        <p>
          A reação automática quando aparece requisito "acessar X no nativo" deveria ser procurar lib pronta, não abrir Xcode. Nove em cada dez requisitos comuns já têm solução madura: câmera (expo-camera / react-native-vision-camera), BLE (react-native-ble-plx), geolocalização (expo-location), push (expo-notifications), arquivos (expo-file-system), biometria (expo-local-authentication), sensors (expo-sensors).
        </p>
        <Callout tone="info">
          Pergunta de teste: "essa lib tem mais de 500 downloads/semana e commit nos últimos 6 meses?". Se sim, economiza semanas. Se não, avalie escrever versão minimalista própria em vez de adotar lib abandonada.
        </Callout>
      </Section>

      <Section title="Quando escrever native module próprio" accent={accent}>
        <p>Três cenários realistas:</p>
        <CodeBlock lang="ts">{`// 1. SDK de parceiro sem wrapper RN
//    Ex.: gateway de pagamento local que só entrega .xcframework + .aar,
//    sem react-native-package publicado.

// 2. Performance crítica de operação cara
//    Ex.: processamento de frame de câmera em tempo real (ML on-device),
//    parser binário pesado que em JS seria lento demais.

// 3. API de sistema recente sem lib
//    Ex.: feature iOS/Android anunciada essa semana e você quer usar antes
//    da comunidade publicar lib.`}</CodeBlock>
      </Section>

      <Section title="Expo Modules API: caminho recomendado" accent={accent}>
        <p>
          A Expo Modules API (expo-modules-core) é a forma moderna de escrever native module com Kotlin/Swift idiomático, definindo interface declarativamente. Bem mais direto que a API legada de React Native.
        </p>
        <CodeBlock lang="kotlin">{`// android/src/main/java/expo/modules/contador/ContadorModule.kt
package expo.modules.contador

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.SharedPreferences
import android.content.Context

class ContadorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Contador")

    Function("incrementar") { chave: String ->
      val prefs = prefs()
      val novo = prefs.getInt(chave, 0) + 1
      prefs.edit().putInt(chave, novo).apply()
      novo
    }

    AsyncFunction("lerTotal") { chave: String ->
      prefs().getInt(chave, 0)
    }
  }

  private fun prefs(): SharedPreferences =
    appContext.reactContext!!.getSharedPreferences('ffv_contador', Context.MODE_PRIVATE)
}`}</CodeBlock>
        <CodeBlock lang="swift">{`// ios/ContadorModule.swift
import ExpoModulesCore

public class ContadorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Contador")

    Function("incrementar") { (chave: String) -> Int in
      let d = UserDefaults.standard
      let novo = d.integer(forKey: chave) + 1
      d.set(novo, forKey: chave)
      return novo
    }

    AsyncFunction("lerTotal") { (chave: String) -> Int in
      UserDefaults.standard.integer(forKey: chave)
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Consumir do lado JS com tipos" accent={accent}>
        <CodeBlock lang="ts">{`// modules/contador/index.ts
import { requireNativeModule } from 'expo-modules-core';

interface ContadorNative {
  incrementar(chave: string): number;
  lerTotal(chave: string): Promise<number>;
}

const Contador = requireNativeModule<ContadorNative>('Contador');
export default Contador;

// App.tsx
import Contador from './modules/contador';
const total = Contador.incrementar('pedidos'); // sync, retorna number
const atual = await Contador.lerTotal('pedidos');`}</CodeBlock>
      </Section>

      <Section title="Config plugin pra distribuição" accent={accent}>
        <p>
          Escreva o módulo como lib local com config plugin. No app.config.ts adiciona <code>'./modules/contador/plugin'</code>. No prebuild, o plugin registra o módulo, copia arquivos, ajusta AndroidManifest/Info.plist. Todo o time roda um comando e tem o mesmo ambiente.
        </p>
        <Callout tone="success" icon="✅">
          Módulo distribuível via plugin é reproduzível em CI, em máquina nova, em fork. Quem abrir o projeto em 2028 ainda consegue rodar sem arqueologia.
        </Callout>
      </Section>

      <Section title="Teste em device real" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Simulador iOS e emulador Android mentem: faltam sensores, bluetooth, câmera real, dispositivos em idle com bateria fraca. Antes de declarar pronto, rode em pelo menos um iPhone e um Android físico. Problemas típicos: permissions, threading em main vs background, memory pressure que só aparece em device.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
