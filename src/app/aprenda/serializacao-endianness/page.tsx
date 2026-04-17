import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'Serialização, endianness, UTF-8: os bytes que viajam — FFV Academy',
  description: 'Por que "olá" tem bytes diferentes em UTF-8 e Latin-1. Big-endian vs little-endian. JSON vs Protobuf vs MessagePack — trade-offs de serialização.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que a string "olá" em Python não pode ser simplesmente enviada pela rede sem encoding explícito?',
    options: [
      'Python não permite enviar strings pela rede — apenas bytes',
      'Strings Python são sequências de code points Unicode (conceitos abstratos), não bytes. Para transmitir, você deve escolher um encoding que mapeia code points para bytes: UTF-8 (variável: "olá" = 4 bytes), Latin-1 (fixo 1 byte/char mas "á" não existe em ASCII). Sem encoding, não há bytes para transmitir. `"olá".encode("utf-8")` = b\'ol\\xc3\\xa1\' (4 bytes).',
      'Strings podem ser enviadas diretamente — o Python faz encoding automaticamente',
      'O problema é apenas com caracteres especiais — ASCII funciona sem encoding',
    ],
    correct: 1,
    explanation: 'Unicode separa "o que é o caractere" (code point, ex: U+00E1 = á) de "como armazenar em bytes" (encoding). UTF-8 é self-synchronizing (você pode encontrar o início de qualquer caractere olhando apenas para o byte), compatível com ASCII (bytes 0-127 são iguais), e o encoding dominante na web. UTF-16 é usado internamente pelo Windows e Java. BOM (Byte Order Mark) indica endianness do UTF-16.',
  },
  {
    question: 'O que é endianness e por que importa para comunicação entre sistemas?',
    options: [
      'Endianness é apenas o nome do criador do formato — sem impacto técnico',
      'Endianness define a ordem dos bytes de um valor multi-byte: big-endian guarda o byte mais significativo primeiro (ex: 0x1234 como [0x12, 0x34]); little-endian guarda o menos significativo primeiro ([0x34, 0x12]). x86/ARM são little-endian. Rede TCP/IP usa big-endian ("network byte order"). Se dois sistemas com endianness diferente comunicam sem converter, os valores ficam invertidos.',
      'Endianness afeta apenas CPUs antigas — todos os sistemas modernos são big-endian',
      'Endianness é resolvido automaticamente pelo protocolo TCP',
    ],
    correct: 1,
    explanation: 'htons/htonl (host-to-network-short/long) converte para network byte order. Em Python: struct.pack(">I", 1234) = big-endian, struct.pack("<I", 1234) = little-endian. Protobuf usa little-endian internamente. JSON não tem problema de endianness (texto). SQLite usa little-endian. PostgreSQL usa big-endian no protocolo de rede. Arquivos de audio/video (WAV, BMP) especificam endianness no header.',
  },
  {
    question: 'Por que Protobuf é mais eficiente que JSON para comunicação de alta frequência?',
    options: [
      'Protobuf usa compressão automática que JSON não tem',
      'JSON é texto: toda serialização/deserialização analisa strings caractere por caractere. Números como 1234567 viram "1234567" (7 bytes + parsing). Protobuf é binário: usa varint encoding (1-7 bytes para números pequenos), elimina field names (usa tags inteiras), sem parsing de texto. Resultado: 3-10x menor em tamanho, 10-100x mais rápido para parse. Custo: necessita de schema (.proto) e não é legível.',
      'Protobuf usa memória compartilhada enquanto JSON usa rede',
      'Protobuf é apenas mais rápido para mensagens grandes (>1MB)',
    ],
    correct: 1,
    explanation: 'Benchmarks típicos: serialize/deserialize 1M mensagens. JSON: ~2s parse + ~5s serialize. Protobuf: ~0.1s + ~0.2s. MessagePack: ~0.5s + ~1s (binário mas sem schema). Para APIs públicas (legibilidade importa, frequência < 1k req/s): JSON. Para microserviços internos (latência crítica): gRPC/Protobuf. Para cache: MessagePack ou CBOR. Para análise de dados: Parquet (colunar) ou Arrow.',
  },
];

