'use client';

/**
 * Anexos da demonstração: o arquivo fica no navegador de quem testa, e só nele.
 *
 * A versão anterior subia para `/api/upload`, que gravava em `public/uploads`. Isso
 * tinha dois problemas. Na Vercel o disco é somente leitura em execução, então nada
 * era gravado. E o que fosse gravado ficaria numa URL pública, sem autenticação — a
 * plataforma exibiria um aviso de guarda de dados pessoais para um arquivo aberto na
 * internet.
 *
 * Aqui o arquivo vira data URL e é guardado junto da mensagem, no mesmo `localStorage`
 * onde já vivem os casos e as conversas. Funciona na Vercel porque não há servidor
 * envolvido, e cumpre o que a plataforma promete: os dados ficam no seu navegador.
 *
 * O preço é o espaço. `localStorage` dá cerca de 5 MB por origem, e strings contam em
 * UTF-16, então cada caractere de base64 custa 2 bytes. Por isso imagem é reduzida
 * antes de guardar, e há um teto por anexo e um teto de ocupação total.
 */

/** Teto por anexo, já em data URL. Acima disso guardamos só o nome. */
export const LIMITE_ANEXO = 320 * 1024;

/** Acima disso paramos de aceitar anexos, para não derrubar o resto da demonstração. */
export const LIMITE_TOTAL = 3.5 * 1024 * 1024;

const LADO_MAXIMO = 1280;
const QUALIDADES = [0.65, 0.5, 0.4];

export interface AnexoPreparado {
  nome: string;
  /** Conteúdo em data URL. Ausente quando o arquivo não coube. */
  url?: string;
  /** Por que não coube, para a tela poder dizer em vez de falhar em silêncio. */
  motivo?: string;
}

const ehImagem = (f: File) => f.type.startsWith('image/');

/** Quanto o `localStorage` desta origem já ocupa, em bytes de UTF-16. */
export function espacoOcupado(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const chave = window.localStorage.key(i);
    if (!chave) continue;
    total += (chave.length + (window.localStorage.getItem(chave)?.length ?? 0)) * 2;
  }
  return total;
}

function lerComoDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

/** Custo real da string no `localStorage`: UTF-16, dois bytes por caractere. */
const custo = (dataUrl: string) => dataUrl.length * 2;

async function reduzirImagem(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement('canvas');
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close?.();

  for (const q of QUALIDADES) {
    const url = tela.toDataURL('image/jpeg', q);
    if (custo(url) <= LIMITE_ANEXO) return url;
  }
  return null;
}

/**
 * Prepara o arquivo escolhido para virar anexo da mensagem.
 *
 * Nunca lança: quando o arquivo não cabe, devolve o nome sem conteúdo e o motivo.
 * A conversa continua fazendo sentido — o advogado vê que algo foi enviado e por que
 * não dá para abrir aqui.
 */
export async function prepararAnexo(file: File): Promise<AnexoPreparado> {
  if (espacoOcupado() > LIMITE_TOTAL) {
    return {
      nome: file.name,
      motivo: 'O espaço da demonstração neste navegador acabou. Use "Reiniciar dados da demonstração" na tela inicial.',
    };
  }

  if (ehImagem(file)) {
    const reduzida = await reduzirImagem(file);
    if (reduzida) return { nome: file.name, url: reduzida };
    return { nome: file.name, motivo: 'Imagem grande demais para guardar nesta demonstração.' };
  }

  // Não-imagem não dá para reduzir. Base64 cresce ~4/3, e cada caractere custa 2 bytes.
  if (file.size * (4 / 3) * 2 > LIMITE_ANEXO) {
    return {
      nome: file.name,
      motivo: 'Arquivo grande demais para guardar nesta demonstração. Em produção ele iria para armazenamento externo.',
    };
  }

  try {
    const url = await lerComoDataURL(file);
    if (custo(url) > LIMITE_ANEXO) {
      return { nome: file.name, motivo: 'Arquivo grande demais para guardar nesta demonstração.' };
    }
    return { nome: file.name, url };
  } catch {
    return { nome: file.name, motivo: 'Não foi possível ler o arquivo.' };
  }
}
