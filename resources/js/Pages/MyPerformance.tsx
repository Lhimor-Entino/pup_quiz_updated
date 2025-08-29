import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function MyPerformance() {
    return (
        <AuthenticatedLayout>
            <Head title="My Performance" />

            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 space-y-8">
                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-bold text-red-600">My Performance</h1>
                        <div className="w-full h-1 bg-red-600 mt-2"></div>
                    </div>

                    {/* Quiz History */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz History</h2>

                        {/* Table */}
                        <div className="overflow-auto bg-white rounded-lg shadow border border-gray-200">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Quiz Title</th>
                                        <th className="px-4 py-3">Quiz Code</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Date Taken</th>
                                        <th className="px-4 py-3">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-4 py-3">Ecosystem Quiz</td>
                                        <td className="px-4 py-3">EQ-1234</td>
                                        <td className="px-4 py-3">Biology</td>
                                        <td className="px-4 py-3">18/20</td>
                                        <td className="px-4 py-3">May 5, 2025</td>
                                        <td className="px-4 py-3 text-red-600 font-medium">Teacher Quiz</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">Photosynthesis Review</td>
                                        <td className="px-4 py-3">PR-5678</td>
                                        <td className="px-4 py-3">Science</td>
                                        <td className="px-4 py-3">15/20</td>
                                        <td className="px-4 py-3">May 3, 2025</td>
                                        <td className="px-4 py-3 text-yellow-500 font-medium">Self Practice</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">Grammar Check</td>
                                        <td className="px-4 py-3">GC-2345</td>
                                        <td className="px-4 py-3">English</td>
                                        <td className="px-4 py-3">20/25</td>
                                        <td className="px-4 py-3">April 28, 2025</td>
                                        <td className="px-4 py-3 text-red-600 font-medium">Teacher Quiz</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Download Button */}
                        <div className="mt-6 text-right">
                            <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
                                Download Performance Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
