import { usePage } from '@inertiajs/react'
import React, { useState } from 'react';
import { Search, User, Clock, MapPin, Calendar, Filter, Eye, Ban, FileCheck2, Hash } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import axios from 'axios';
import Swal from 'sweetalert2';

type Props = {}

function ManagePreRegistration({ }: Props) {
    const { lobby, pre_registration } = usePage().props
    const sessionData = pre_registration
    const { auth } = usePage<PageProps>().props
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');


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

        const matchesSearch = session.team.trim().toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            session.team_leader.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())

        if (filterActive === 'all') return matchesSearch;
        if (filterActive === 'active') return matchesSearch && !session.logout_timestamp;
        if (filterActive === 'ended') return matchesSearch && session.logout_timestamp;

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

   const handleManage = async (action: "Reject" | "Approved", participant_id: string) => {
    const { value: comment } = await Swal.fire({
        title: `${action} Participant`,
        input: "textarea",
        inputLabel: "Enter your comment (optional)",
        inputPlaceholder: "Write your comment here...",
        inputAttributes: {
            "aria-label": "Write your comment here",
        },
        showCancelButton: true,
        confirmButtonText: `Yes, ${action}`,
        cancelButtonText: "Cancel",
        icon: action === "Reject" ? "warning" : "question",
        confirmButtonColor: action === "Reject" ? "#d33" : "#3085d6",
    });

    // Cancelled
    if (comment === undefined) return;

    const formData = new FormData();
    formData.append("lobby_id", lobby.id);
    formData.append("status", action === "Reject" ? "1" : "2");
    formData.append("participant_id", participant_id);
    formData.append("comment", comment || "");

    try {
        // 🌀 Show loader before the request
        Swal.fire({
            title: "Please wait...",
            text: `${action =="Approved" ? "Approv" :action  }ing participant...`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await axios.post("/manage-pre-registration", formData);

        // Close loader
        Swal.close();

        if (response.data.success) {
            document.getElementById(`pre-reg-${participant_id}`)?.remove();

            await Swal.fire({
                icon: "success",
                title: "Success!",
                text: response.data.message,
                confirmButtonColor: "#3085d6",
            });
        } else {
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: response.data.message || "Something went wrong.",
            });
        }
    } catch (error: any) {
        Swal.close();
        console.error(error.response?.data || error.message);

        await Swal.fire({
            icon: "error",
            title: "Request Failed",
            text: error.response?.data?.message || "Unable to process the request.",
        });
    }
};

    // Function to handle viewing files
    const handleViewFiles = (files) => {
        // files should be an array of file objects with properties: url, type, name
        // Example: [{ url: 'path/to/file.pdf', type: 'pdf', name: 'document.pdf' }]

        if (!files || files.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Files',
                text: 'No files available to view',
                confirmButtonColor: '#16a34a'
            });
            return;
        }

        // Generate HTML content for multiple files
        const filesHTML = files.map((file, index) => {
            if (file.type === 'pdf' || file.url.toLowerCase().endsWith('.pdf')) {
                return `
                <div class="mb-4 pb-4 border-b last:border-b-0">
                    <h4 class="font-semibold text-gray-700 mb-2">${file.name || 'Document ' + (index + 1)}</h4>
                    <iframe 
                        src="${file.url}" 
                        width="100%" 
                        height="500px" 
                        style="border: 1px solid #ddd; border-radius: 8px;"
                    ></iframe>
                    <a href="${file.url}" target="_blank" class="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                        Open in New Tab
                    </a>
                </div>
            `;
            } else if (file.type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.url)) {
                return `
                <div class="mb-4 pb-4 border-b last:border-b-0">
                    <h4 class="font-semibold text-gray-700 mb-2">${file.name || 'Image ' + (index + 1)}</h4>
                    <img 
                        src="${file.url}" 
                        alt="${file.name || 'Image'}" 
                        style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                    />
                    <a href="${file.url}" target="_blank" class="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                        View Full Size
                    </a>
                </div>
            `;
            } else {
                return `
                <div class="mb-4 pb-4 border-b last:border-b-0">
                    <h4 class="font-semibold text-gray-700 mb-2">${file.name || 'File ' + (index + 1)}</h4>
                    <p class="text-gray-600 mb-2">File type not supported for preview</p>
                    <a href="${file.url}" target="_blank" class="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                        Download File
                    </a>
                </div>
            `;
            }
        }).join('');

        Swal.fire({
            title: 'View Files',
            html: `
            <div style="max-height: 600px; overflow-y: auto; text-align: left;">
                ${filesHTML}
            </div>
        `,
            width: '80%',
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                popup: 'swal-wide',
                htmlContainer: 'swal-html-container'
            }
        });
    };


    return (
        <div><AuthenticatedLayout>

            <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 p-6">

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                            {lobby.name}
                        </h1>
                        <p className="text-gray-600">Manage Pre Registration</p>
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

                            {/* <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                <select
                                    className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                                    value={filterActive}
                                    onChange={(e) => setFilterActive(e.target.value)}
                                >
                                    <option value="all">All Sessions</option>
                                    <option value="active">Active Only</option>
                                    <option value="ended">Ended Only</option>
                                </select>
                            </div> */}
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white w-fit truncate">View Preview</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white w-fit truncate">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredData.map((session, index) => (
                                        <tr
                                            key={session.id}
                                            id={`pre-reg-${session.id}`}
                                            className={`hover:bg-red-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-fit px-8 truncate h-8 bg-gradient-to-r from-red-400 to-amber-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                                        {session.team}
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center w-fit truncate">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900 font-medium uppercase">{session.team_leader}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {session.team_leader_email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900 font-mono">{session.contact_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    size='sm'
                                                    className='bg-green-600 hover:bg-green-800'
                                                    onClick={() => {
                                                        const baseURL = window.location.origin + "/";
                                                          
                                                        // Example files array - replace with your actual data
                                                        const files = [
                                                            // {
                                                            //     url: 'https://example.com/document.pdf',
                                                            //     type: 'pdf',
                                                            //     name: 'Registration Form.pdf'
                                                            // },
                                                            {
                                                                url:'/storage/' + session.student_id,
                                                                type: 'image',
                                                                name: 'Valid Student Id'
                                                            },
                                                              {
                                                                url:'/storage/' + session.registration_form,
                                                                type: 'image',
                                                                name: 'Registration Form'
                                                            },
                                                              {
                                                                url:'/storage/' + session.consent_form,
                                                                type: 'image',
                                                                name: 'Consent Form'
                                                            }
                                                        ];
                                                        handleViewFiles(files);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 text-white" />
                                                    <span>View</span>
                                                </Button>

                                            </td>
                                            <td className="px-6 py-4 text-center flex justify-between">
                                                <Button size='sm' className='bg-blue-600 hover:bg-blue-800' onClick={() => handleManage("Approved", session.id)} >
                                                    <FileCheck2 className="w-4 h-4 text-white " />
                                                    <span >Approved</span>
                                                </Button>
                                                <Button size='sm' className='bg-red-600 hover:bg-red-800' onClick={() => handleManage("Reject", session.id)}  >
                                                    <Ban className="w-4 h-4 text-white " />
                                                    <span >Reject</span>
                                                </Button>
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
                            Showing {filteredData.length} of {sessionData.length} Registration
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
        </div>
    )
}

export default ManagePreRegistration