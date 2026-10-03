import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchAdminUsers,
  createAdminUserAsync,
  updateAdminUserAsync,
  toggleAdminUserStatusAsync,
  deleteAdminUserAsync,
  AdminUser,
  AdminUserInput,
} from '@/store/slices/adminUsersSlice';
import { UserCog, Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/common/Pagination';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import AdminUserModal from '@/components/modals/AdminUserModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case 'manager':
      return <ShieldCheck className="h-4 w-4 text-primary" />;
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
};

const getRoleBadge = (role: string) => {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    staff: 'Staff',
  };
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    super_admin: 'destructive',
    manager: 'default',
    staff: 'secondary',
  };
  return (
    <Badge variant={variants[role]} className="gap-1">
      {getRoleIcon(role)}
      {labels[role]}
    </Badge>
  );
};

const AdminUsers = () => {
  const dispatch = useAppDispatch();
  const { items: adminUsers, loading } = useAppSelector((state) => state.adminUsers);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const totalPages = Math.ceil(adminUsers.length / ITEMS_PER_PAGE);
  const paginatedAdminUsers = adminUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (mode: 'edit' | 'add', user: AdminUser | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSave = async (input: AdminUserInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createAdminUserAsync(input)).unwrap();
        toast({ title: 'Admin added', description: 'New admin user has been created.' });
      } else if (selectedUser) {
        await dispatch(updateAdminUserAsync({ id: selectedUser.id, input: { name: input.name, role: input.role } })).unwrap();
        toast({ title: 'Admin updated', description: 'Admin user has been updated.' });
      }
      setModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Something went wrong'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await dispatch(toggleAdminUserStatusAsync(user)).unwrap();
      toast({ title: 'Status updated', description: `${user.name}'s access has been updated.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update status'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteAdminUserAsync(userToDelete)).unwrap();
        toast({ title: 'Admin removed', description: 'The admin user has been removed.', variant: 'destructive' });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete admin user'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Admin Users
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage admin access and roles
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Role Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Super Admins</p>
              <h3 className="text-2xl font-bold">
                {adminUsers.filter((u) => u.role === 'super_admin').length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Managers</p>
              <h3 className="text-2xl font-bold">
                {adminUsers.filter((u) => u.role === 'manager').length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Staff Members</p>
              <h3 className="text-2xl font-bold">
                {adminUsers.filter((u) => u.role === 'staff').length}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && adminUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAdminUsers.map((user) => (
                <TableRow key={user.id} className="table-row">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(user)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal('edit', user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={user.role === 'super_admin'}
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={adminUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="admin users"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <h4 className="font-medium">Super Admin</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full system access</li>
                <li>• Manage all admins</li>
                <li>• Configure settings</li>
                <li>• Access all reports</li>
                <li>• Delete any data</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Manager</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage products</li>
                <li>• Manage orders</li>
                <li>• View reports</li>
                <li>• Manage customers</li>
                <li>• Create promotions</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-medium">Staff</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View products</li>
                <li>• Process orders</li>
                <li>• Update inventory</li>
                <li>• View customers</li>
                <li>• Limited reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AdminUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Admin"
        description="Are you sure you want to remove this admin user? This action cannot be undone."
      />
    </div>
  );
};

export default AdminUsers;
