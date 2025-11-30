# Otimizações de Performance do Kanban

## Problema Original
O drag-and-drop dos cards do Kanban estava **travado/com poucos FPS** durante o movimento, tornando a experiência ruim.

## Causa Raiz
1. **Re-renders excessivos** - Componentes re-renderizavam desnecessariamente durante o drag
2. **Funções inline** - Callbacks eram recriados em cada render
3. **Select dropdown inline** - O dropdown de assignee re-renderizava junto com o card
4. **Sensor muito sensível** - Distância de ativação de 8px era muito alta

## Soluções Implementadas

### 1. React.memo nos Componentes
**Antes:**
```tsx
export function KanbanCard({ card, onAssigneeChange }: KanbanCardProps) {
  // ...
}
```

**Depois:**
```tsx
export const KanbanCard = memo(function KanbanCard({ card, onAssigneeChange }: KanbanCardProps) {
  // ...
});
```

✅ **Impacto:** Componentes só re-renderizam quando props mudam

### 2. useCallback para Event Handlers
**Antes:**
```tsx
<div onClick={() => openCardModal(card)}>
  <select onChange={(e) => {
    e.stopPropagation();
    const userId = e.target.value || null;
    onAssigneeChange?.(card.id, userId);
  }}>
```

**Depois:**
```tsx
const handleCardClick = useCallback(() => {
  openCardModal(card);
}, [openCardModal, card]);

const handleAssigneeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
  e.stopPropagation();
  const userId = e.target.value || null;
  onAssigneeChange?.(card.id, userId);
}, [onAssigneeChange, card.id]);

<div onClick={handleCardClick}>
  <select onChange={handleAssigneeChange}>
```

✅ **Impacto:** Callbacks não são recriados em cada render, evitando re-renders em componentes filhos

### 3. Sensor de Drag Otimizado
**Antes:**
```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Muito alto
    },
  })
);
```

**Depois:**
```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3, // Mais responsivo
    },
  })
);
```

✅ **Impacto:** Drag ativa mais rápido, dando sensação de fluidez

### 4. Memoização de Handlers na Página Principal
**Antes:**
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  // ... lógica inline
};

const handleCardDrop = async (cardId: string, newStatus: string) => {
  // ... lógica inline
};
```

**Depois:**
```tsx
const handleCardDrop = useCallback(async (cardId: string, newStatus: string) => {
  // ... lógica
}, [cards, setCards]);

const handleDragEnd = useCallback((event: DragEndEvent) => {
  // ... lógica
}, [handleCardDrop]);
```

✅ **Impacto:** Funções não são recriadas, DndContext não re-renderiza desnecessariamente

## Arquivos Modificados

1. **src/components/kanban/kanban-card.tsx**
   - Adicionado `React.memo`
   - Adicionado `useCallback` para handlers
   - Otimizados event listeners

2. **src/components/kanban/kanban-column.tsx**
   - Adicionado `React.memo`
   - Componente não re-renderiza a menos que props mudem

3. **src/app/(auth)/kanban/page.tsx**
   - Adicionado `useCallback` para `handleDragEnd`
   - Adicionado `useCallback` para `handleCardDrop`
   - Adicionado `useCallback` para `handleAssigneeChange`
   - Reduzida distância de ativação do sensor (8px → 3px)
   - Corrigidos tipos para usar `full_name` (bonus fix)

## Resultado Esperado
- ✅ Drag-and-drop **fluido e suave**
- ✅ **60 FPS** durante o movimento dos cards
- ✅ Sem travamentos ou stuttering
- ✅ Resposta imediata ao começar a arrastar

## Como Testar
1. Acesse `http://localhost:3000/kanban`
2. Arraste um card entre colunas
3. Observe que o movimento agora está fluido, sem travamentos
4. Teste também o dropdown de assignee - deve abrir sem afetar a performance

## Conceitos React de Performance

### React.memo
- Evita re-renders se props não mudaram
- Usa comparação shallow (===) por padrão
- Ideal para componentes que recebem as mesmas props frequentemente

### useCallback
- Memoiza funções para evitar recriá-las
- Essencial quando passando callbacks como props
- Previne re-renders desnecessários em componentes filhos

### useMemo
- Memoiza valores calculados
- Evita recalcular a cada render
- Já estava sendo usado corretamente em `filteredCards`

## Performance Metrics (Estimativa)

| Métrica | Antes | Depois |
|---------|-------|--------|
| FPS durante drag | ~20-30 | ~60 |
| Re-renders por movimento | ~50-100 | ~5-10 |
| Tempo de resposta | ~100ms | ~16ms |
| Sensação do usuário | Travado | Fluido |

## Referências
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
- [dnd-kit Performance Guide](https://docs.dndkit.com/introduction/performance)
