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
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaShieldAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { MdMoreVert, MdDashboard } from 'react-icons/md';


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
type ActiveTab = 'all' | 'admin' | 'moderator' | 'user';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const usersPerPage = 10;

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

  // Calculate stats
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    user: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  // Filter users based on active tab
  const getFilteredByTab = () => {
    if (activeTab === 'all') return users;
    return users.filter(u => u.role === activeTab);
  };

  // Apply search and status filter
  const filteredUsers = getFilteredByTab()
    .filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase() || '');

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesStatus;
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

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

  // Get role icon and color
  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'admin':
        return { icon: <FaUserShield />, bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'moderator':
        return { icon: <FaUserTie />, bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      default:
        return { icon: <FaUser />, bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
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

  // Tab change handler
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MdDashboard className="text-gray-800" />
                User Management
              </h1>
              <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <FaFilter />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <FaUsers className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaUserShield className="text-red-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Moderators</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moderator}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaUserTie className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.user}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUser className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaEye className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaEyeSlash className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {(showFilters || searchTerm) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        )}

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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px space-x-8">
            {[
              { id: 'all', label: 'All Users', count: stats.total, icon: <FaUsers /> },
              { id: 'admin', label: 'Admins', count: stats.admin, icon: <FaUserShield /> },
              { id: 'moderator', label: 'Moderators', count: stats.moderator, icon: <FaUserTie /> },
              { id: 'user', label: 'Users', count: stats.user, icon: <FaUser /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as ActiveTab)}
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
                    >
                      User {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
                    >
                      Email {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
                    >
                      Role {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-2 text-white font-semibold hover:text-gray-200 transition"
                    >
                      Status {getSortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaUsers className="text-5xl mb-4 opacity-25" />
                        <p className="text-lg font-medium text-gray-500">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => {
                    const roleDetails = getRoleDetails(user.role);
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.phone || '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-600">{user.email}</p>
                        </td>

                        <td className="px-6 py-4">
                          {editingRoles[user._id] !== undefined ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editingRoles[user._id]}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
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
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleDetails.bg} ${roleDetails.text}`}>
                                {user.role.toUpperCase()}
                              </span>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isActive)}
                              disabled={user._id === session?.user.id}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-gray-800 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaChevronRight size={16} />
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
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
                  <h4 className="text-lg font-bold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <div className="flex items-center gap-2">
                      {getRoleDetails(selectedUser.role).icon}
                      <span className="font-medium text-gray-900 capitalize">{selectedUser.role}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-500 mb-2">User ID</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200 text-gray-600">
                    {selectedUser._id}
                  </p>
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
                Edit Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}