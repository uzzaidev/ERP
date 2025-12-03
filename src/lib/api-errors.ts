import { NextResponse } from 'next/server';

/**
 * Trata erros comuns de API de forma padronizada
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Erro customizado com código
  if (error instanceof Error) {
    const err = error as Error & { code?: string; needsSetup?: boolean };

    // Usuário sem tenant configurado
    if (err.code === 'TENANT_NOT_CONFIGURED' || err.needsSetup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tenant not configured',
          code: 'TENANT_NOT_CONFIGURED',
          message: 'Você precisa configurar sua empresa antes de acessar esta funcionalidade.',
          redirect: '/setup-tenant'
        },
        { status: 403 }
      );
    }

    // Não autenticado
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
          message: 'Você precisa fazer login para acessar esta funcionalidade.',
          redirect: '/login'
        },
        { status: 401 }
      );
    }

    // Usuário não encontrado no banco
    if (error.message === 'User not found in database') {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado. Por favor, faça logout e login novamente.',
          redirect: '/login'
        },
        { status: 404 }
      );
    }

    // Erro de acesso (tenant diferente)
    if (error.message.includes('Access denied')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          code: 'ACCESS_DENIED',
          message: 'Você não tem permissão para acessar este recurso.'
        },
        { status: 403 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }

  // Erro desconhecido
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}
