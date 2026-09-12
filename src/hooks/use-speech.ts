'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Transcrição de voz com a Web Speech API do navegador (pt-BR).
 * Roda 100% no cliente, sem custo e sem enviar áudio a servidor.
 * Funciona no Chrome/Edge (desktop e Android). Safari tem suporte parcial.
 */

type Reconhecimento = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function obterConstrutor(): (new () => Reconhecimento) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecimento; webkitSpeechRecognition?: new () => Reconhecimento };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const semSubscribe = () => () => {};

export function useSpeech(aoTexto: (texto: string) => void) {
  // Suporte é uma propriedade do ambiente: lida como "fonte externa" (false no servidor).
  const suportado = useSyncExternalStore(semSubscribe, () => Boolean(obterConstrutor()), () => false);
  const [ouvindo, setOuvindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [parcial, setParcial] = useState('');
  const recRef = useRef<Reconhecimento | null>(null);
  const cbRef = useRef(aoTexto);

  useEffect(() => {
    cbRef.current = aoTexto;
  }, [aoTexto]);

  const parar = useCallback(() => {
    recRef.current?.stop();
    setOuvindo(false);
  }, []);

  const iniciar = useCallback(() => {
    const Ctor = obterConstrutor();
    if (!Ctor) {
      setErro('Seu navegador não suporta transcrição de voz. Use o Chrome ou digite o relato.');
      return;
    }
    setErro(null);
    const rec = new Ctor();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalTxt = '';
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalTxt += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      if (finalTxt) cbRef.current(finalTxt);
      setParcial(interim);
    };
    rec.onerror = (e) => {
      setErro(e.error === 'not-allowed' ? 'Permita o uso do microfone para gravar o relato.' : `Erro na transcrição: ${e.error}`);
      setOuvindo(false);
    };
    rec.onend = () => {
      setOuvindo(false);
      setParcial('');
    };
    recRef.current = rec;
    rec.start();
    setOuvindo(true);
  }, []);

  useEffect(() => {
    const atual = recRef;
    return () => atual.current?.stop();
  }, []);

  return { suportado, ouvindo, erro, parcial, iniciar, parar };
}
