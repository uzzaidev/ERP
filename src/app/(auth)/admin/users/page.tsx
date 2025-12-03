'use client';

// Force dynamic rendering for this admin page
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Mail, 
  Loader2, 
  CheckCircle2,
  Clock,
  XCircle,
  Copy
} from 'lucide-react';
import { useTenant, useTenantLimits } from '@/lib/hooks';

interface User {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role_name: string;
  status: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  invitation_link?: string;
}

interface AccessRequest {
  id: string;
  email: string;
  full_name: string;
  tenant_slug: string;
  status: string;
  message?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { tenant, user, isLoading } = useTenant();
  const { canAddUser, currentUsers, maxUsers } = useTenantLimits();

  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingAccessRequests, setLoadingAccessRequests] = useState(true);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role_name: 'dev',
    message: '',
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [createdInvitationLink, setCreatedInvitationLink] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      loadUsers();
      loadInvitations();
      loadAccessRequests();
    }
  }, [tenant]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/tenants/invitations');
      const data = await response.json();
      if (data.success) {
        setInvitations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const response = await fetch('/api/tenants/access-requests');
      const data = await response.json();
      if (data.success) {
        setAccessRequests(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load access requests:', error);
    } finally {
      setLoadingAccessRequests(false);
    }
  };

  const handleAccessRequest = async (requestId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const response = await fetch('/api/tenants/access-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, rejectionReason }),
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar listas
        loadAccessRequests();
        loadUsers();
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Error handling access request:', error);
      alert('Erro ao processar solicitação');
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);
    setInviteLoading(true);

    try {
      const response = await fetch('/api/tenants/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setInviteSuccess(true);
      setCreatedInvitationLink(data.data.invitation_link);
      setInviteForm({ email: '', role_name: 'dev', message: '' });
      loadInvitations();

      setTimeout(() => {
        setInviteDialogOpen(false);
        setInviteSuccess(false);
        setCreatedInvitationLink(null);
      }, 3000);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvitationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'accepted':
        return <Badge variant="default"><CheckCircle2 className="w-3 h-3 mr-1" />Aceito</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // TODO: Implement proper role-based access control
  // For now, allow access if user is authenticated and has a tenant
  if (!user || !tenant) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie usuários e convites para {tenant?.name}
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger disabled={!canAddUser} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Usuário
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
              <DialogDescription>
                Envie um convite por email para um novo membro da equipe
              </DialogDescription>
            </DialogHeader>

            {inviteSuccess ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Convite enviado com sucesso!
                  </AlertDescription>
                </Alert>
                {createdInvitationLink && (
                  <div className="space-y-2">
                    <Label>Link do Convite</Label>
                    <div className="flex gap-2">
                      <Input value={createdInvitationLink} readOnly />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyInvitationLink(createdInvitationLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Compartilhe este link com o usuário convidado
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                {inviteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{inviteError}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    required
                    disabled={inviteLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={inviteForm.role_name}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, role_name: value })
                    }
                    disabled={inviteLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="dev">Desenvolvedor</SelectItem>
                      <SelectItem value="juridico">Jurídico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem (Opcional)</Label>
                  <Input
                    id="message"
                    value={inviteForm.message}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, message: e.target.value })
                    }
                    disabled={inviteLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={inviteLoading}>
                  {inviteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold">
                {currentUsers} / {maxUsers}
              </p>
              {!canAddUser && (
                <p className="text-sm text-red-600 mt-1">Limite atingido</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Convites Pendentes</p>
              <p className="text-2xl font-bold">
                {invitations.filter((i) => i.status === 'pending').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plano</p>
              <p className="text-2xl font-bold capitalize">{tenant?.plan}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Requests Table */}
      {accessRequests.filter((r) => r.status === 'pending').length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Solicitações de Acesso Pendentes
            </CardTitle>
            <CardDescription>
              Usuários aguardando aprovação para acessar sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAccessRequests ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRequests
                    .filter((req) => req.status === 'pending')
                    .map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.full_name}</TableCell>
                        <TableCell>{req.email}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {req.message || <span className="text-gray-400 italic">Sem mensagem</span>}
                        </TableCell>
                        <TableCell>
                          {new Date(req.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAccessRequest(req.id, 'approve')}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Aprovar
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Motivo da rejeição (opcional):');
                                handleAccessRequest(req.id, 'reject', reason || undefined);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Ativos</CardTitle>
          <CardDescription>
            Lista de todos os usuários ativos na organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role_name}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Convites</CardTitle>
          <CardDescription>
            Lista de todos os convites enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead>Expira em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.role_name}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
