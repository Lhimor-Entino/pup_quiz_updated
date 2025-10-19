import React, { useState } from 'react';
import { Search, User, Clock, MapPin, Calendar, Filter, BanIcon, UserRoundCheckIcon, Hash } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
type Props = {}

const PreRegistrationLogs = (props: Props) => {
    const { logs } = usePage().props
    const { auth } = usePage<PageProps>().props
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');

    const sessionData = logs
    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'Active Session';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const calculateDuration = (created, logout) => {
        if (!logout) return 'Active';
        const start = new Date(created);
        const end = new Date(logout);
        const diff = Math.abs(end - start);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    const getStatusBadge = (logoutTime) => {
        if (!logoutTime) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Ended
            </span>
        );
    };

    const filteredData = sessionData.filter(session => {
        const matchesSearch = session.participant.team.trim().toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            session.participant.team_leader.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())

        if (filterActive === 'all') return matchesSearch;
        if (filterActive === 'active') return matchesSearch && session.status === 2;
        if (filterActive === 'ended') return matchesSearch && session.status ===1;

        return matchesSearch;
    });
    function convertToPhilippineTime(utcDateString: string): string {
        const date = new Date(utcDateString);
        return date.toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // set to true if you want AM/PM
        });
    }
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 p-6">

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                            Pre Registration Logs

                        </h1>
                        <p className="text-gray-600">Monitor and track Pre Registration activity</p>
                       
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-gray-900">{sessionData?.filter(s => s.status == 1).length}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <BanIcon className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {sessionData?.filter(s => s.status == 2).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <UserRoundCheckIcon className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                      placeholder="Search by team name or team leader name..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                <select
                                    className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                                    value={filterActive}
                                    onChange={(e) => setFilterActive(e.target.value)}
                                >
                                    <option value="all">All Logs</option>
                                    <option value="active">Approved Only</option>
                                    <option value="ended">Rejected Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Session Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-red-500 to-amber-500">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Leader</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white w-fit truncate">Contact Number</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reject / Approved Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Comment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredData.map((session, index) => (
                                        <tr
                                            key={session.id}
                                            className={`hover:bg-red-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center w-fit truncate">
                                                    <div className="w-fit px-8 truncate h-8 bg-gradient-to-r from-red-400 to-amber-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                                        {session.participant.team}
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center w-fit truncate">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900 font-medium">{session.participant.team_leader}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                             <span className="text-gray-900 font-medium w-fit truncate">{session.participant.team_leader_email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900 font-mono">{session.participant.contact_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${session.status === 1
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {session.status === 1 ? 'Rejected': 'Approved'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900 text-sm">{formatDateTime(session.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                  <span className="text-gray-900 text-sm">{session.comment}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Showing {filteredData.length} of {sessionData.length} sessions
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>

    )
}

export default PreRegistrationLogs