import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <AuthenticatedLayout>
            <Head title="Privacy & Data" />

            <div className="py-12 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="space-y-6">
                        {/* Card 1 */}
                        <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Download Quiz History</h3>
                            <p className="text-gray-600">Export all activity as CSV or PDF</p>
                        </div>

                        {/* Card 2 */}
                        <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Export Performance Stats</h3>
                            <p className="text-gray-600">PDF export with graphs and data</p>
                        </div>

                        {/* Card 3 */}
                        <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Terms of Service</h3>
                            <p className="text-gray-600">Read our full terms and conditions of use.</p>
                        </div>

                        {/* Card 4 */}
                        <div className="border border-black rounded-[20px] p-6 bg-white shadow">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800 text-red-600">Delete Account</h3>
                            <p className="text-gray-600">Permanently delete your account and all data associated with it.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
