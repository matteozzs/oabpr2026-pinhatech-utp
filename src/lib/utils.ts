import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function agoraISO() {
  return new Date().toISOString();
}

export function formatarData(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...opts,
    });
  } catch {
    return iso;
  }
}

export function formatarDataHora(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function dataPorExtenso(d = new Date()) {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return { dia: String(d.getDate()), mes: meses[d.getMonth()], ano: String(d.getFullYear()) };
}

export function formatarMoeda(v?: number) {
  if (v === undefined || v === null || Number.isNaN(v)) return '';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function gerarId(prefixo = 'id') {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefixo}_${Date.now().toString(36).toUpperCase()}${rand}`;
}

/** Protocolo legível: OD-AAAA-NNNNNN */
export function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `OD-${ano}-${n}`;
}

/** SHA-256 (Web Crypto) — usado para carimbo de integridade dos aceites. */
export async function sha256(texto: string) {
  const enc = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizar(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function capitalizarNome(s: string) {
  return (s || '')
    .toLowerCase()
    .split(' ')
    .map((p) => (p.length > 2 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}

export function mascaraCPF(v: string) {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraTelefone(v: string) {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}
