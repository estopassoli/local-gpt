import { useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  dependency?: any; // Dependência que triggera o scroll (ex: array de mensagens)
  behavior?: 'smooth' | 'auto';
  enabled?: boolean;
  threshold?: number; // Distância do bottom para considerar "no bottom"
}

export function useAutoScroll({
  dependency,
  behavior = 'smooth',
  enabled = true,
  threshold = 100
}: UseAutoScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar se está próximo do bottom
  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold]);

  // Função para fazer scroll até o bottom
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior
    });
  }, [enabled, behavior]);

  // Detectar quando o usuário está fazendo scroll manual
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Marcar que o usuário está fazendo scroll
      isUserScrollingRef.current = true;

      // Limpar timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Após 150ms sem scroll, considerar que parou
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll quando há mudanças na dependência
  useEffect(() => {
    if (!enabled) return;

    // Aguardar um tick para garantir que o DOM foi atualizado
    const timeoutId = setTimeout(() => {
      // Só faz auto-scroll se:
      // 1. O usuário não está fazendo scroll manual
      // 2. Está próximo do bottom (ou é a primeira vez)
      if (!isUserScrollingRef.current && isNearBottom()) {
        scrollToBottom();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [dependency, enabled, behavior, threshold, isNearBottom, scrollToBottom]);

  return {
    containerRef,
    scrollToBottom,
    isNearBottom
  };
}
