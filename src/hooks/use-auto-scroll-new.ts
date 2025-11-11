import { useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  dependency?: any; // Dependência que triggera o scroll
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para obter o viewport do ScrollArea
  const getViewport = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return null;
    
    // Procurar pelo viewport do Radix UI ScrollArea
    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    return viewport;
  }, []);

  // Função para verificar se está próximo do bottom
  const isNearBottom = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return false;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold, getViewport]);

  // Função para fazer scroll até o bottom
  const scrollToBottom = useCallback(() => {
    const viewport = getViewport();
    if (!viewport || !enabled) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: behavior
    });
  }, [enabled, behavior, getViewport]);

  // Função para fazer scroll instantâneo
  const scrollToBottomInstant = useCallback(() => {
    const viewport = getViewport();
    if (!viewport || !enabled) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'auto'
    });
  }, [enabled, getViewport]);

  // Detectar quando o usuário está fazendo scroll manual
  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    const viewport = getViewport();
    if (!viewport) return;

    // Marcar que o usuário está fazendo scroll
    isUserScrollingRef.current = true;
    
    // Limpar timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Resetar após 1 segundo de inatividade
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 1000);
  }, [enabled, getViewport]);

  // Configurar listener de scroll
  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, getViewport]);

  // Auto-scroll quando a dependência mudar
  useEffect(() => {
    if (!enabled) return;
    
    // Pequeno delay para garantir que o DOM foi atualizado
    const timeoutId = setTimeout(() => {
      // Só fazer auto-scroll se o usuário não estiver fazendo scroll manual
      // e se estiver próximo do bottom
      if (!isUserScrollingRef.current && isNearBottom()) {
        scrollToBottom();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [dependency, enabled, isNearBottom, scrollToBottom]);

  return {
    scrollAreaRef,
    scrollToBottom,
    scrollToBottomInstant,
    isNearBottom
  };
}
