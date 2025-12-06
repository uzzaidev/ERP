'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Lock, Users, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  tenant_id: string;
}

interface TenantInviteInfo {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  invite_url: string;
  plan: string;
  status: string;
}

interface Invitation {
  id: string;
  email: string;
  role_name: string;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by_user?: {
    full_name: string;
  };
}

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inviteInfo, setInviteInfo] = useState<TenantInviteInfo | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('dev');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Cancel invitation state
  const [cancelError, setCancelError] = useState('');
  
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch current user
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      
      if (userData.success && userData.user) {
        setUser(userData.user);
        setProfileName(userData.user.full_name || '');
        setProfilePhone(userData.user.phone || '');
      }

      // Try to fetch invite info (only works for admins)
      const inviteRes = await fetch('/api/tenants/invite-code');
      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        if (inviteData.success) {
          setInviteInfo(inviteData.data);
          setIsAdmin(true);
          
          // Fetch invitations list
          const invitationsRes = await fetch('/api/tenants/invitations');
          const invitationsData = await invitationsRes.json();
          if (invitationsData.success) {
            setInvitations(invitationsData.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileName,
          phone: profilePhone || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProfileSuccess('Perfil atualizado com sucesso!');
        setUser(data.data);
      } else {
        setProfileError(data.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Erro ao atualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setInviteLoading(true);

    try {
      const res = await fetch('/api/tenants/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role_name: inviteRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setInviteSuccess(`Convite enviado para ${inviteEmail}!`);
        setInviteEmail('');
        fetchUserData(); // Refresh invitations list
      } else {
        setInviteError(data.error || 'Erro ao enviar convite');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setInviteError('Erro ao enviar convite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelError('');
    try {
      const res = await fetch(`/api/tenants/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        fetchUserData(); // Refresh invitations list
      } else {
        setCancelError(data.error || 'Erro ao cancelar convite');
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      setCancelError('Erro ao cancelar convite');
    }
  };

  const copyInviteUrl = () => {
    if (inviteInfo?.invite_url) {
      navigator.clipboard.writeText(inviteInfo.invite_url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Perfil do Usuário</CardTitle>
            </div>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}
              {profileSuccess && (
                <Alert>
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Alterar Senha</CardTitle>
            </div>
            <CardDescription>
              Mantenha sua conta segura com uma senha forte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              {passwordSuccess && (
                <Alert>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Only - Tenant Info & Invitations */}
        {isAdmin && inviteInfo && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Informações da Empresa</CardTitle>
                </div>
                <CardDescription>
                  Compartilhe o código da empresa para convidar usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ID da Empresa</Label>
                  <div className="flex gap-2">
                    <Input value={inviteInfo.tenant_id} disabled className="font-mono text-sm" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteInfo.tenant_id);
                        alert('ID copiado para a área de transferência!');
                      }}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID único da empresa. Compartilhe com novos usuários para registro.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input value={inviteInfo.tenant_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Código da Empresa</Label>
                  <Input value={inviteInfo.tenant_slug} disabled />
                </div>
                <div className="space-y-2">
                  <Label>URL de Convite</Label>
                  <div className="flex gap-2">
                    <Input value={inviteInfo.invite_url} disabled />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyInviteUrl}
                      className="shrink-0"
                    >
                      {copiedUrl ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plano</Label>
                    <Input value={inviteInfo.plan} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input value={inviteInfo.status} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Convidar Usuários</CardTitle>
                </div>
                <CardDescription>
                  Envie convites por email para novos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="usuario@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Função</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="invite-role">
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
                  {inviteError && (
                    <Alert variant="destructive">
                      <AlertDescription>{inviteError}</AlertDescription>
                    </Alert>
                  )}
                  {inviteSuccess && (
                    <Alert>
                      <AlertDescription>{inviteSuccess}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </form>

                {/* Cancel Error Alert */}
                {cancelError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{cancelError}</AlertDescription>
                  </Alert>
                )}

                {/* Invitations List */}
                {invitations.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="font-semibold">Convites Pendentes</h3>
                    <div className="space-y-2">
                      {invitations
                        .filter((inv) => inv.status === 'pending')
                        .map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {invitation.role_name} • Enviado em{' '}
                                {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
