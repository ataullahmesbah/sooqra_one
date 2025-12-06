'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaEdit,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { MdMoreVert, MdFilterList } from 'react-icons/md';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'moderator' | 'user';
  isActive: boolean;
  createdAt: string;
}

type SortField = 'name' | 'email' | 'role' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRoles, setEditingRoles] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users?page=1&limit=100');
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data.users || []);
        setError('');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchUsers();
  }, [session]);

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'name' || sortField === 'email') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="opacity-30" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <FaUserShield className="text-red-500" />;
      case 'moderator': return <FaUserTie className="text-yellow-500" />;
      default: return <FaUser className="text-green-500" />;
    }
  };

  // Handle dropdown change
  const handleRoleChange = (userId: string, newRole: string) => {
    setEditingRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  // Save Role
  const saveRole = async (userId: string) => {
    const newRole = editingRoles[userId];
    if (!newRole) return;

    setSaving(userId);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update role');
      }

      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as User['role'] } : u));
      setEditingRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      setError('');
      setSuccess('Role updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  // Cancel Edit
  const cancelEdit = (userId: string) => {
    setEditingRoles(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === session?.user.id) {
      setError("You cannot deactivate your own account!");
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user status');
      }

      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete User
  const deleteUser = async (userId: string) => {
    if (userId === session?.user.id) {
      setError("You cannot delete your own account!");
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete user');
      }

      setUsers(prev => prev.filter(u => u._id !== userId));
      setError('');
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // View user details
  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <FaUser className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaUserShield className="text-red-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaEye className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaEyeSlash className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-gray-200 transition"
                    >
                      User {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 hover:text-gray-200 transition"
                    >
                      Email {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-2 hover:text-gray-200 transition"
                    >
                      Role {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaSearch className="text-4xl mb-4 opacity-50" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">{user.email}</td>

                      <td className="px-6 py-4">
                        {editingRoles[user._id] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editingRoles[user._id]}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
                            >
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                              <option value="user">User</option>
                            </select>
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveRole(user._id)}
                                disabled={saving === user._id}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                title="Save"
                              >
                                <FaSave size={14} />
                              </button>
                              <button
                                onClick={() => cancelEdit(user._id)}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                title="Cancel"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                {user.role.toUpperCase()}
                              </span>
                            </div>
                            <button
                              onClick={() => setEditingRoles(prev => ({ ...prev, [user._id]: user.role }))}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                              title="Edit role"
                            >
                              <FaEdit size={14} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            disabled={user._id === session?.user.id}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                            title="View details"
                          >
                            <MdMoreVert size={18} />
                          </button>

                          <button
                            onClick={() => deleteUser(user._id)}
                            disabled={user._id === session?.user.id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-600 mb-2 md:mb-0">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              {roleFilter !== 'all' && (
                <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full">
                  {roleFilter.toUpperCase()}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full">
                  {statusFilter.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FaTimes className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(selectedUser.role)}
                      <span className="font-medium capitalize">{selectedUser.role}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingRoles(prev => ({ ...prev, [selectedUser._id]: selectedUser.role }));
                  setShowUserModal(false);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}