export default function SerializacaoEndianessPage() {
  return (
    <ModuleLayout
      slug="serializacao-endianness"
      title="Serialização, endianness, UTF-8: os bytes que viajam"
      icon="📡"
      xp={55}
      readTime={11}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="tempo-clocks-ntp"
      nextTitle="Tempo distribuído: NTP, clock skew, monotonic vs wall"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Dados precisam ser convertidos para bytes para viajar pela rede ou ser armazenados. Serialização parece trivial até você debugar uma corrupção de dados entre sistemas com endianness diferente, ou descobrir que um encoding errado transformou "olá" em "ol\xc3\xa1" no banco.
      </p>

      <Section accent={accent} title="Unicode e encodings: separar conceito de representação">
        <CodeBlock>{`# Unicode: code points abstratos
s = "olá mundo"
print(len(s))           # 9 caracteres (code points)
print(s[2])             # "á" — código U+00E1

# UTF-8: encoding de comprimento variável (1-4 bytes por code point)
b_utf8 = s.encode("utf-8")
print(b_utf8)           # b'ol\xc3\xa1 mundo' — "á" = 2 bytes (0xC3 0xA1)
print(len(b_utf8))      # 10 bytes (9 chars + 1 extra byte para "á")

# Latin-1 (ISO-8859-1): 1 byte por char, apenas 256 caracteres
b_latin1 = s.encode("latin-1")
print(b_latin1)         # b'ol\xe1 mundo' — "á" = 1 byte (0xE1)
print(len(b_latin1))    # 9 bytes

# UTF-16: 2 bytes por char (BOM indica endianness)
b_utf16 = s.encode("utf-16")
print(b_utf16[:4])      # b'\xff\xfe' = BOM little-endian + primeiros bytes

# Detectar encoding:
import chardet
resultado = chardet.detect(b_utf8)
print(resultado)   # {'encoding': 'utf-8', 'confidence': 0.99}

# Unicode normalization: mesma string, bytes diferentes!
# "á" pode ser: U+00E1 (precomposta) ou U+0061 + U+0301 (a + combining accent)
import unicodedata
s1 = "\u00e1"       # "á" precomposta
s2 = "a\u0301"      # "a" + acento combinando
print(s1 == s2)     # False! mesma aparência, bytes diferentes
print(s1 == unicodedata.normalize("NFC", s2))  # True (normaliza para NFC)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Endianness: a ordem dos bytes">
        <CodeBlock>{`import struct

# Big-endian (network byte order) vs little-endian
numero = 0x12345678

# Big-endian: byte mais significativo primeiro
be = struct.pack(">I", numero)   # > = big-endian, I = unsigned int 4 bytes
print(be.hex())   # 12345678

# Little-endian: byte menos significativo primeiro
le = struct.pack("<I", numero)   # < = little-endian
print(le.hex())   # 78563412  ← invertido!

# x86/ARM são little-endian:
import sys
print(sys.byteorder)   # 'little'

# Rede TCP/IP usa big-endian (network byte order):
import socket
# Converter int para network byte order:
print(socket.htons(0x1234).to_bytes(2, 'big').hex())  # 1234 (já big-endian)

# struct.pack: pacotes binários para protocolo de rede
# ">HHI" = big-endian, unsigned short, unsigned short, unsigned int
header = struct.pack(">HHI", 0x0001, 0x0002, 0x12345678)
print(header.hex())   # 000100021234567

# Desempacotar:
version, msg_type, length = struct.unpack(">HHI", header)
print(version, msg_type, length)   # 1 2 305419896`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Formatos de serialização: comparação real">
        <ComparisonTable
          headers={['Formato', 'Tipo', 'Tamanho relativo', 'Parse speed', 'Schema?', 'Legível?']}
          rows={[
            ['JSON', 'Texto', '100% (baseline)', 'Lento', 'Não', 'Sim'],
            ['XML', 'Texto', '150-300%', 'Muito lento', 'XSD opcional', 'Sim'],
            ['MessagePack', 'Binário', '~50%', 'Rápido', 'Não', 'Não'],
            ['CBOR', 'Binário', '~50%', 'Rápido', 'Não', 'Não'],
            ['Protobuf', 'Binário', '~30%', 'Muito rápido', 'Sim (.proto)', 'Não'],
            ['Avro', 'Binário', '~30%', 'Muito rápido', 'Sim (JSON schema)', 'Não'],
            ['Parquet', 'Binário colunar', '~10-20%', 'Muito rápido', 'Sim', 'Não'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import json, struct, time

dados = {"id": 12345, "nome": "Fernando", "ativo": True, "score": 98.7}

# JSON: texto legível mas parsing lento
json_bytes = json.dumps(dados).encode()
print(f"JSON: {len(json_bytes)} bytes")    # ~50 bytes

# struct: binário fixo, sem nomes de campo
# ">IH?f" = big-endian: int(4), short(2), bool(1), float(4) = 11 bytes
binario = struct.pack(">IH?f", 12345, len("Fernando"), True, 98.7)
print(f"struct: {len(binario)} bytes")     # 11 bytes — 5x menor

# msgpack: binário flexível com nomes de campo
# pip install msgpack
import msgpack
mp_bytes = msgpack.packb(dados)
print(f"msgpack: {len(mp_bytes)} bytes")   # ~30 bytes — sem overhead de texto

# Protobuf (pip install protobuf + arquivo .proto):
# message Dados { int32 id = 1; string nome = 2; bool ativo = 3; float score = 4; }
# pb_bytes = Dados(id=12345, nome="Fernando", ativo=True, score=98.7).SerializeToString()
# ~20 bytes — mais compacto ainda`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Decisão prática:</strong> JSON para APIs públicas e debugging (legibilidade {'>'} performance). MessagePack/CBOR para cache e APIs internas (binário sem schema). Protobuf/gRPC para microserviços de alta frequência (schema + performance). Parquet/Arrow para analytics e data pipelines (colunar = compressão máxima). Sempre use UTF-8 para texto — é o padrão universal.
      </Callout>

      <Callout>
        Próximo: <strong>Tempo distribuído</strong> — NTP, clock skew, e por que nunca usar wall clock para medir duração.
      </Callout>
    </div>
  );
}
