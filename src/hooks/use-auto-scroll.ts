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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para obter o viewport correto (ScrollArea ou container normal)
  const getScrollContainer = useCallback(() => {
    // Primeiro tentar o ScrollArea
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      // Procurar pelo viewport do Radix UI ScrollArea
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) return viewport;
      
      // Fallback para o próprio elemento se não encontrar viewport
      return scrollArea;
    }
    
    // Fallback para containerRef
    return containerRef.current;
  }, []);

  // Função para verificar se está próximo do bottom
  const isNearBottom = useCallback(() => {
    const container = getScrollContainer();
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold, getScrollContainer]);

  // Função para fazer scroll até o bottom
  const scrollToBottom = useCallback(() => {
    const container = getScrollContainer();
    if (!container || !enabled) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior
    });
  }, [enabled, behavior, getScrollContainer]);

  // Função para fazer scroll instantâneo
  const scrollToBottomInstant = useCallback(() => {
    const container = getScrollContainer();
    if (!container || !enabled) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'auto'
    });
  }, [enabled, getScrollContainer]);

  // Detectar quando o usuário está fazendo scroll manual
  useEffect(() => {
    const container = getScrollContainer();
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

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [getScrollContainer]);

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
    scrollAreaRef,
    scrollToBottom,
    scrollToBottomInstant,
    isNearBottom
  };
}
